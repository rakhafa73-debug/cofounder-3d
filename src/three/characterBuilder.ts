import * as THREE from 'three';
import { AgentId, AgentStatus } from '../types';
import { createNameplateTexture } from './materials';

export interface CharacterRig {
  group: THREE.Group;
  agentId: AgentId;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  statusRing: THREE.Mesh;
  billboard: THREE.Sprite;
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  isSitting: boolean;
  status: AgentStatus;
  updateAnimation: (time: number, delta: number) => void;
}

export function buildCharacter(
  agentId: AgentId,
  name: string,
  role: string,
  accentColor: string,
  initialPos: [number, number, number],
  isSitting: boolean = false
): CharacterRig {
  const root = new THREE.Group();
  root.position.set(initialPos[0], initialPos[1], initialPos[2]);

  // 1. Soft contact shadow grounding
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  // 2. Status Halo Ring on floor
  const ringGeo = new THREE.RingGeometry(0.85, 0.95, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentColor),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const statusRing = new THREE.Mesh(ringGeo, ringMat);
  statusRing.rotation.x = -Math.PI / 2;
  statusRing.position.y = 0.025;
  root.add(statusRing);

  // 3. Body & Suit Assembly (Procedural 8-part character)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = isSitting ? 0.75 : 0;
  root.add(bodyGroup);

  // Legs / Chair posture
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.8,
    metalness: 0.1,
  });

  if (!isSitting) {
    const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.26);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    leftLeg.castShadow = true;
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.2, 0.45, 0);
    rightLeg.castShadow = true;
    bodyGroup.add(rightLeg);
  } else {
    // Bent sitting legs
    const thighGeo = new THREE.BoxGeometry(0.24, 0.22, 0.6);
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.position.set(-0.2, 0.11, 0.25);
    bodyGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.position.set(0.2, 0.11, 0.25);
    bodyGroup.add(rightThigh);
  }

  // Torso / Suit Jacket
  const jacketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.5,
    metalness: 0.15,
  });
  const torsoGeo = new THREE.BoxGeometry(0.68, 0.8, 0.38);
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.position.y = isSitting ? 0.6 : 1.3;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Shirt / Collar
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    roughness: 0.4,
  });
  const shirtGeo = new THREE.BoxGeometry(0.28, 0.35, 0.4);
  const shirt = new THREE.Mesh(shirtGeo, shirtMat);
  shirt.position.set(0, (isSitting ? 0.6 : 1.3) + 0.22, 0.02);
  bodyGroup.add(shirt);

  // Tie or executive badge
  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.3,
  });
  const tieGeo = new THREE.BoxGeometry(0.08, 0.38, 0.42);
  const tie = new THREE.Mesh(tieGeo, tieMat);
  tie.position.set(0, (isSitting ? 0.6 : 1.3) + 0.12, 0.02);
  bodyGroup.add(tie);

  // Head Assembly
  const headGroup = new THREE.Group();
  headGroup.position.set(0, (isSitting ? 0.6 : 1.3) + 0.62, 0);
  bodyGroup.add(headGroup);

  // Stylized cartoon face
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xFBD38D, // Warm skin tone
    roughness: 0.6,
  });
  const headGeo = new THREE.SphereGeometry(0.26, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Hair
  const hairMat = new THREE.MeshStandardMaterial({
    color: agentId === 'cto' ? 0x1E293B : agentId === 'cmo' ? 0x9333EA : agentId === 'cfo' ? 0x475569 : 0x0F172A,
    roughness: 0.7,
  });
  const hairGeo = new THREE.BoxGeometry(0.54, 0.22, 0.54);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 0.16, -0.02);
  headGroup.add(hair);

  // Glasses or visor for tech roles
  if (agentId === 'cto' || agentId === 'cfo') {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x06B6D4,
      metalness: 0.8,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    const glassGeo = new THREE.BoxGeometry(0.42, 0.08, 0.1);
    const glasses = new THREE.Mesh(glassGeo, glassMat);
    glasses.position.set(0, 0.02, 0.24);
    headGroup.add(glasses);
  }

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.44, (isSitting ? 0.6 : 1.3) + 0.28, 0);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), jacketMat);
  leftArmMesh.position.y = -0.28;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  bodyGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.44, (isSitting ? 0.6 : 1.3) + 0.28, 0);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), jacketMat);
  rightArmMesh.position.y = -0.28;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  bodyGroup.add(rightArm);

  // 4. Floating 3D Billboard Nameplate
  const nameplateTex = createNameplateTexture(name, role, accentColor);
  const spriteMat = new THREE.SpriteMaterial({
    map: nameplateTex,
    transparent: true,
    depthTest: false,
  });
  const billboard = new THREE.Sprite(spriteMat);
  billboard.position.set(0, (isSitting ? 1.4 : 2.0) + 0.65, 0);
  billboard.scale.set(1.9, 0.64, 1);
  root.add(billboard);

  // Return Rig with active kinematics loop
  return {
    group: root,
    agentId,
    leftArm,
    rightArm,
    head: headGroup,
    statusRing,
    billboard,
    basePosition: new THREE.Vector3(...initialPos),
    targetPosition: new THREE.Vector3(...initialPos),
    isSitting,
    status: 'idle',
    updateAnimation: (time: number, _delta: number) => {
      // Breathing / subtle idle bobbing
      const bob = Math.sin(time * 2) * 0.015;
      bodyGroup.position.y = (isSitting ? 0.75 : 0) + bob;

      // Status ring rotation & pulse
      statusRing.rotation.z = time * 0.5;

      // Kinematics based on agent execution status
      // We will access rig.status in real-time
    },
  };
}
