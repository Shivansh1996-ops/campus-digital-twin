import * as THREE from 'three';

export interface MeasurementResult {
  mode: 'DISTANCE' | 'AREA';
  points: THREE.Vector3[];
  distanceMeters?: number;
  distanceFeet?: number;
  areaSqm?: number;
  areaSqft?: number;
  areaHectares?: number;
  areaAcres?: number;
  summaryText: string;
}

export class SpatialMeasurementEngine {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private raycaster: THREE.Raycaster;
  private activePoints: THREE.Vector3[] = [];
  private measurementGroup: THREE.Group;
  private onResultCallback?: (res: MeasurementResult) => void;
  public currentMode: 'NONE' | 'DISTANCE' | 'AREA' = 'NONE';

  constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.measurementGroup = new THREE.Group();
    this.measurementGroup.name = 'measurement_tool_group';
    this.scene.add(this.measurementGroup);
  }

  public setCallback(cb: (res: MeasurementResult) => void) {
    this.onResultCallback = cb;
  }

  public startDistanceMode() {
    this.clear();
    this.currentMode = 'DISTANCE';
  }

  public startAreaMode() {
    this.clear();
    this.currentMode = 'AREA';
  }

  public clear() {
    this.activePoints = [];
    while (this.measurementGroup.children.length > 0) {
      const obj = this.measurementGroup.children[0];
      this.measurementGroup.remove(obj);
    }
    this.currentMode = 'NONE';
  }

  public handleClick(intersectPoint: THREE.Vector3) {
    if (this.currentMode === 'NONE') return;

    // Add marker sphere at click point
    const markerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.position.copy(intersectPoint);
    this.measurementGroup.add(markerMesh);

    this.activePoints.push(intersectPoint.clone());

    if (this.currentMode === 'DISTANCE') {
      if (this.activePoints.length === 2) {
        // Draw laser distance line
        const p1 = this.activePoints[0];
        const p2 = this.activePoints[1];
        const dist = p1.distanceTo(p2);
        const distFt = dist * 3.28084;

        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
        const line = new THREE.Line(lineGeo, lineMat);
        this.measurementGroup.add(line);

        const result: MeasurementResult = {
          mode: 'DISTANCE',
          points: [...this.activePoints],
          distanceMeters: Math.round(dist * 10) / 10,
          distanceFeet: Math.round(distFt * 10) / 10,
          summaryText: `${dist.toFixed(1)} m (${distFt.toFixed(1)} ft)`
        };

        if (this.onResultCallback) this.onResultCallback(result);
        // Reset points for next distance measurement
        this.activePoints = [];
      }
    } else if (this.currentMode === 'AREA') {
      if (this.activePoints.length >= 3) {
        // Redraw polygon contour and fill
        this.renderPolygon();
      }
    }
  }

  private renderPolygon() {
    // Remove previous polygon lines/fills
    const existing = this.measurementGroup.children.filter(c => c.name === 'poly_render');
    existing.forEach(e => this.measurementGroup.remove(e));

    // Contour line
    const pts = [...this.activePoints, this.activePoints[0]]; // closed loop
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.name = 'poly_render';
    this.measurementGroup.add(line);

    // Compute Shoelace Formula on X-Z plane
    let area = 0.0;
    const n = this.activePoints.length;
    for (let i = 0; i < n; i++) {
      const p1 = this.activePoints[i];
      const p2 = this.activePoints[(i + 1) % n];
      area += (p1.x * p2.z - p2.x * p1.z);
    }
    const areaSqm = Math.abs(area) / 2.0;
    const areaSqft = areaSqm * 10.7639;
    const areaHa = areaSqm / 10000.0;
    const areaAcres = areaSqm / 4046.86;

    const result: MeasurementResult = {
      mode: 'AREA',
      points: [...this.activePoints],
      areaSqm: Math.round(areaSqm),
      areaSqft: Math.round(areaSqft),
      areaHectares: Math.round(areaHa * 100) / 100,
      areaAcres: Math.round(areaAcres * 100) / 100,
      summaryText: `${Math.round(areaSqm).toLocaleString()} m² | ${areaHa.toFixed(2)} ha (${areaAcres.toFixed(2)} acres)`
    };

    if (this.onResultCallback) this.onResultCallback(result);
  }
}
