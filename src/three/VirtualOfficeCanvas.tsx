import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AIAgent, AgentId, OfficeSettings } from '../types';
import { buildVirtualOffice, OfficeEnvironment } from './officeBuilder';
import { buildCharacter, CharacterRig } from './characterBuilder';
import { playSound } from './audio';
import { 
  Compass, Eye, Volume2, VolumeX, Sun, Moon, 
  ChevronDown, ChevronUp, Users, Building2, Zap, RotateCcw
} from 'lucide-react';

interface VirtualOfficeProps {
  agents: Record<string, AIAgent>;
  settings: OfficeSettings;
  onSelectAgent: (agentId: AgentId) => void;
  onOpenMeetingRoom: () => void;
  onUpdateSettings?: (newSettings: Partial<OfficeSettings>) => void;
  activeExecutiveWorkflow?: boolean;
}

export const VirtualOfficeCanvas: React.FC<VirtualOfficeProps> = ({
  agents,
  settings,
  onSelectAgent,
  onOpenMeetingRoom,
  activeExecutiveWorkflow,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [activeCameraTarget, setActiveCameraTarget] = useState<string>('overview');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [dayNight, setDayNight] = useState<'day' | 'night'>('night');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // References to keep animation loop & controls stable
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const charactersRef = useRef<Map<AgentId, CharacterRig>>(new Map());
  const officeEnvRef = useRef<OfficeEnvironment | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(0, 24, 30));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Switch camera smoothly
  const focusRoom = useCallback((roomKey: string) => {
    setActiveCameraTarget(roomKey);
    if (soundEnabled) playSound.click();

    switch (roomKey) {
      case 'overview':
        targetCamPos.current.set(0, 24, 30);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'ceo':
        targetCamPos.current.set(-14, 5, -2);
        targetLookAt.current.set(-14, 1.2, -8);
        break;
      case 'cto':
        targetCamPos.current.set(14, 5, -2);
        targetLookAt.current.set(14, 1.2, -8);
        break;
      case 'coo':
        targetCamPos.current.set(-14, 5, 14);
        targetLookAt.current.set(-14, 1.2, 8);
        break;
      case 'cfo':
        targetCamPos.current.set(14, 5, 14);
        targetLookAt.current.set(14, 1.2, 8);
        break;
      case 'cmo':
        targetCamPos.current.set(0, 5, 8);
        targetLookAt.current.set(0, 1.2, 14);
        break;
      case 'boardroom':
        targetCamPos.current.set(0, 8, -6);
        targetLookAt.current.set(0, 1.2, -14);
        break;
      default:
        targetCamPos.current.set(0, 24, 30);
        targetLookAt.current.set(0, 0, 0);
    }
  }, [soundEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as instructed by Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(dayNight === 'night' ? 0x070B14 : 0x0F172A);
    scene.fog = new THREE.FogExp2(dayNight === 'night' ? 0x070B14 : 0x0F172A, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(0, 24, 30);
    cameraRef.current = camera;

    // 2. High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dayNight === 'night' ? 1.05 : 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Procedural Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback
    }

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent dipping beneath floor
    controls.minDistance = 3;
    controls.maxDistance = 55;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup (Key, Fill, Rim)
    const ambientLight = new THREE.HemisphereLight(
      dayNight === 'night' ? 0x38BDF8 : 0xFFFFFF,
      0x0F172A,
      dayNight === 'night' ? 0.6 : 0.85
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xF8FAFC, 1.4);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Warm accent light for boardroom
    const boardroomLight = new THREE.PointLight(0x6366F1, 2.5, 18);
    boardroomLight.position.set(0, 4, -14);
    scene.add(boardroomLight);

    // Cyan tech light for CTO lab
    const ctoLight = new THREE.PointLight(0x06B6D4, 2.2, 16);
    ctoLight.position.set(14, 3.5, -8);
    scene.add(ctoLight);

    // 6. Build Procedural Office Environment
    const office = buildVirtualOffice(settings.theme3D);
    officeEnvRef.current = office;
    scene.add(office.sceneGroup);

    // 7. Instantiate 5 C-Suite Executive Characters
    const charMap = new Map<AgentId, CharacterRig>();

    // Initial character positions
    const agentConfigs: Array<{
      id: AgentId;
      name: string;
      role: string;
      color: string;
      pos: [number, number, number];
      sitting: boolean;
    }> = [
      { id: 'ceo', name: 'Sophia Vance', role: 'CEO', color: '#3B82F6', pos: [-14, 0, -8], sitting: true },
      { id: 'cto', name: 'David Chen', role: 'CTO', color: '#06B6D4', pos: [14, 0, -8], sitting: true },
      { id: 'coo', name: 'Elena Rostova', role: 'COO', color: '#10B981', pos: [-14, 0, 8], sitting: true },
      { id: 'cfo', name: 'Marcus Sterling', role: 'CFO', color: '#F59E0B', pos: [14, 0, 8], sitting: true },
      { id: 'cmo', name: 'Aria Thorne', role: 'CMO', color: '#8B5CF6', pos: [0, 0, 14], sitting: true },
    ];

    agentConfigs.forEach((cfg) => {
      const char = buildCharacter(cfg.id, cfg.name, cfg.role, cfg.color, cfg.pos, cfg.sitting);
      charMap.set(cfg.id, char);
      scene.add(char.group);
    });
    charactersRef.current = charMap;

    // 8. Raycasting for object & agent interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersection with character rigs
      for (const [id, rig] of charMap.entries()) {
        const intersects = raycaster.intersectObjects(rig.group.children, true);
        if (intersects.length > 0) {
          if (soundEnabled) playSound.click();
          onSelectAgent(id);
          focusRoom(id);
          return;
        }
      }

      // Check boardroom table click
      if (officeEnvRef.current) {
        const boardIntersects = raycaster.intersectObjects(officeEnvRef.current.interactableObjects, true);
        if (boardIntersects.length > 0) {
          const hit = boardIntersects[0].object;
          if (hit.parent?.name === 'ceo_workstation') {
            onSelectAgent('ceo');
            focusRoom('ceo');
          } else if (hit.parent?.name === 'cto_workstation') {
            onSelectAgent('cto');
            focusRoom('cto');
          } else if (hit.parent?.name === 'coo_workstation') {
            onSelectAgent('coo');
            focusRoom('coo');
          } else if (hit.parent?.name === 'cfo_workstation') {
            onSelectAgent('cfo');
            focusRoom('cfo');
          } else if (hit.parent?.name === 'cmo_workstation') {
            onSelectAgent('cmo');
            focusRoom('cmo');
          }
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let foundAgent: string | null = null;
      for (const [id, rig] of charMap.entries()) {
        const intersects = raycaster.intersectObjects(rig.group.children, true);
        if (intersects.length > 0) {
          foundAgent = id;
          break;
        }
      }
      setHoveredAgent(foundAgent);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Keyboard navigation (WASD)
    const handleKeyDown = (e: KeyboardEvent) => {
      const panSpeed = 1.2;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        controls.target.z -= panSpeed;
        camera.position.z -= panSpeed;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        controls.target.z += panSpeed;
        camera.position.z += panSpeed;
      }
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        controls.target.x -= panSpeed;
        camera.position.x -= panSpeed;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        controls.target.x += panSpeed;
        camera.position.x += panSpeed;
      }
      if (e.key === 'h' || e.key === 'H') {
        setHudCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Continuous Animation Loop with Exponential Damping
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation towards target
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, targetCamPos.current.x, 3.5, delta);
        cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, targetCamPos.current.y, 3.5, delta);
        cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, targetCamPos.current.z, 3.5, delta);

        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetLookAt.current.x, 4.0, delta);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetLookAt.current.y, 4.0, delta);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetLookAt.current.z, 4.0, delta);

        controlsRef.current.update();
      }

      // Update character rigs (typing, breathing, thinking animations)
      charactersRef.current.forEach((rig) => {
        rig.updateAnimation(time, delta);

        // Typing kinematics if agent is working
        if (rig.status === 'working') {
          rig.leftArm.rotation.x = -Math.PI / 3 + Math.sin(time * 12) * 0.12;
          rig.rightArm.rotation.x = -Math.PI / 3 + Math.cos(time * 12) * 0.12;
        } else if (rig.status === 'thinking') {
          // Hand to chin thinking gesture
          rig.rightArm.rotation.x = -Math.PI / 2.2;
          rig.rightArm.rotation.z = -0.4;
          rig.head.rotation.z = Math.sin(time * 1.5) * 0.08;
        } else {
          // Idle rest
          rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 4, delta);
          rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0, 4, delta);
          rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0, 4, delta);
        }
      });

      // Animate blinking server rack LEDs in CTO lab
      if (officeEnvRef.current) {
        officeEnvRef.current.blinkingLeds.forEach((led, idx) => {
          led.visible = Math.sin(time * 6 + idx) > -0.2;
        });

        if (officeEnvRef.current.hologramRing) {
          officeEnvRef.current.hologramRing.rotation.z = time * 0.8;
          officeEnvRef.current.hologramRing.position.y = 1.35 + Math.sin(time * 2) * 0.05;
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dayNight, settings.theme3D, focusRoom, onSelectAgent, soundEnabled]);

  // Sync agent status to 3D character kinematics
  useEffect(() => {
    charactersRef.current.forEach((rig, id) => {
      if (agents[id]) {
        rig.status = agents[id].status;
      }
    });
  }, [agents]);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#070B14] overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Quick Info Bar */}
      <div className="absolute top-4 left-6 pointer-events-none flex items-center space-x-3">
        <div className="pointer-events-auto px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center space-x-3 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Virtual Office 3D
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            60 FPS PBR
          </span>
          {hoveredAgent && (
            <span className="text-xs text-amber-300 font-medium pl-2 border-l border-white/10">
              Hovering: {agents[hoveredAgent]?.name} ({hoveredAgent.toUpperCase()})
            </span>
          )}
        </div>

        {activeExecutiveWorkflow && (
          <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/40 text-blue-300 text-xs font-medium flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Multi-Agent Workflow Active</span>
          </div>
        )}
      </div>

      {/* Top Right Mini Utility Controls */}
      <div className="absolute top-4 right-6 flex items-center space-x-2">
        <button
          onClick={() => {
            const next = dayNight === 'night' ? 'day' : 'night';
            setDayNight(next);
            if (soundEnabled) playSound.click();
          }}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition backdrop-blur-md shadow-lg"
          title="Toggle Day/Night Office Lighting"
        >
          {dayNight === 'night' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playSound.click();
          }}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition backdrop-blur-md shadow-lg"
          title="Toggle Procedural Audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={() => focusRoom('overview')}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition backdrop-blur-md shadow-lg"
          title="Reset Camera to Panoramic Overview"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Strictly adhering to Three.js skill directive) */}
      <div 
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[920px] transition-all duration-300 ease-out z-20 ${
          hudCollapsed ? 'translate-y-[calc(100%-12px)] opacity-60 hover:opacity-100' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="px-4 py-1 rounded-t-xl bg-slate-900/95 hover:bg-slate-800 border-t border-x border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xl transition"
          >
            {hudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show Office Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hide Controls (Zen Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Glassmorphic Dock Container */}
        <div className="p-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Room / Camera Focus Switcher */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-medium text-slate-400 flex items-center pl-1 pr-2">
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" /> View:
            </span>
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'ceo', label: 'CEO Office', color: '#3B82F6' },
              { id: 'cto', label: 'CTO Lab', color: '#06B6D4' },
              { id: 'coo', label: 'COO Suite', color: '#10B981' },
              { id: 'cfo', label: 'CFO Desk', color: '#F59E0B' },
              { id: 'cmo', label: 'CMO Studio', color: '#8B5CF6' },
              { id: 'boardroom', label: 'Boardroom', icon: Users, color: '#6366F1' },
            ].map((room) => {
              const active = activeCameraTarget === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => focusRoom(room.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5'
                  }`}
                >
                  {room.color && (
                    <span 
                      className="w-2 h-2 rounded-full inline-block" 
                      style={{ backgroundColor: room.color }} 
                    />
                  )}
                  {room.icon && <room.icon className="w-3.5 h-3.5" />}
                  <span>{room.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Button: Enter Boardroom */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (soundEnabled) playSound.meetingChime();
                onOpenMeetingRoom();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 border border-indigo-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Users className="w-4 h-4" />
              <span>Convene C-Suite Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* WASD Navigation Hint */}
      <div className="absolute bottom-6 left-6 pointer-events-none hidden md:flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5">
        <Compass className="w-3.5 h-3.5 text-slate-400" />
        <span>WASD to pan · Drag to rotate · Scroll to zoom · Click character to inspect</span>
      </div>
    </div>
  );
};
