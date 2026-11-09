import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Globe, Navigation, MapPin, Layers, ZoomIn, ZoomOut,
  Crosshair, Activity, Zap, Droplets, Users, Sun,
  AlertTriangle, Shield, Wind, Thermometer, Building2,
  ChevronRight, X, ExternalLink, Radio, Satellite
} from 'lucide-react';
import { Building, LiveTelemetry } from '../../types/campus';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SatelliteViewProps {
  buildings: Building[];
  onSelectBuilding: (b: Building) => void;
  telemetry: LiveTelemetry | null;
}

/* ─── MLRIT PRECISE BUILDING POSITIONS (GPS) ─────────────────── */
const BUILDING_GPS: Record<string, { lat: number; lng: number; w: number; h: number }> = {
  'ADMIN':    { lat: 17.5997,  lng: 78.4300,  w: 0.00025, h: 0.00020 },
  'AERO':     { lat: 17.5993,  lng: 78.4282,  w: 0.00030, h: 0.00022 },
  'CIET':     { lat: 17.5998,  lng: 78.4315,  w: 0.00022, h: 0.00032 },
  'ECE':      { lat: 17.6003,  lng: 78.4298,  w: 0.00028, h: 0.00024 },
  'MECH':     { lat: 17.6001,  lng: 78.4308,  w: 0.00028, h: 0.00022 },
  'LIB':      { lat: 17.5994,  lng: 78.4302,  w: 0.00026, h: 0.00018 },
  'AUD':      { lat: 17.5990,  lng: 78.4310,  w: 0.00032, h: 0.00020 },
  'HOSTEL-B': { lat: 17.5988,  lng: 78.4285,  w: 0.00030, h: 0.00025 },
  'HOSTEL-G': { lat: 17.5985,  lng: 78.4305,  w: 0.00028, h: 0.00025 },
  'SPORTS':   { lat: 17.5985,  lng: 78.4325,  w: 0.00045, h: 0.00040 },
};

/* ─── METRIC LAYER OPTIONS ───────────────────────────────────── */
type DataLayer = 'NONE' | 'ENERGY' | 'WATER' | 'OCCUPANCY' | 'SOLAR';

function getBuildingLayerColor(b: Building, layer: DataLayer): string {
  if (layer === 'ENERGY') {
    const pct = b.energy_consumption_kw / 600;
    if (pct > 0.75) return '#ef4444';
    if (pct > 0.45) return '#f59e0b';
    return '#10b981';
  }
  if (layer === 'WATER') {
    const pct = (b.water_consumption_lpm ?? 1000) / 3000;
    if (pct > 0.75) return '#3b82f6';
    if (pct > 0.45) return '#06b6d4';
    return '#22d3ee';
  }
  if (layer === 'OCCUPANCY') {
    const pct = b.current_occupancy / b.max_capacity;
    if (pct > 0.75) return '#8b5cf6';
    if (pct > 0.40) return '#f59e0b';
    return '#64748b';
  }
  if (layer === 'SOLAR') {
    return b.solar_capacity_kw > 0 ? '#f59e0b' : '#334155';
  }
  return b.color_hex ?? '#22d3ee';
}

/* ─── POPUP HTML ─────────────────────────────────────────────── */
function buildingPopupHTML(b: Building): string {
  const occ = Math.round((b.current_occupancy / b.max_capacity) * 100);
  const occColor = occ > 75 ? '#f87171' : occ > 40 ? '#fbbf24' : '#34d399';
  return `
  <div style="padding:14px 16px;min-width:240px;font-family:'JetBrains Mono',monospace">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;border-bottom:1px solid rgba(34,211,238,0.15);padding-bottom:10px">
      <span style="background:rgba(34,211,238,0.15);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;font-size:9px;padding:2px 7px;border-radius:4px;font-weight:700">${b.code}</span>
      <span style="color:#f1f5f9;font-size:12px;font-weight:700;flex:1">${b.name}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div>
        <div style="color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:0.05em">Power Draw</div>
        <div style="color:#22d3ee;font-size:14px;font-weight:700">${b.energy_consumption_kw}<span style="font-size:9px;color:#94a3b8"> kW</span></div>
      </div>
      <div>
        <div style="color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:0.05em">Occupancy</div>
        <div style="color:${occColor};font-size:14px;font-weight:700">${occ}<span style="font-size:9px;color:#94a3b8">%</span></div>
      </div>
      <div>
        <div style="color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:0.05em">Solar Capacity</div>
        <div style="color:#f59e0b;font-size:13px;font-weight:700">${b.solar_capacity_kw || 0}<span style="font-size:9px;color:#94a3b8"> kWp</span></div>
      </div>
      <div>
        <div style="color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:0.05em">Floors</div>
        <div style="color:#f1f5f9;font-size:13px;font-weight:700">${b.floors_count}<span style="font-size:9px;color:#94a3b8"> lvls</span></div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(34,211,238,0.1)">
      <div style="background:rgba(34,211,238,0.07);border-radius:4px;height:4px;overflow:hidden">
        <div style="width:${occ}%;height:100%;background:linear-gradient(90deg,#0891b2,#22d3ee);border-radius:4px"></div>
      </div>
    </div>
  </div>`;
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({
  buildings, onSelectBuilding, telemetry
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonsGroup = useRef<L.FeatureGroup | null>(null);
  const esriLayer = useRef<L.TileLayer | null>(null);
  const labelsLayer = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'SATELLITE' | 'HYBRID'>('SATELLITE');
  const [dataLayer, setDataLayer] = useState<DataLayer>('NONE');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [cursorCoords, setCursorCoords] = useState({ lat: 17.59972, lng: 78.43000 });
  const [zoom, setZoom] = useState(17);
  const [showFootprints, setShowFootprints] = useState(true);

  /* ─── INIT MAP ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [17.59972, 78.43000],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20,
      minZoom: 14,
    });
    mapInstance.current = map;

    // Esri World Imagery (Google Maps quality)
    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20 }
    ).addTo(map);
    esriLayer.current = esri;

    // Hybrid labels overlay
    const labels = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 20, opacity: 0.3, subdomains: ['a','b','c'] }
    );
    labelsLayer.current = labels;

    // Campus boundary
    const campus: [number,number][] = [
      [17.6016, 78.4278], [17.6016, 78.4322],
      [17.5980, 78.4322], [17.5980, 78.4278]
    ];
    L.polygon(campus, {
      color: '#22d3ee', weight: 2.5, dashArray: '8 6',
      fillColor: '#22d3ee', fillOpacity: 0.03
    }).addTo(map);

    // Center pin
    L.circleMarker([17.59972, 78.43000], {
      radius: 5, fillColor: '#22d3ee', fillOpacity: 1,
      color: '#fff', weight: 2
    }).addTo(map).bindTooltip('MLRIT Campus Center', { permanent: false });

    // Polygon group
    const pg = L.featureGroup().addTo(map);
    polygonsGroup.current = pg;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) });
    });
    map.on('zoom', () => setZoom(map.getZoom()));

    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 200);

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  /* ─── DRAW BUILDING FOOTPRINTS ─────────────────────────────── */
  const drawFootprints = useCallback(() => {
    const pg = polygonsGroup.current;
    if (!pg) return;
    pg.clearLayers();

    if (!showFootprints) return;

    buildings.forEach(b => {
      // Try to get precise GPS position, otherwise estimate from 3D coords
      const gps = BUILDING_GPS[b.code];
      const lat = gps ? gps.lat : 17.59972 - (b.position_3d.z * 0.0000090);
      const lng = gps ? gps.lng : 78.43000 + (b.position_3d.x * 0.0000095);
      const hw = gps ? gps.w / 2 : (b.dimensions_3d.width * 0.0000095) / 2;
      const hd = gps ? gps.h / 2 : (b.dimensions_3d.depth * 0.0000090) / 2;

      const color = getBuildingLayerColor(b, dataLayer);
      const bounds: [number, number][] = [
        [lat + hd, lng - hw], [lat + hd, lng + hw],
        [lat - hd, lng + hw], [lat - hd, lng - hw],
      ];

      const poly = L.polygon(bounds, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: dataLayer === 'NONE' ? 0.28 : 0.55,
      });

      poly.bindPopup(buildingPopupHTML(b), {
        maxWidth: 280, className: 'mlrit-popup'
      });

      poly.on('click', () => {
        setSelectedBuilding(b);
        onSelectBuilding(b);
      });

      // Label
      const label = L.divIcon({
        html: `<div style="
          font-family:'JetBrains Mono',monospace;
          font-size:10px;font-weight:700;
          color:#e2e8f0;
          text-shadow:0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.8);
          white-space:nowrap;
          pointer-events:none;
          text-align:center;
        ">${b.code}</div>`,
        className: '',
        iconAnchor: [20, 6],
      });
      L.marker([lat, lng], { icon: label, interactive: false }).addTo(pg);

      poly.addTo(pg);
    });
  }, [buildings, dataLayer, showFootprints, onSelectBuilding]);

  useEffect(() => { drawFootprints(); }, [drawFootprints]);

  /* ─── LAYER TOGGLE ─────────────────────────────────────────── */
  const setLayerMode = (mode: 'SATELLITE' | 'HYBRID') => {
    setActiveLayer(mode);
    if (!mapInstance.current || !labelsLayer.current) return;
    if (mode === 'HYBRID') {
      labelsLayer.current.addTo(mapInstance.current);
    } else {
      mapInstance.current.removeLayer(labelsLayer.current);
    }
  };

  const healthScore = telemetry?.health_score?.overall_score ?? 82;
  const power = telemetry?.power?.total_consumption_kw ?? 1810;
  const solar = telemetry?.power?.solar_generation_kw ?? 0;
  const occ   = telemetry?.occupancy?.total_occupancy ?? 1196;
  const water = telemetry?.water?.total_flow_lpm ?? 661;
  const temp  = telemetry?.weather?.temperature_c ?? 29.3;
  const aqi   = telemetry?.weather?.air_quality_aqi ?? 42;
  const alerts = telemetry?.alerts?.total_active ?? 3;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden select-none bg-[#060c18]">

      {/* ── FULL SCREEN MAP ── */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* ── TOP LEFT: IDENTITY + LAYER CONTROLS ── */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 animate-fade-in-up">

        {/* Brand plate */}
        <div className="glass-bright rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg glow-cyan">
              <Satellite className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060c18] animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">MLRIT DUNDIGAL</div>
            <div className="text-[10px] font-mono text-cyan-400 tracking-widest">SATELLITE INTELLIGENCE PLATFORM</div>
          </div>
          <div className="ml-2 px-2 py-0.5 rounded-md badge-green text-[9px] font-mono font-bold">LIVE</div>
        </div>

        {/* Layer mode pills */}
        <div className="glass rounded-xl p-1.5 flex gap-1">
          {(['SATELLITE', 'HYBRID'] as const).map(m => (
            <button
              key={m}
              onClick={() => setLayerMode(m)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono transition-all ${
                activeLayer === m ? 'btn-active' : 'btn-ghost'
              }`}
            >
              {m === 'SATELLITE' ? '🛰 Satellite' : '🗺 Hybrid'}
            </button>
          ))}
        </div>

        {/* Data layer selector */}
        <div className="glass rounded-xl p-2 space-y-1.5">
          <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">Data Layer</div>
          <div className="grid grid-cols-2 gap-1">
            {([
              { id: 'NONE',      label: 'Default',   color: 'text-slate-400' },
              { id: 'ENERGY',    label: '⚡ Energy',  color: 'text-amber-400' },
              { id: 'WATER',     label: '💧 Water',   color: 'text-blue-400' },
              { id: 'OCCUPANCY', label: '👥 Occupancy', color: 'text-violet-400' },
              { id: 'SOLAR',     label: '☀ Solar',   color: 'text-yellow-400' },
            ] as const).map(l => (
              <button
                key={l.id}
                onClick={() => setDataLayer(l.id)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all ${
                  dataLayer === l.id
                    ? 'btn-active'
                    : `btn-ghost ${l.color}`
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show/hide footprints */}
        <button
          onClick={() => setShowFootprints(!showFootprints)}
          className={`glass rounded-xl px-3 py-2 text-[11px] font-mono font-semibold flex items-center gap-2 transition-all ${
            showFootprints ? 'text-cyan-300 border-cyan-500/30' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {showFootprints ? 'Building Footprints ON' : 'Footprints Hidden'}
        </button>
      </div>

      {/* ── TOP CENTER: COORDINATE BAR ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-bright rounded-xl px-5 py-2.5 flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">LAT</span>
            <span className="text-cyan-300 font-bold">{cursorCoords.lat.toFixed(5)}° N</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">LNG</span>
            <span className="text-cyan-300 font-bold">{cursorCoords.lng.toFixed(5)}° E</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-500">ZOOM</span>
            <span className="text-emerald-300 font-bold">{zoom}×</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-slate-500 text-[10px]">WGS-84 • 545m AMSL</span>
          <a
            href={`https://www.google.com/maps?q=${cursorCoords.lat},${cursorCoords.lng}&z=17`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-[10px]"
          >
            <ExternalLink className="w-3 h-3" />
            Maps
          </a>
        </div>
      </div>

      {/* ── TOP RIGHT: LIVE TELEMETRY STRIP ── */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Campus health */}
        <div className="glass-bright rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Campus Health</span>
            </div>
            <span className="badge-green px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
              {telemetry?.health_score?.grade ?? 'B+'}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold grad-text-green font-mono">{healthScore}</span>
            <span className="text-slate-500 text-xs mb-1">/100</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${healthScore}%`, background: 'linear-gradient(90deg,#059669,#10b981,#34d399)' }} />
          </div>
        </div>

        {/* Live metric tiles */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Zap,         label: 'POWER',   val: `${power.toFixed(0)} kW`,  color: 'text-amber-400',  bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            { icon: Sun,         label: 'SOLAR',   val: `${solar.toFixed(0)} kW`,  color: 'text-yellow-400', bg: 'rgba(253,224,71,0.1)', border: 'rgba(253,224,71,0.25)' },
            { icon: Droplets,    label: 'WATER',   val: `${water.toFixed(0)} LPM`, color: 'text-blue-400',   bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
            { icon: Users,       label: 'PEOPLE',  val: occ.toLocaleString(),       color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
            { icon: Thermometer, label: 'TEMP',    val: `${temp}°C`,                color: 'text-rose-400',   bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.25)' },
            { icon: Wind,        label: 'AQI',     val: `${aqi}`,                   color: 'text-teal-400',   bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.25)' },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label}
                className="rounded-xl p-3 metric-card"
                style={{ background: m.bg, border: `1px solid ${m.border}`, backdropFilter: 'blur(12px)' }}
              >
                <div className={`flex items-center gap-1.5 mb-1 ${m.color}`}>
                  <Icon className="w-3 h-3" />
                  <span className="text-[9px] font-mono font-bold tracking-widest">{m.label}</span>
                </div>
                <div className={`text-sm font-bold font-mono ${m.color}`}>{m.val}</div>
              </div>
            );
          })}
        </div>

        {/* Alerts pill */}
        {alerts > 0 && (
          <div className="glass-bright rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="relative">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono text-amber-300 font-bold">{alerts} Active Alerts</div>
              <div className="text-[9px] text-slate-500">1 Critical • 1 High • 1 Medium</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </div>
        )}
      </div>

      {/* ── BOTTOM LEFT: SATELLITE INTEL PANEL ── */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
        <div className="glass rounded-xl px-4 py-3 space-y-2 text-[10px] font-mono min-w-[220px]">
          <div className="text-slate-500 uppercase tracking-widest font-bold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-blink" />
            Orbital Pass Radar
          </div>
          {[
            { name: 'ISRO Cartosat-3 (0.25m)',  status: 'IN WINDOW',    color: 'text-amber-400' },
            { name: 'Sentinel-2A Multispectral', status: 'T-14h 22m',   color: 'text-emerald-400' },
            { name: 'Landsat-9 Thermal IR',      status: 'T-2d 08h',    color: 'text-blue-400' },
          ].map(s => (
            <div key={s.name} className="flex justify-between items-center gap-3">
              <span className="text-slate-400">{s.name}</span>
              <span className={`font-bold ${s.color}`}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Area metrics */}
        <div className="glass rounded-xl px-4 py-3 space-y-2 text-[10px] font-mono">
          <div className="text-slate-500 uppercase tracking-widest font-bold border-b border-slate-800 pb-1.5">Survey Data</div>
          {[
            { label: 'Campus Area', val: '25.0 Ac / 10.12 Ha', color: 'text-cyan-300' },
            { label: 'Built-up',    val: '65,000 m²',           color: 'text-slate-200' },
            { label: 'Rooftop PV', val: '8,500 m²',             color: 'text-amber-300' },
            { label: 'Green Zone', val: '42,000 m²',            color: 'text-emerald-300' },
          ].map(d => (
            <div key={d.label} className="flex justify-between">
              <span className="text-slate-500">{d.label}</span>
              <span className={`font-bold ${d.color}`}>{d.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM RIGHT: ZOOM CONTROLS ── */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => mapInstance.current?.zoomIn()}
          className="glass-bright w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:glow-cyan transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstance.current?.zoomOut()}
          className="glass-bright w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-cyan-300 transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstance.current?.setView([17.59972, 78.43000], 17)}
          className="glass-bright w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 hover:text-cyan-200 transition-all"
          title="Reset to MLRIT"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            mapInstance.current?.setView([17.59972, 78.43000], 19);
          }}
          className="glass-bright w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 hover:text-amber-200 transition-all"
          title="Max zoom"
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>

      {/* ── BUILDING DETAIL SLIDE-IN ── */}
      {selectedBuilding && (
        <div className="absolute top-4 left-1/2 ml-4 z-20 w-72 animate-fade-in-up" style={{ transform: 'none', left: 'auto', right: '380px' }}>
          <div className="glass-bright rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge-cyan px-2 py-0.5 rounded text-[9px] font-mono font-bold">{selectedBuilding.code}</span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{selectedBuilding.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedBuilding.type} · {selectedBuilding.floors_count} Floors · Est. {selectedBuilding.construction_year}</p>
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 grid grid-cols-2 gap-3 text-[10px] font-mono">
              {[
                { label: 'Power Draw',    val: `${selectedBuilding.energy_consumption_kw} kW`,      color: 'text-amber-400' },
                { label: 'Occupancy',     val: `${selectedBuilding.current_occupancy}/${selectedBuilding.max_capacity}`, color: 'text-violet-400' },
                { label: 'Solar Cap',     val: `${selectedBuilding.solar_capacity_kw || 0} kWp`,    color: 'text-yellow-400' },
                { label: 'Area',          val: `${selectedBuilding.footprint_area_sqm} m²`,          color: 'text-cyan-400' },
                { label: 'Rooms',         val: selectedBuilding.classroom_count?.toString() ?? '—',          color: 'text-slate-300' },
                { label: 'Efficiency',    val: `${selectedBuilding.energy_efficiency_score}%`,       color: 'text-emerald-400' },
              ].map(m => (
                <div key={m.label} className="glass-card rounded-xl p-2.5">
                  <div className="text-slate-600 mb-0.5">{m.label}</div>
                  <div className={`font-bold text-sm ${m.color}`}>{m.val}</div>
                </div>
              ))}
            </div>

            {/* Occupancy bar */}
            <div className="px-4 pb-4">
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1.5">
                <span>Occupancy</span>
                <span>{Math.round((selectedBuilding.current_occupancy / selectedBuilding.max_capacity) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${(selectedBuilding.current_occupancy / selectedBuilding.max_capacity) * 100}%`,
                  background: 'linear-gradient(90deg,#7c3aed,#8b5cf6)'
                }} />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { onSelectBuilding(selectedBuilding); setSelectedBuilding(null); }}
                  className="flex-1 btn-primary text-[11px] py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3 h-3" />
                  Full Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DATA LAYER LEGEND ── */}
      {dataLayer !== 'NONE' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-bright rounded-xl px-5 py-2.5 flex items-center gap-4 text-[10px] font-mono">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{dataLayer} LAYER:</span>
            {dataLayer === 'ENERGY' && <>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Low Consumption</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> High Consumption</span>
            </>}
            {dataLayer === 'WATER' && <>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-cyan-400 inline-block" /> Low Usage</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> High Usage</span>
            </>}
            {dataLayer === 'OCCUPANCY' && <>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" /> Empty</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" /> Full</span>
            </>}
            {dataLayer === 'SOLAR' && <>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Solar Equipped</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-700 inline-block" /> No Solar</span>
            </>}
          </div>
        </div>
      )}

      {/* ── SIMULATION MODE BADGE ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" style={{ bottom: dataLayer !== 'NONE' ? '56px' : '16px' }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[9px] font-mono text-slate-500 border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          SIMULATION MODE — IoT READY FOR REAL SENSOR DATA
        </div>
      </div>
    </div>
  );
};
