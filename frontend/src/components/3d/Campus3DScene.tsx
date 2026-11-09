import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Building, ViewMode, Alert, GpsCoordinate } from '../../types/campus';
import {
  createGroundTerrain,
  createVegetationAndFixtures,
  createSubstationInfrastructure,
  createBuildingMesh,
  createExplodedFloorView,
  createGpsDroneModel
} from './buildingGeometry';
import { SpatialMeasurementEngine, MeasurementResult } from './MeasurementTool';

interface Campus3DSceneProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  selectedFloor: number | null;
  isBuildingEntered: boolean;
  viewMode: ViewMode;
  simulatedHour: number;
  alerts: Alert[];
  measurementMode: 'NONE' | 'DISTANCE' | 'AREA';
  onMeasurementResult: (res: MeasurementResult) => void;
  cameraPreset: string;
  onGpsUpdate?: (coords: GpsCoordinate) => void;
  gpsPinMode?: boolean;
  onDropGpsPin?: (pin: { lat: number; lng: number; altitude: number; label: string }) => void;
}

// Convert 3D scene (x, z) to MLRIT Dundigal WGS-84 Coordinates
export function sceneToGps(x: number, z: number, y: number = 0): { lat: number; lng: number; alt: number } {
  const originLat = 17.59972;
  const originLng = 78.43000;
  const lat = originLat - (z * 0.0000090);
  const lng = originLng + (x * 0.0000095);
  const alt = 545.0 + y;
  return { lat, lng, alt };
}

export const Campus3DScene: React.FC<Campus3DSceneProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  selectedFloor,
  isBuildingEntered,
  viewMode,
  simulatedHour,
  alerts,
  measurementMode,
  onMeasurementResult,
  cameraPreset,
  onGpsUpdate,
  gpsPinMode,
  onDropGpsPin
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const explodedGroupRef = useRef<THREE.Group | null>(null);
  const satelliteMeshRef = useRef<THREE.Mesh | null>(null);
  const satelliteMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const measurementEngineRef = useRef<SpatialMeasurementEngine | null>(null);
  const beaconsGroupRef = useRef<THREE.Group | null>(null);

  // Drone & GPS state
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const droneRotorsRef = useRef<THREE.Mesh[]>([]);
  const droneProgressRef = useRef<number>(0);
  const gpsPinsGroupRef = useRef<THREE.Group | null>(null);
  const gpsPinModeRef = useRef(gpsPinMode);
  const onSelectBuildingRef = useRef(onSelectBuilding);
  const onGpsUpdateRef = useRef(onGpsUpdate);
  const onDropGpsPinRef = useRef(onDropGpsPin);
  gpsPinModeRef.current = gpsPinMode;
  onSelectBuildingRef.current = onSelectBuilding;
  onGpsUpdateRef.current = onGpsUpdate;
  onDropGpsPinRef.current = onDropGpsPin;

  // Orbit control state
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef({ radius: 260, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const target = useRef(new THREE.Vector3(0, 5, 0));

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.FogExp2(0x071018, 0.00105);
    sceneRef.current = scene;

    // Guard against display:none / zero-size mount (common when tab is not yet active)
    const initW = Math.max(width || container.parentElement?.clientWidth || window.innerWidth - 320, 320);
    const initH = Math.max(height || container.parentElement?.clientHeight || window.innerHeight - 64, 240);

    const camera = new THREE.PerspectiveCamera(45, initW / initH, 1, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      failIfMajorPerformanceCaveat: false,
    });
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    rendererRef.current = renderer;

    // Lights — bright enough to always see buildings clearly
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e3a5f, 0.65);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e7, 2.0);
    dirLight.position.set(-80, 180, 100);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 600;
    dirLight.shadow.camera.left = -220;
    dirLight.shadow.camera.right = 220;
    dirLight.shadow.camera.top = 220;
    dirLight.shadow.camera.bottom = -220;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Build Environment
    const { groundMesh, satelliteMesh, satelliteMat } = createGroundTerrain(scene);
    groundMeshRef.current = groundMesh;
    satelliteMeshRef.current = satelliteMesh;
    satelliteMatRef.current = satelliteMat;

    createVegetationAndFixtures(scene);
    createSubstationInfrastructure(scene);

    // Drone
    const { droneGroup, rotors } = createGpsDroneModel();
    droneGroup.position.set(0, 35, 0);
    scene.add(droneGroup);
    droneGroupRef.current = droneGroup;
    droneRotorsRef.current = rotors;

    // Groups
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);
    beaconsGroupRef.current = beaconsGroup;

    const gpsPinsGroup = new THREE.Group();
    scene.add(gpsPinsGroup);
    gpsPinsGroupRef.current = gpsPinsGroup;

    // Measurement Tool
    const measEngine = new SpatialMeasurementEngine(scene, camera, renderer.domElement);
    measurementEngineRef.current = measEngine;

    // Mouse & Touch Controls
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging.current = true;
      if (e.button === 2) isPanning.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

      if (isDragging.current) {
        spherical.current.theta -= dx * 0.005;
        spherical.current.phi = Math.max(0.08, Math.min(Math.PI / 2.05, spherical.current.phi - dy * 0.005));
      } else if (isPanning.current) {
        const factor = spherical.current.radius * 0.001;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        target.current.addScaledVector(right, -dx * factor);
        target.current.addScaledVector(forward, dy * factor);
      }

      // Cursor live GPS telemetry raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(groundMesh, false);
      if (intersects.length > 0 && onGpsUpdateRef.current) {
        const pt = intersects[0].point;
        const gps = sceneToGps(pt.x, pt.z, pt.y);
        onGpsUpdateRef.current({
          latitude: Number(gps.lat.toFixed(6)),
          longitude: Number(gps.lng.toFixed(6)),
          altitude_m: Number(gps.alt.toFixed(1)),
          heading_deg: 42,
          satellites: 18,
          accuracy_m: 0.4
        });
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      isPanning.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.current.radius = Math.max(25, Math.min(650, spherical.current.radius + e.deltaY * 0.25));
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // GPS Pin drop mode
      if (gpsPinModeRef.current) {
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const pt = intersects[0].point;
          const gps = sceneToGps(pt.x, pt.z, pt.y);

          // Add visual 3D pin marker
          const pinGeo = new THREE.ConeGeometry(1.2, 5.0, 16);
          const pinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
          const pin = new THREE.Mesh(pinGeo, pinMat);
          pin.rotation.x = Math.PI;
          pin.position.set(pt.x, pt.y + 4.5, pt.z);
          gpsPinsGroupRef.current?.add(pin);

          if (onDropGpsPinRef.current) {
            onDropGpsPinRef.current({
              lat: Number(gps.lat.toFixed(6)),
              lng: Number(gps.lng.toFixed(6)),
              altitude: Number(gps.alt.toFixed(1)),
              label: `MLRIT GPS Waypoint [${gps.lat.toFixed(5)}N, ${gps.lng.toFixed(5)}E]`
            });
          }
          return;
        }
      }

      // Measurement mode
      if (measurementEngineRef.current && measurementEngineRef.current.currentMode !== 'NONE') {
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          measurementEngineRef.current.handleClick(intersects[0].point);
          return;
        }
      }

      // Building selection
      if (buildingsGroupRef.current) {
        const intersects = raycaster.intersectObjects(buildingsGroupRef.current.children, true);
        if (intersects.length > 0) {
          let obj: THREE.Object3D | null = intersects[0].object;
          while (obj && !obj.userData?.building) {
            obj = obj.parent;
          }
          if (obj && obj.userData?.building) {
            onSelectBuildingRef.current(obj.userData.building);
          }
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouse.current.x;
      const dy = e.touches[0].clientY - prevMouse.current.y;
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      spherical.current.theta -= dx * 0.005;
      spherical.current.phi = Math.max(0.08, Math.min(Math.PI / 2.05, spherical.current.phi - dy * 0.005));
    };
    const onTouchEnd = () => { isDragging.current = false; };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: true });
    dom.addEventListener('click', onClick);
    dom.addEventListener('contextmenu', (e) => e.preventDefault());
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    // Resize — window + ResizeObserver so canvas recovers when leaving display:none
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w < 2 || h < 2) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);
    // One deferred pass after layout settles (Netlify / shared tabs)
    requestAnimationFrame(() => handleResize());
    setTimeout(handleResize, 120);
    setTimeout(handleResize, 500);

    // MLRIT Drone Patrol Waypoints
    const waypoints = [
      new THREE.Vector3(0, 32, -85),    // Admin
      new THREE.Vector3(-70, 36, -40),  // Aero Block
      new THREE.Vector3(65, 38, -40),   // CIET Tower
      new THREE.Vector3(75, 30, 40),    // Auditorium
      new THREE.Vector3(135, 28, 90),   // Sports Arena
      new THREE.Vector3(135, 26, -70),  // 33kV Substation
      new THREE.Vector3(-135, 34, -15), // Boys Hostel
      new THREE.Vector3(0, 32, -85)     // Return to Admin
    ];

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Animate drone along patrol circuit
      if (droneGroupRef.current) {
        droneProgressRef.current = (droneProgressRef.current + 0.001) % 1.0;
        const totalSegments = waypoints.length - 1;
        const segIndex = Math.floor(droneProgressRef.current * totalSegments);
        const segT = (droneProgressRef.current * totalSegments) - segIndex;
        const p1 = waypoints[segIndex];
        const p2 = waypoints[(segIndex + 1) % waypoints.length];
        
        droneGroupRef.current.position.lerpVectors(p1, p2, segT);
        droneGroupRef.current.lookAt(p2.x, p2.y, p2.z);

        // Spin rotors
        droneRotorsRef.current.forEach(r => {
          r.rotation.y += 0.45;
        });
      }

      // Camera position
      const s = spherical.current;
      const x = target.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const y = target.current.y + s.radius * Math.cos(s.phi);
      const z = target.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.position.set(x, y, z);
      camera.lookAt(target.current);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Measurement Engine
  useEffect(() => {
    if (!measurementEngineRef.current) return;
    measurementEngineRef.current.setCallback(onMeasurementResult);
    if (measurementMode === 'DISTANCE') {
      measurementEngineRef.current.startDistanceMode();
    } else if (measurementMode === 'AREA') {
      measurementEngineRef.current.startAreaMode();
    } else {
      measurementEngineRef.current.clear();
    }
  }, [measurementMode, onMeasurementResult]);

  // Update View Mode: PURE SATELLITE vs 3D ON SATELLITE MAP vs REALISTIC vs SATELLITE
  useEffect(() => {
    if (satelliteMatRef.current && satelliteMeshRef.current) {
      if (viewMode === 'PURE_SATELLITE') {
        satelliteMeshRef.current.visible = true;
        satelliteMatRef.current.opacity = 1.0;
        if (groundMeshRef.current) groundMeshRef.current.visible = false;
        target.current.set(0, 0, 0);
        spherical.current = { radius: 340, theta: 0, phi: 0.15 };
      } else if (viewMode === '3D_ON_SATELLITE') {
        satelliteMeshRef.current.visible = true;
        satelliteMatRef.current.opacity = 1.0;
        if (groundMeshRef.current) groundMeshRef.current.visible = false;
      } else if (viewMode === 'SATELLITE') {
        satelliteMeshRef.current.visible = true;
        satelliteMatRef.current.opacity = 1.0;
        if (groundMeshRef.current) groundMeshRef.current.visible = false;
      } else if (viewMode === 'HYBRID') {
        satelliteMeshRef.current.visible = true;
        satelliteMatRef.current.opacity = 0.75;
        if (groundMeshRef.current) groundMeshRef.current.visible = true;
      } else {
        // 3D Realistic or Heatmap
        satelliteMeshRef.current.visible = false;
        satelliteMatRef.current.opacity = 0.0;
        if (groundMeshRef.current) groundMeshRef.current.visible = true;
      }
    }
  }, [viewMode]);

  // Rebuild Buildings
  useEffect(() => {
    if (!buildingsGroupRef.current || !sceneRef.current) return;
    const group = buildingsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (explodedGroupRef.current) {
      sceneRef.current.remove(explodedGroupRef.current);
      explodedGroupRef.current = null;
    }

    buildings.forEach(b => {
      if (isBuildingEntered && selectedBuilding?.id === b.id) {
        const expGroup = createExplodedFloorView(b, selectedFloor);
        sceneRef.current?.add(expGroup);
        explodedGroupRef.current = expGroup;
      } else {
        const bMesh = createBuildingMesh(b, viewMode);
        group.add(bMesh);
      }
    });
  }, [buildings, viewMode, isBuildingEntered, selectedBuilding, selectedFloor]);

  // Update 3D Floating Alert Beacons
  useEffect(() => {
    if (!beaconsGroupRef.current) return;
    const bg = beaconsGroupRef.current;
    while (bg.children.length > 0) bg.remove(bg.children[0]);

    alerts.forEach(alt => {
      if (alt.status === 'ACTIVE') {
        const beaconGeo = new THREE.CylinderGeometry(0.5, 3.0, 10, 16, 1, true);
        const colorHex = alt.severity === 'CRITICAL' ? 0xef4444 : (alt.severity === 'HIGH' ? 0xf59e0b : 0x38bdf8);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(alt.position_3d.x, alt.position_3d.y + 6, alt.position_3d.z);
        bg.add(beacon);
      }
    });
  }, [alerts]);

  // Sun lighting — always bright, never go dark
  useEffect(() => {
    if (!dirLightRef.current || !sceneRef.current) return;
    dirLightRef.current.position.set(-80, 180, 100);
    dirLightRef.current.intensity = 2.0;
    // Keep sky color consistent with UI theme
    if (viewMode === '3D_ON_SATELLITE' || viewMode === 'SATELLITE') {
      sceneRef.current.background = new THREE.Color(0x060c18);
    } else {
      sceneRef.current.background = new THREE.Color(0x0a1628);
    }
  }, [simulatedHour, viewMode]);

  // Camera Presets
  useEffect(() => {
    if (!cameraPreset) return;
    if (cameraPreset === 'CAMPUS') {
      target.current.set(0, 5, 0);
      spherical.current = { radius: 280, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    } else if (cameraPreset === 'AERIAL') {
      target.current.set(0, 0, 0);
      spherical.current = { radius: 360, theta: 0, phi: 0.15 };
    } else if (cameraPreset === 'DRONE' && droneGroupRef.current) {
      target.current.copy(droneGroupRef.current.position);
      spherical.current = { radius: 65, theta: Math.PI / 3, phi: Math.PI / 3.2 };
    } else if (cameraPreset === 'AERO') {
      target.current.set(-70, 10, -40);
      spherical.current = { radius: 110, theta: Math.PI / 3, phi: Math.PI / 3.2 };
    } else if (cameraPreset === 'CIET') {
      target.current.set(65, 12, -40);
      spherical.current = { radius: 120, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    } else if (cameraPreset === 'SPORTS') {
      target.current.set(135, 8, 90);
      spherical.current = { radius: 140, theta: -Math.PI / 2.5, phi: Math.PI / 3.2 };
    }
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
