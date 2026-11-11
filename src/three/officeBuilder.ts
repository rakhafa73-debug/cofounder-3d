import * as THREE from 'three';
import { createFloorTexture, createScreenTexture } from './materials';

export interface OfficeEnvironment {
  sceneGroup: THREE.Group;
  interactableObjects: THREE.Object3D[];
  blinkingLeds: THREE.Mesh[];
  hologramRing?: THREE.Mesh;
}

export function buildVirtualOffice(theme: 'cyber_dark' | 'neon_dawn' | 'corporate_slate'): OfficeEnvironment {
  const sceneGroup = new THREE.Group();
  const interactableObjects: THREE.Object3D[] = [];
  const blinkingLeds: THREE.Mesh[] = [];

  // ==========================================
  // 1. MAIN FLOOR WITH PROCEDURAL TILES
  // ==========================================
  const floorGeo = new THREE.PlaneGeometry(48, 48);
  const floorTex = createFloorTexture(theme);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.7,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  sceneGroup.add(floor);

  // Outer floor border trim
  const borderGeo = new THREE.RingGeometry(24, 25, 4);
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.5,
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.01;
  sceneGroup.add(border);

  // ==========================================
  // 2. HELPER FUNCTIONS FOR FURNITURE & DESKS
  // ==========================================
  const darkDeskMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.3,
    metalness: 0.4,
  });
  const metalLegMat = new THREE.MeshStandardMaterial({
    color: 0x64748B,
    roughness: 0.2,
    metalness: 0.8,
  });
  const chairLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.6,
  });

  function createDesk(x: number, z: number, rotationY = 0, screenType: 'code' | 'chart' | 'analytics' | 'terminal' = 'code'): THREE.Group {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(x, 0, z);
    deskGroup.rotation.y = rotationY;

    // Desktop
    const topGeo = new THREE.BoxGeometry(2.4, 0.1, 1.2);
    const top = new THREE.Mesh(topGeo, darkDeskMat);
    top.position.y = 0.75;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12);
    [
      [-1.1, -0.5],
      [1.1, -0.5],
      [-1.1, 0.5],
      [1.1, 0.5],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, metalLegMat);
      leg.position.set(lx, 0.375, lz);
      deskGroup.add(leg);
    });

    // Monitor Stand
    const standGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16);
    const stand = new THREE.Mesh(standGeo, metalLegMat);
    stand.position.set(0, 0.815, -0.25);
    deskGroup.add(stand);

    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12);
    const pole = new THREE.Mesh(poleGeo, metalLegMat);
    pole.position.set(0, 0.965, -0.25);
    deskGroup.add(pole);

    // Ultrawide Screen
    const screenGeo = new THREE.BoxGeometry(1.4, 0.55, 0.04);
    const screenTex = createScreenTexture(screenType);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTex,
    });
    const screenFaceMat = [
      darkDeskMat,
      darkDeskMat,
      darkDeskMat,
      darkDeskMat,
      screenMat, // Front
      darkDeskMat,
    ];
    const screen = new THREE.Mesh(screenGeo, screenFaceMat);
    screen.position.set(0, 1.2, -0.25);
    deskGroup.add(screen);

    // Keyboard & Mouse
    const kbGeo = new THREE.BoxGeometry(0.65, 0.015, 0.22);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 0.81, 0.15);
    deskGroup.add(kb);

    const mouseGeo = new THREE.BoxGeometry(0.08, 0.02, 0.12);
    const mouse = new THREE.Mesh(mouseGeo, kbMat);
    mouse.position.set(0.45, 0.81, 0.15);
    deskGroup.add(mouse);

    // Ergonomic Chair
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 0.65);

    const seatGeo = new THREE.BoxGeometry(0.7, 0.1, 0.65);
    const seat = new THREE.Mesh(seatGeo, chairLeatherMat);
    seat.position.y = 0.5;
    chairGroup.add(seat);

    const backGeo = new THREE.BoxGeometry(0.7, 0.7, 0.1);
    const back = new THREE.Mesh(backGeo, chairLeatherMat);
    back.position.set(0, 0.85, 0.3);
    chairGroup.add(back);

    const chairPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12), metalLegMat);
    chairPole.position.y = 0.25;
    chairGroup.add(chairPole);

    const baseStar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 5), metalLegMat);
    baseStar.position.y = 0.03;
    chairGroup.add(baseStar);

    deskGroup.add(chairGroup);
    return deskGroup;
  }

  // ==========================================
  // 3. ROOM SPECIFIC SETUPS
  // ==========================================

  // CEO Office ([-14, 0, -8])
  const ceoDesk = createDesk(-14, -8, Math.PI, 'chart');
  ceoDesk.name = 'ceo_workstation';
  sceneGroup.add(ceoDesk);
  interactableObjects.push(ceoDesk);

  // CTO Lab ([14, 0, -8])
  const ctoDesk = createDesk(14, -8, Math.PI, 'code');
  ctoDesk.name = 'cto_workstation';
  sceneGroup.add(ctoDesk);
  interactableObjects.push(ctoDesk);

  // Add Server Racks in CTO Lab
  [-1.5, 0, 1.5].forEach((offset, idx) => {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(18, 0, -11 + offset * 1.4);

    const rackFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x090D16, metalness: 0.7, roughness: 0.3 })
    );
    rackFrame.position.y = 1.2;
    rackFrame.castShadow = true;
    rackGroup.add(rackFrame);

    // Blinking LEDs
    for (let row = 0; row < 6; row++) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.02),
        new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x06B6D4 : 0x10B981 })
      );
      led.position.set(-0.25 + (row % 3) * 0.25, 0.6 + row * 0.25, 0.41);
      rackGroup.add(led);
      blinkingLeds.push(led);
    }
    sceneGroup.add(rackGroup);
  });

  // COO Office ([-14, 0, 8])
  const cooDesk = createDesk(-14, 8, 0, 'terminal');
  cooDesk.name = 'coo_workstation';
  sceneGroup.add(cooDesk);
  interactableObjects.push(cooDesk);

  // CFO Desk ([14, 0, 8])
  const cfoDesk = createDesk(14, 8, 0, 'analytics');
  cfoDesk.name = 'cfo_workstation';
  sceneGroup.add(cfoDesk);
  interactableObjects.push(cfoDesk);

  // CMO Studio ([0, 0, 14])
  const cmoDesk = createDesk(0, 14, -Math.PI / 2, 'chart');
  cmoDesk.name = 'cmo_workstation';
  sceneGroup.add(cmoDesk);
  interactableObjects.push(cmoDesk);

  // Neon Sign in CMO Studio
  const neonSign = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.7, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x8B5CF6 })
  );
  neonSign.position.set(0, 3.2, 19.8);
  sceneGroup.add(neonSign);

  // ==========================================
  // 4. BOARDROOM MEETING HUB ([0, 0, -14])
  // ==========================================
  const boardroomGroup = new THREE.Group();
  boardroomGroup.position.set(0, 0, -14);

  // Large Oval / Round Executive Conference Table
  const tableTopGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.12, 32);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.2,
    metalness: 0.5,
  });
  const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
  tableTop.position.y = 0.75;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  boardroomGroup.add(tableTop);

  // Center Holographic Projection Pedestal
  const holoBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.9, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.9, roughness: 0.1 })
  );
  holoBase.position.y = 0.88;
  boardroomGroup.add(holoBase);

  // Hologram Ring
  const holoGeo = new THREE.TorusGeometry(0.5, 0.03, 16, 64);
  const holoMat = new THREE.MeshBasicMaterial({
    color: 0x38BDF8,
    transparent: true,
    opacity: 0.8,
  });
  const hologramRing = new THREE.Mesh(holoGeo, holoMat);
  hologramRing.position.y = 1.35;
  hologramRing.rotation.x = Math.PI / 2;
  boardroomGroup.add(hologramRing);

  // 6 Conference Chairs around table
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const chairX = Math.cos(angle) * 4.4;
    const chairZ = Math.sin(angle) * 4.4;

    const chair = new THREE.Group();
    chair.position.set(chairX, 0, chairZ);
    chair.lookAt(0, 0, 0);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.6), chairLeatherMat);
    seat.position.y = 0.5;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.1), chairLeatherMat);
    back.position.set(0, 0.85, 0.28);
    chair.add(back);

    boardroomGroup.add(chair);
  }

  sceneGroup.add(boardroomGroup);
  interactableObjects.push(boardroomGroup);

  // ==========================================
  // 5. MAIN LOBBY & RECEPTION ([0, 0, 0])
  // ==========================================
  const receptionDesk = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.9, 24, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.3 })
  );
  receptionDesk.position.set(0, 0.45, -2);
  receptionDesk.rotation.y = Math.PI;
  sceneGroup.add(receptionDesk);

  // Potted indoor plants
  [
    [-6, -6],
    [6, -6],
    [-6, 6],
    [6, 6],
  ].forEach(([px, pz]) => {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.25, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    pot.position.set(px, 0.3, pz);
    pot.castShadow = true;
    sceneGroup.add(pot);

    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55, 1),
      new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.9 })
    );
    foliage.position.set(px, 0.85, pz);
    foliage.castShadow = true;
    sceneGroup.add(foliage);
  });

  // Perimeter Glass Walls & Columns
  const columnGeo = new THREE.BoxGeometry(0.6, 5, 0.6);
  const columnMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3 });
  [
    [-24, -24], [24, -24], [-24, 24], [24, 24],
    [0, -24], [0, 24], [-24, 0], [24, 0],
  ].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(columnGeo, columnMat);
    col.position.set(cx, 2.5, cz);
    col.castShadow = true;
    sceneGroup.add(col);
  });

  return {
    sceneGroup,
    interactableObjects,
    blinkingLeds,
    hologramRing,
  };
}
