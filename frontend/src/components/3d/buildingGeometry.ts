import * as THREE from 'three';
import { Building, ViewMode } from '../../types/campus';

// --- SHARED TEXTURES & MATERIALS ---

// Procedural Solar Cell Canvas Texture
function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#0f2942'; // deep photovoltaic blue
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  // Grid pattern
  const cell = 32;
  for (let x = 0; x <= 256; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  
  // Anti-reflective busbar lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 0); ctx.lineTo(64, 256);
  ctx.moveTo(128, 0); ctx.lineTo(128, 256);
  ctx.moveTo(192, 0); ctx.lineTo(192, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Satellite Terrain Map Canvas Texture
export function createSatelliteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Geospatial terrain base
  const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 600);
  grad.addColorStop(0, '#1a2618'); // campus greenery
  grad.addColorStop(0.6, '#24301e');
  grad.addColorStop(1, '#131b14'); // surrounding urban canopy
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Field patches
  ctx.fillStyle = '#1e331a';
  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * 900;
    const ry = Math.random() * 900;
    const rw = 60 + Math.random() * 140;
    const rh = 60 + Math.random() * 140;
    ctx.fillRect(rx, ry, rw, rh);
  }

  // Major roads on satellite
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 14;
  ctx.beginPath();
  // Perimeter ring road
  ctx.strokeRect(120, 120, 784, 784);
  // Cross avenues
  ctx.moveTo(512, 120); ctx.lineTo(512, 904);
  ctx.moveTo(120, 512); ctx.lineTo(904, 512);
  ctx.stroke();

  // Lake water on satellite
  ctx.fillStyle = '#082f49';
  ctx.beginPath();
  ctx.ellipse(320, 320, 140, 90, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Lat/Long Coordinate Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 100; x < 1000; x += 150) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 100; y < 1000; y += 150) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // GPS Labels for MLRIT Dundigal, Hyderabad
  ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('MLRIT DUNDIGAL // N 17° 35\' 59.04"', 20, 30);
  ctx.fillText('WGS-84 // E 78° 25\' 48.00"', 20, 50);
  ctx.fillText('SURVEY BOUNDARY: 25.0 ACRES', 720, 30);
  ctx.fillText('ELEVATION: 545m AMSL', 720, 50);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

const solarTexture = createSolarPanelTexture();

// Load Real Satellite Imagery Texture for MLRIT (BASE_URL-safe for Netlify / subpaths)
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
const _base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const satUrl = `${_base}assets/satellite_mlrit.jpg`;

export const realSatelliteTexture: THREE.Texture = (() => {
  const tex = textureLoader.load(
    satUrl,
    (loaded) => {
      loaded.wrapS = THREE.ClampToEdgeWrapping;
      loaded.wrapT = THREE.ClampToEdgeWrapping;
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 16;
      loaded.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn('[CampusTwin] Satellite JPG failed — swapping to procedural terrain');
      const fallback = createSatelliteTexture();
      fallback.colorSpace = THREE.SRGBColorSpace;
      tex.image = fallback.image as unknown as HTMLImageElement;
      tex.needsUpdate = true;
    }
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

// --- GROUND & TERRAIN BUILDER ---
export function createGroundTerrain(scene: THREE.Scene): {
  groundMesh: THREE.Mesh;
  satelliteMesh: THREE.Mesh;
  satelliteMat: THREE.MeshStandardMaterial;
} {
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'terrain_group';

  // 1. Realistic Campus Base Slab (450m x 450m)
  const groundGeo = new THREE.PlaneGeometry(450, 450, 64, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x141a24,
    roughness: 0.85,
    metalness: 0.15
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  groundMesh.name = 'campus_ground';
  terrainGroup.add(groundMesh);

  // 2. High-Resolution Satellite Imagery Overlay Mesh
  const satGeo = new THREE.PlaneGeometry(450, 450);
  const satelliteMat = new THREE.MeshStandardMaterial({
    map: realSatelliteTexture,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.0, // controlled dynamically
    visible: true
  });
  const satelliteMesh = new THREE.Mesh(satGeo, satelliteMat);
  satelliteMesh.rotation.x = -Math.PI / 2;
  satelliteMesh.position.y = 0.08;
  satelliteMesh.receiveShadow = true;
  satelliteMesh.name = 'satellite_overlay';
  terrainGroup.add(satelliteMesh);

  // 3. Central Academic Quad (Green Lawn)
  const quadGeo = new THREE.PlaneGeometry(160, 160);
  const quadMat = new THREE.MeshStandardMaterial({
    color: 0x133820, // lush academic turf
    roughness: 0.9,
    metalness: 0.05
  });
  const quadMesh = new THREE.Mesh(quadGeo, quadMat);
  quadMesh.rotation.x = -Math.PI / 2;
  quadMesh.position.set(0, 0.1, -15);
  quadMesh.receiveShadow = true;
  terrainGroup.add(quadMesh);

  // 4. Campus Lake / Bioswale
  const lakeGeo = new THREE.CircleGeometry(36, 48);
  const lakeMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.88
  });
  const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
  lakeMesh.rotation.x = -Math.PI / 2;
  lakeMesh.position.set(-60, 0.15, -110);
  lakeMesh.receiveShadow = true;
  terrainGroup.add(lakeMesh);

  // Lake fountain jet
  const fountainGeo = new THREE.ConeGeometry(2, 6, 16);
  const fountainMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, wireframe: true });
  const fountainMesh = new THREE.Mesh(fountainGeo, fountainMat);
  fountainMesh.position.set(-60, 3, -110);
  terrainGroup.add(fountainMesh);

  // 5. Athletics Stadium Track (400m Oval Track)
  const trackGroup = new THREE.Group();
  trackGroup.position.set(135, 0.12, 95);
  // Outer terracotta track
  const trackGeo = new THREE.RingGeometry(24, 38, 48);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 });
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.rotation.x = -Math.PI / 2;
  trackGroup.add(trackMesh);
  // Inner green soccer pitch
  const fieldGeo = new THREE.PlaneGeometry(36, 26);
  const fieldMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
  fieldMesh.rotation.x = -Math.PI / 2;
  fieldMesh.position.y = 0.02;
  trackGroup.add(fieldMesh);
  terrainGroup.add(trackGroup);

  // 6. Campus Roads & Avenues Network
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // yellow road centerlines
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });

  // Outer Ring Road (horizontal segments)
  const ringRoads = [
    { pos: [0, 0.12, -180], size: [400, 14] }, // North Ring
    { pos: [0, 0.12, 180], size: [400, 14] },  // South Ring
    { pos: [-190, 0.12, 0], size: [14, 360] }, // West Ring
    { pos: [190, 0.12, 0], size: [14, 360] },  // East Ring
    { pos: [0, 0.12, -20], size: [380, 10] },  // Central Quad Avenue
    { pos: [0, 0.12, 70], size: [380, 10] },   // South Campus Avenue
    { pos: [-40, 0.12, 0], size: [10, 360] },  // Academic Spine Road
    { pos: [90, 0.12, 0], size: [10, 360] }    // Research & Sports Spine
  ];

  ringRoads.forEach(r => {
    const rGeo = new THREE.PlaneGeometry(r.size[0], r.size[1]);
    const rMesh = new THREE.Mesh(rGeo, roadMat);
    rMesh.rotation.x = -Math.PI / 2;
    rMesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
    rMesh.receiveShadow = true;
    terrainGroup.add(rMesh);

    // Add yellow center divider line
    const isHorizontal = r.size[0] > r.size[1];
    const lineGeo = new THREE.PlaneGeometry(isHorizontal ? r.size[0] : 0.4, isHorizontal ? 0.4 : r.size[1]);
    const lMesh = new THREE.Mesh(lineGeo, lineMat);
    lMesh.rotation.x = -Math.PI / 2;
    lMesh.position.set(r.pos[0], r.pos[1] + 0.02, r.pos[2]);
    terrainGroup.add(lMesh);
  });

  // 7. Parking Lots with Cars
  const parkingLots = [
    { x: -140, z: -100, w: 50, d: 35 },
    { x: 130, z: 20, w: 45, d: 30 }
  ];

  const carColors = [0x38bdf8, 0xef4444, 0xf8fafc, 0x0f172a, 0x10b981, 0xf59e0b];
  const carGeo = new THREE.BoxGeometry(3.6, 1.4, 1.8);

  parkingLots.forEach(lot => {
    const lotGeo = new THREE.PlaneGeometry(lot.w, lot.d);
    const lotMesh = new THREE.Mesh(lotGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
    lotMesh.rotation.x = -Math.PI / 2;
    lotMesh.position.set(lot.x, 0.13, lot.z);
    lotMesh.receiveShadow = true;
    terrainGroup.add(lotMesh);

    // Parked Cars
    for (let cx = -lot.w / 2 + 5; cx < lot.w / 2 - 5; cx += 5.5) {
      for (let cz of [-lot.d / 4, lot.d / 4]) {
        if (Math.random() > 0.25) { // 75% parked capacity
          const cMat = new THREE.MeshStandardMaterial({
            color: carColors[Math.floor(Math.random() * carColors.length)],
            metalness: 0.8,
            roughness: 0.3
          });
          const cMesh = new THREE.Mesh(carGeo, cMat);
          cMesh.position.set(lot.x + cx, 0.8, lot.z + cz);
          cMesh.castShadow = true;
          terrainGroup.add(cMesh);
        }
      }
    }
  });

  scene.add(terrainGroup);
  return { groundMesh, satelliteMesh, satelliteMat };
}

// --- AUTONOMOUS GPS PATROL DRONE MODEL ---
export function createGpsDroneModel(): { droneGroup: THREE.Group; rotors: THREE.Mesh[] } {
  const droneGroup = new THREE.Group();
  droneGroup.name = 'gps_drone';

  // Fuselage body
  const bodyGeo = new THREE.BoxGeometry(2.4, 0.6, 2.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  droneGroup.add(bodyMesh);

  // Carbon arms and rotors
  const rotors: THREE.Mesh[] = [];
  const armCoords = [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6]
  ];

  armCoords.forEach(([ax, az]) => {
    // Carbon arm
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.rotation.z = Math.PI / 4;
    arm.position.set(ax * 0.5, 0.1, az * 0.5);
    droneGroup.add(arm);

    // Motor Pod
    const podGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 12);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.set(ax, 0.3, az);
    droneGroup.add(pod);

    // Rotor disc
    const rotorGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.04, 16);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.set(ax, 0.6, az);
    droneGroup.add(rotor);
    rotors.push(rotor);
  });

  // Gimbal 4K camera
  const camGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const camMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9 });
  const cam = new THREE.Mesh(camGeo, camMat);
  cam.position.set(0, -0.4, 0.8);
  droneGroup.add(cam);

  // Downward laser scanner indicator
  const laserGeo = new THREE.ConeGeometry(3.0, 18.0, 16, 1, true);
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const laser = new THREE.Mesh(laserGeo, laserMat);
  laser.rotation.x = Math.PI;
  laser.position.y = -9.0;
  droneGroup.add(laser);

  return { droneGroup, rotors };
}

// --- VEGETATION & STREETLIGHTS (INSTANCED) ---
export function createVegetationAndFixtures(scene: THREE.Scene) {
  // Trees
  const treeCount = 280;
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8);
  const foliageGeo = new THREE.DodecahedronGeometry(2.4, 1);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const foliageInst = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  trunkInst.castShadow = true;
  foliageInst.castShadow = true;

  const dummy = new THREE.Object3D();
  let idx = 0;

  // Distribute trees around quad borders, lake perimeter, and campus edges
  for (let i = 0; i < treeCount; i++) {
    // Generate positions avoiding direct building centers
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 160;
    const tx = Math.cos(angle) * radius;
    const tz = Math.sin(angle) * radius;
    const scale = 0.8 + Math.random() * 0.6;

    // Trunk
    dummy.position.set(tx, 1.75 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    // Foliage
    dummy.position.set(tx, 4.2 * scale, tz);
    dummy.scale.set(scale, scale * 1.1, scale);
    dummy.updateMatrix();
    foliageInst.setMatrixAt(idx, dummy.matrix);

    idx++;
  }

  trunkInst.instanceMatrix.needsUpdate = true;
  foliageInst.instanceMatrix.needsUpdate = true;
  scene.add(trunkInst);
  scene.add(foliageInst);

  // Streetlights
  const lightCount = 70;
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 6.5, 8);
  const lampGeo = new THREE.BoxGeometry(0.8, 0.3, 0.4);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // warm glow

  const poleInst = new THREE.InstancedMesh(poleGeo, poleMat, lightCount);
  const lampInst = new THREE.InstancedMesh(lampGeo, lampMat, lightCount);

  let lIdx = 0;
  // Place lights along the primary ring road and quad avenue
  for (let lx = -160; lx <= 160; lx += 25) {
    for (let lz of [-26, 76, -172, 172]) {
      if (lIdx < lightCount) {
        dummy.position.set(lx, 3.25, lz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        poleInst.setMatrixAt(lIdx, dummy.matrix);

        dummy.position.set(lx, 6.4, lz);
        dummy.updateMatrix();
        lampInst.setMatrixAt(lIdx, dummy.matrix);
        lIdx++;
      }
    }
  }

  poleInst.instanceMatrix.needsUpdate = true;
  lampInst.instanceMatrix.needsUpdate = true;
  scene.add(poleInst);
  scene.add(lampInst);
}

// --- SUBSTATION & UTILITY INFRASTRUCTURE ---
export function createSubstationInfrastructure(scene: THREE.Scene) {
  const subGroup = new THREE.Group();
  subGroup.position.set(140, 0, -75);
  subGroup.name = 'substation_yard';

  // 1. Concrete Switchyard Foundation Pad
  const padGeo = new THREE.BoxGeometry(45, 0.6, 35);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.y = 0.3;
  padMesh.receiveShadow = true;
  subGroup.add(padMesh);

  // 2. Transformer T1 & T2 units with cooling radiators
  for (let tx of [-10, 10]) {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, 0.6, 0);

    // Main tank
    const tankGeo = new THREE.BoxGeometry(5.5, 4.2, 4.0);
    const tankMat = new THREE.MeshStandardMaterial({
      color: tx > 0 ? 0xb91c1c : 0x0369a1, // Red warning on T2, Blue on T1
      metalness: 0.7,
      roughness: 0.3
    });
    const tankMesh = new THREE.Mesh(tankGeo, tankMat);
    tankMesh.position.y = 2.1;
    tankMesh.castShadow = true;
    tGroup.add(tankMesh);

    // Conservator tank on top
    const consGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.2, 16);
    const consMesh = new THREE.Mesh(consGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    consMesh.rotation.z = Math.PI / 2;
    consMesh.position.set(0, 4.8, -1.2);
    tGroup.add(consMesh);

    // Ceramic Bushings (High Voltage Insulators)
    for (let bx of [-1.5, 0, 1.5]) {
      const bushGeo = new THREE.ConeGeometry(0.3, 1.4, 8);
      const bushMesh = new THREE.Mesh(bushGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
      bushMesh.position.set(bx, 5.0, 0.8);
      tGroup.add(bushMesh);
    }

    subGroup.add(tGroup);
  }

  // 3. BESS Battery Storage Pods (2 Containers)
  for (let bz of [-9, 9]) {
    const bessGeo = new THREE.BoxGeometry(12, 3.2, 3.0);
    const bessMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.4 });
    const bessMesh = new THREE.Mesh(bessGeo, bessMat);
    bessMesh.position.set(-10, 2.2, bz);
    bessMesh.castShadow = true;
    subGroup.add(bessMesh);

    // BESS LED indicator strip
    const ledGeo = new THREE.BoxGeometry(0.2, 0.2, 2.4);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(-3.9, 2.2, bz);
    subGroup.add(ledMesh);
  }

  scene.add(subGroup);
}

// --- ARCHITECTURAL BUILDING MESH BUILDER ---
export function createBuildingMesh(building: Building, viewMode: ViewMode): THREE.Group {
  const group = new THREE.Group();
  group.name = `building_${building.id}`;
  group.userData = { buildingId: building.id, building };

  const { width, height, depth } = building.dimensions_3d;
  const { x, y, z } = building.position_3d;
  group.position.set(x, y, z);

  // Calculate Heatmap Color if in a heatmap mode
  let facadeColor = new THREE.Color(building.color_hex);
  let emissiveColor = new THREE.Color(0x000000);
  let emissiveIntensity = 0.0;

  if (viewMode === 'HEATMAP_ENERGY') {
    // Energy intensity: kW / m²
    const intensity = (building.energy_consumption_kw / building.total_area_sqm) * 1000; // W/m²
    if (intensity > 16) {
      facadeColor = new THREE.Color(0xef4444); // red
      emissiveColor = new THREE.Color(0xdc2626);
      emissiveIntensity = 0.45;
    } else if (intensity > 11) {
      facadeColor = new THREE.Color(0xf59e0b); // amber
      emissiveColor = new THREE.Color(0xd97706);
      emissiveIntensity = 0.3;
    } else {
      facadeColor = new THREE.Color(0x10b981); // green
      emissiveColor = new THREE.Color(0x059669);
      emissiveIntensity = 0.2;
    }
  } else if (viewMode === 'HEATMAP_WATER') {
    const waterLpm = building.water_consumption_lpm;
    if (waterLpm > 100) {
      facadeColor = new THREE.Color(0xef4444); // red leak
      emissiveColor = new THREE.Color(0xff0000);
      emissiveIntensity = 0.6;
    } else if (waterLpm > 40) {
      facadeColor = new THREE.Color(0x0284c7); // blue
    } else {
      facadeColor = new THREE.Color(0x38bdf8); // cyan
    }
  } else if (viewMode === 'HEATMAP_OCCUPANCY') {
    const occPct = building.occupancy_rate_pct;
    if (occPct > 80) {
      facadeColor = new THREE.Color(0xf43f5e); // crowded
    } else if (occPct > 45) {
      facadeColor = new THREE.Color(0xf59e0b); // medium
    } else {
      facadeColor = new THREE.Color(0x3b82f6); // low
    }
  } else if (viewMode === 'HEATMAP_HEALTH') {
    if (building.maintenance_status === 'CRITICAL') {
      facadeColor = new THREE.Color(0xef4444);
      emissiveColor = new THREE.Color(0xff0000);
      emissiveIntensity = 0.5;
    } else if (building.maintenance_status === 'ATTENTION') {
      facadeColor = new THREE.Color(0xf59e0b);
    } else {
      facadeColor = new THREE.Color(0x10b981);
    }
  }

  // 1. Concrete Structural Core / Solid Body or Pure Satellite Blueprint
  const isPureSatellite = viewMode === 'PURE_SATELLITE';
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: isPureSatellite ? 0x0ea5e9 : facadeColor,
    roughness: isPureSatellite ? 0.9 : 0.35,
    metalness: isPureSatellite ? 0.1 : 0.45,
    emissive: isPureSatellite ? new THREE.Color(0x0284c7) : emissiveColor,
    emissiveIntensity: isPureSatellite ? 0.25 : emissiveIntensity,
    transparent: isPureSatellite,
    opacity: isPureSatellite ? 0.15 : 1.0,
    wireframe: isPureSatellite
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = height / 2;
  bodyMesh.castShadow = !isPureSatellite;
  bodyMesh.receiveShadow = true;
  bodyMesh.name = `body_${building.id}`;
  group.add(bodyMesh);

  // If in pure satellite mode, add neon ground footprint boundary outline
  if (isPureSatellite) {
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(width * 1.01, 0.4, depth * 1.01));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLine.position.y = 0.2;
    group.add(edgeLine);
    return group; // return early so rooftops don't obstruct the pure satellite imagery!
  }

  // 2. Glass Curtain Façade Panels (Semi-reflective architectural ribbons)
  const floorHeight = height / building.floors_count;
  for (let f = 0; f < building.floors_count; f++) {
    const ribbonY = f * floorHeight + floorHeight * 0.55;
    const glassRibbonGeo = new THREE.BoxGeometry(width * 1.008, floorHeight * 0.55, depth * 1.008);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x082f49,
      metalness: 0.85,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.75
    });
    const glassMesh = new THREE.Mesh(glassRibbonGeo, glassMat);
    glassMesh.position.y = ribbonY;
    group.add(glassMesh);
  }

  // 3. Rooftop Parapet
  const parapetHeight = 1.2;
  const parapetGeo = new THREE.BoxGeometry(width * 1.02, parapetHeight, depth * 1.02);
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const parapetMesh = new THREE.Mesh(parapetGeo, parapetMat);
  parapetMesh.position.y = height + parapetHeight / 2;
  group.add(parapetMesh);

  // 4. Rooftop Mechanical Penthouse & Chiller Unit
  const mechWidth = width * 0.35;
  const mechHeight = 3.2;
  const mechDepth = depth * 0.35;
  const mechGeo = new THREE.BoxGeometry(mechWidth, mechHeight, mechDepth);
  const mechMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  const mechMesh = new THREE.Mesh(mechGeo, mechMat);
  mechMesh.position.set(-width * 0.2, height + mechHeight / 2, -depth * 0.2);
  group.add(mechMesh);

  // Chiller Fan Cylinder on Rooftop
  const fanGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16);
  const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const fanMesh = new THREE.Mesh(fanGeo, fanMat);
  fanMesh.position.set(-width * 0.2, height + mechHeight + 0.4, -depth * 0.2);
  group.add(fanMesh);

  // 5. Rooftop Solar PV Panels
  if (building.solar_capacity_kw > 0) {
    const solarRows = Math.floor(depth / 8);
    const solarCols = Math.floor(width / 12);
    const panelW = 9;
    const panelD = 5;

    for (let r = 0; r < solarRows; r++) {
      for (let c = 0; c < solarCols; c++) {
        // Skip area occupied by mechanical room
        const px = -width / 2 + 8 + c * (panelW + 2);
        const pz = -depth / 2 + 8 + r * (panelD + 2);
        if (px < -width * 0.05 && pz < -depth * 0.05) continue;

        const panelGeo = new THREE.PlaneGeometry(panelW, panelD);
        const panelMat = new THREE.MeshStandardMaterial({
          map: solarTexture,
          metalness: 0.9,
          roughness: 0.2,
          side: THREE.DoubleSide
        });
        const panelMesh = new THREE.Mesh(panelGeo, panelMat);
        panelMesh.rotation.x = -Math.PI / 2 + 0.26; // 15-degree tilt
        panelMesh.position.set(px, height + 1.4, pz);
        panelMesh.castShadow = true;
        group.add(panelMesh);
      }
    }
  }

  // 6. Rooftop Communication Antenna Mast
  const mastGeo = new THREE.CylinderGeometry(0.1, 0.25, 9, 8);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  const mastMesh = new THREE.Mesh(mastGeo, mastMat);
  mastMesh.position.set(width * 0.35, height + 4.5, depth * 0.35);
  group.add(mastMesh);

  // Red Aviation Warning Beacon on Mast Tip
  const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.set(width * 0.35, height + 9.1, depth * 0.35);
  group.add(beaconMesh);

  return group;
}

// --- EXPLODED FLOOR PLAN DISSECTION BUILDER ---
export function createExplodedFloorView(building: Building, selectedFloorNum: number | null): THREE.Group {
  const explodedGroup = new THREE.Group();
  explodedGroup.name = `exploded_${building.id}`;
  explodedGroup.position.set(building.position_3d.x, 0, building.position_3d.z);

  const { width, height, depth } = building.dimensions_3d;
  const floorCount = Math.max(1, building.floors_count || building.floors.length || 1);
  const floors = building.floors.length
    ? building.floors
    : Array.from({ length: floorCount }, (_, idx) => ({
        id: `${building.id}-f${idx}`,
        building_id: building.id,
        floor_number: idx,
        name: idx === 0 ? 'Ground' : `Level ${idx}`,
        area_sqm: Math.round(building.total_area_sqm / floorCount),
        rooms_count: 0,
        current_occupancy: Math.round(building.current_occupancy / floorCount),
        max_capacity: Math.round(building.max_capacity / floorCount),
        energy_kw: +(building.energy_consumption_kw / floorCount).toFixed(1),
        hvac_load_kw: 0, lighting_kw: 0, plug_load_kw: 0, water_flow_lpm: 0,
        average_temp_c: 24, rooms: [], data_source: 'SIMULATED' as const,
      }));
  const nominalHeight = height / floorCount;
  const explodeSpacing = 16.0; // vertical separation between floors

  floors.forEach((fl, idx) => {
    // If a specific floor is selected, isolate it and dim others
    const isSelected = selectedFloorNum === null || selectedFloorNum === fl.floor_number;
    const floorY = idx * (nominalHeight + explodeSpacing) + 2.0;

    const floorGroup = new THREE.Group();
    floorGroup.position.set(0, floorY, 0);
    floorGroup.userData = { floorNumber: fl.floor_number, floorId: fl.id };

    // 1. Concrete Floor Slab
    const slabGeo = new THREE.BoxGeometry(width, 0.8, depth);
    const slabMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0x1e293b : 0x0f172a,
      roughness: 0.6,
      transparent: !isSelected,
      opacity: isSelected ? 1.0 : 0.25
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.castShadow = true;
    floorGroup.add(slabMesh);

    // 2. Interior Partition Walls & Rooms
    if (isSelected && fl.rooms.length > 0) {
      const roomCols = 3;
      const roomRows = Math.ceil(fl.rooms.length / roomCols);
      const rw = (width - 6) / roomCols;
      const rd = (depth - 6) / roomRows;

      fl.rooms.forEach((r, rIdx) => {
        const col = rIdx % roomCols;
        const row = Math.floor(rIdx / roomCols);
        const rx = -width / 2 + 4 + col * rw + rw / 2;
        const rz = -depth / 2 + 4 + row * rd + rd / 2;

        // Room boundary box
        const rBoxGeo = new THREE.BoxGeometry(rw * 0.9, 2.8, rd * 0.9);
        // Color based on room occupancy
        const rColor = r.current_occupancy > 0 ? (r.hvac_temp_c < 22 ? 0x38bdf8 : 0x10b981) : 0x475569;
        const rMat = new THREE.MeshStandardMaterial({
          color: rColor,
          transparent: true,
          opacity: 0.45,
          roughness: 0.5
        });
        const rMesh = new THREE.Mesh(rBoxGeo, rMat);
        rMesh.position.set(rx, 1.8, rz);
        floorGroup.add(rMesh);

        // Room centroid sensor sphere
        const sensGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const sensMat = new THREE.MeshBasicMaterial({
          color: r.current_occupancy > 0 ? 0x22c55e : (r.lighting_status === 'on' ? 0xf59e0b : 0x94a3b8)
        });
        const sensMesh = new THREE.Mesh(sensGeo, sensMat);
        sensMesh.position.set(rx, 3.4, rz);
        floorGroup.add(sensMesh);
      });
    }

    explodedGroup.add(floorGroup);
  });

  return explodedGroup;
}
