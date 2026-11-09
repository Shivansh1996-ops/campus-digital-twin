import {
  Building, Asset, Alert, WastageItem, Recommendation,
  LiveTelemetry, WhatIfRequest, WhatIfResponse,
  EnergyFlowData
} from '../types/campus';
import {
  MOCK_BUILDINGS, MOCK_TELEMETRY, MOCK_ALERTS,
  MOCK_WASTAGE, MOCK_RECOMMENDATIONS, MOCK_ENERGY_FLOW,
  MOCK_ASSETS, startMockTelemetryStream
} from './mockData';
import {
  runLocalWhatIf, buildExecutiveReport, buildTimeline, answerCampusQuery
} from './clientIntelligence';

const API_BASE = '/api';

/** Netlify SPA redirects make /api/* return index.html with 200 — never treat that as a live API. */
function shouldForceMock(): boolean {
  if (import.meta.env.VITE_FORCE_MOCK === 'true') return true;
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  if (host.includes('netlify.app') || host.includes('netlify.com')) return true;
  return false;
}

let _backendAvailable: boolean | null = null;

async function isBackendUp(): Promise<boolean> {
  if (shouldForceMock()) {
    _backendAvailable = false;
    return false;
  }
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const res = await fetch(`${API_BASE}/campus`, {
      signal: AbortSignal.timeout(2000),
      headers: { Accept: 'application/json' },
    });
    const ct = res.headers.get('content-type') || '';
    _backendAvailable = res.ok && ct.includes('application/json');
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  const up = await isBackendUp();
  if (!up) return fallback;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return fallback;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

// ─── PUBLIC API ─────────────────────────────────────────────────

export async function fetchCampusSummary() {
  const up = await isBackendUp();
  if (!up) return {
    campus_name: 'Marri Laxman Reddy Institute of Technology (MLRIT)',
    campus_code: 'MLRIT-HYD',
    location: { name: 'Dundigal, Gandimaisamma, Hyderabad, Telangana', lat: 17.5997, lng: 78.43, altitude_m: 545 },
    spatial_metrics: {} as any,
    live_metrics: MOCK_TELEMETRY,
    active_alerts_count: 3,
    critical_alerts_count: 1,
    simulation_mode: true,
  };
  try {
    const res = await fetch(`${API_BASE}/campus`, { headers: { Accept: 'application/json' } });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) {
      return {
        campus_name: 'Marri Laxman Reddy Institute of Technology (MLRIT)',
        campus_code: 'MLRIT-HYD',
        location: { name: 'Dundigal, Gandimaisamma, Hyderabad, Telangana', lat: 17.5997, lng: 78.43, altitude_m: 545 },
        spatial_metrics: {} as any,
        live_metrics: MOCK_TELEMETRY,
        active_alerts_count: 3,
        critical_alerts_count: 1,
        simulation_mode: true,
      };
    }
    return res.json();
  } catch {
    return {
      campus_name: 'Marri Laxman Reddy Institute of Technology (MLRIT)',
      campus_code: 'MLRIT-HYD',
      location: { name: 'Dundigal, Gandimaisamma, Hyderabad, Telangana', lat: 17.5997, lng: 78.43, altitude_m: 545 },
      spatial_metrics: {} as any,
      live_metrics: MOCK_TELEMETRY,
      active_alerts_count: 3,
      critical_alerts_count: 1,
      simulation_mode: true,
    };
  }
}

export async function fetchBuildings(): Promise<Building[]> {
  return safeFetch(`${API_BASE}/buildings`, MOCK_BUILDINGS);
}

export async function fetchAssets(): Promise<Asset[]> {
  return safeFetch(`${API_BASE}/assets`, MOCK_ASSETS);
}

export async function fetchLiveTelemetry(): Promise<LiveTelemetry> {
  return safeFetch(`${API_BASE}/telemetry/live`, MOCK_TELEMETRY);
}

export async function fetchTelemetryHistory(): Promise<any[]> {
  return safeFetch(`${API_BASE}/telemetry/history`, generateMockHistory());
}

export async function fetchEnergyFlow(): Promise<EnergyFlowData> {
  return safeFetch(`${API_BASE}/energy-flow`, MOCK_ENERGY_FLOW);
}

export async function fetchAlerts(): Promise<Alert[]> {
  return safeFetch(`${API_BASE}/alerts`, MOCK_ALERTS);
}

export async function fetchWastage(): Promise<WastageItem[]> {
  return safeFetch(`${API_BASE}/wastage`, MOCK_WASTAGE);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return safeFetch(`${API_BASE}/recommendations`, MOCK_RECOMMENDATIONS);
}

export async function updateSimulationTime(hour?: number, multiplier?: number, paused?: boolean) {
  const up = await isBackendUp();
  if (!up) return;
  try {
    await fetch(`${API_BASE}/simulation/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hour, multiplier, paused })
    });
  } catch { /* silent */ }
}

export async function simulateWhatIf(req: WhatIfRequest): Promise<WhatIfResponse> {
  const up = await isBackendUp();
  if (!up) return runLocalWhatIf(req);
  try {
    const res = await fetch(`${API_BASE}/simulation/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req)
    });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) return runLocalWhatIf(req);
    return res.json();
  } catch {
    return runLocalWhatIf(req);
  }
}

export async function queryAIAssistant(query: string, contextBuildingId?: string): Promise<any> {
  const local = answerCampusQuery(query, contextBuildingId);
  const up = await isBackendUp();
  if (!up) return local;
  try {
    const res = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, context_building_id: contextBuildingId })
    });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) return local;
    return res.json();
  } catch {
    return local;
  }
}

export async function fetchTimeline(): Promise<any[]> {
  return safeFetch(`${API_BASE}/timeline`, buildTimeline());
}

export async function fetchExecutiveReport(): Promise<any> {
  return safeFetch(`${API_BASE}/reports/executive`, buildExecutiveReport());
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  const up = await isBackendUp();
  if (!up) return;
  await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, { method: 'POST' }).catch(() => {});
}

export async function resolveAlert(alertId: string): Promise<void> {
  const up = await isBackendUp();
  if (!up) return;
  await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: 'POST' }).catch(() => {});
}

// ─── TELEMETRY WEBSOCKET WITH MOCK FALLBACK ──────────────────────
export function subscribeTelemetryWs(onData: (data: LiveTelemetry) => void): () => void {
  let wsUnsub: (() => void) | null = null;
  let mockUnsub: (() => void) | null = null;
  let active = true;

  // Always seed with mock immediately so UI never waits on a bad API probe
  onData({ ...MOCK_TELEMETRY, timestamp: new Date().toISOString() });

  isBackendUp().then(up => {
    if (!active) return;
    if (up) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
      let ws: WebSocket | null = null;
      let wsActive = true;
      let fellBack = false;

      const connect = () => {
        if (!wsActive) return;
        try {
          ws = new WebSocket(wsUrl);
          ws.onmessage = e => { try { onData(JSON.parse(e.data)); } catch {} };
          ws.onclose = () => {
            if (!wsActive) return;
            if (!fellBack) {
              fellBack = true;
              mockUnsub = startMockTelemetryStream(onData);
            }
            setTimeout(connect, 5000);
          };
          ws.onerror = () => { if (ws) ws.close(); };
        } catch {
          if (!fellBack) {
            fellBack = true;
            mockUnsub = startMockTelemetryStream(onData);
          }
        }
      };
      connect();
      wsUnsub = () => { wsActive = false; ws?.close(); };
    } else {
      mockUnsub = startMockTelemetryStream(onData);
    }
  });

  return () => {
    active = false;
    wsUnsub?.();
    mockUnsub?.();
  };
}

// ─── MOCK HISTORY DATA ──────────────────────────────────────────
function generateMockHistory() {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const power_kw = Math.round(1200 + Math.sin(i * 0.26) * 800 + (i % 5) * 40);
    const solar_gen_kw = Math.max(0, Math.round(Math.sin((i - 6) * 0.26) * 1420));
    return {
      timestamp: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
      simulated_hour: i,
      hour: i,
      time_label: `${String(i).padStart(2, '0')}:00`,
      power_kw,
      solar_gen_kw,
      power: { total_consumption_kw: power_kw },
      solar: { generation_kw: solar_gen_kw },
      water: { total_flow_lpm: 300 + Math.sin(i * 0.4) * 180 },
      occupancy: { total_occupancy: Math.round(500 + Math.sin(i * 0.26) * 4200) },
    };
  });
}
