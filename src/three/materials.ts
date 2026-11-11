import * as THREE from 'three';

// Cache procedural textures to avoid recreation
const textureCache = new Map<string, THREE.CanvasTexture>();

export function createFloorTexture(theme: 'cyber_dark' | 'neon_dawn' | 'corporate_slate'): THREE.CanvasTexture {
  const key = `floor_${theme}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bg = theme === 'cyber_dark' ? '#0B0F19' : theme === 'neon_dawn' ? '#0F172A' : '#111827';
  const gridLine = theme === 'cyber_dark' ? '#1E293B' : theme === 'neon_dawn' ? '#334155' : '#1F2937';
  const accentDot = theme === 'cyber_dark' ? '#3B82F6' : theme === 'neon_dawn' ? '#8B5CF6' : '#64748B';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Grid pattern
  ctx.strokeStyle = gridLine;
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Tech dots at intersections
  ctx.fillStyle = accentDot;
  for (let x = 0; x <= 512; x += step) {
    for (let y = 0; y <= 512; y += step) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function createScreenTexture(type: 'code' | 'chart' | 'analytics' | 'terminal'): THREE.CanvasTexture {
  const key = `screen_${type}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 144;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, 256, 144);

  // Window header
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 256, 20);
  ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(12, 10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(24, 10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.arc(36, 10, 4, 0, Math.PI * 2); ctx.fill();

  if (type === 'code') {
    ctx.fillStyle = '#38BDF8';
    ctx.font = '10px monospace';
    ctx.fillText('const agent = new CSuiteAgent();', 12, 40);
    ctx.fillStyle = '#A78BFA';
    ctx.fillText('await agent.executePlan();', 12, 58);
    ctx.fillStyle = '#34D399';
    ctx.fillText('// 60 FPS Three.js viewport active', 12, 76);
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('export default function AIWorker();', 12, 94);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('> PostgreSQL RLS status: 200 OK', 12, 114);
  } else if (type === 'chart') {
    // Mini bar chart
    const bars = [40, 70, 55, 90, 80, 110, 95, 120];
    ctx.fillStyle = '#3B82F6';
    bars.forEach((val, i) => {
      ctx.fillRect(20 + i * 26, 130 - val, 18, val);
    });
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(80, 60);
    ctx.lineTo(150, 40);
    ctx.lineTo(220, 20);
    ctx.stroke();
  } else if (type === 'analytics') {
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('MRR: $48,250', 16, 50);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.fillText('+24.8% from last month', 16, 68);
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('RUNWAY: 18.4 Mo', 16, 96);
    ctx.fillStyle = '#60A5FA';
    ctx.fillText('ACTIVE AGENTS: 5/5 ONLINE', 16, 120);
  } else {
    // Terminal
    ctx.fillStyle = '#22C55E';
    ctx.font = '10px monospace';
    ctx.fillText('system:~$ agent-orchestrator', 10, 40);
    ctx.fillText('[INFO] Gemini 3.8 Flash online', 10, 58);
    ctx.fillText('[INFO] Multi-agent bus connected', 10, 76);
    ctx.fillText('[INFO] 0 errors, 100% test coverage', 10, 94);
    ctx.fillText('system:~$ _', 10, 114);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function createNameplateTexture(name: string, role: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Translucent rounded capsule
  ctx.fillStyle = 'rgba(8, 12, 24, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  
  // Draw rounded rect
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(384 - r, 0);
  ctx.quadraticCurveTo(384, 0, 384, r);
  ctx.lineTo(384, 128 - r);
  ctx.quadraticCurveTo(384, 128, 384 - r, 128);
  ctx.lineTo(r, 128);
  ctx.quadraticCurveTo(0, 128, 0, 128 - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Status pip
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(36, 64, 10, 0, Math.PI * 2);
  ctx.fill();

  // Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(name, 60, 56);

  // Role
  ctx.fillStyle = color;
  ctx.font = '500 18px sans-serif';
  ctx.fillText(role, 60, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
