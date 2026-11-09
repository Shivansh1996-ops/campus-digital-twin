import React, { useState, useEffect } from 'react';
import {
  Building, Asset, Alert, WastageItem, Recommendation,
  LiveTelemetry, ViewMode, EnergyFlowData, GpsCoordinate
} from './types/campus';
import {
  fetchCampusSummary, fetchBuildings, fetchAssets, fetchAlerts,
  fetchWastage, fetchRecommendations, fetchTelemetryHistory,
  fetchEnergyFlow, updateSimulationTime, subscribeTelemetryWs
} from './services/api';
import { MOCK_BUILDINGS, MOCK_ASSETS, MOCK_ALERTS, MOCK_WASTAGE, MOCK_RECOMMENDATIONS, MOCK_TELEMETRY, MOCK_ENERGY_FLOW } from './services/mockData';

import { TopNavbar } from './components/layout/TopNavbar';
import { SidebarNav, ActiveTab } from './components/layout/SidebarNav';
import { InspectorDrawer } from './components/layout/InspectorDrawer';
import { Campus3DScene } from './components/3d/Campus3DScene';
import { MeasurementResult } from './components/3d/MeasurementTool';

// Views
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { EnergyView } from './components/views/EnergyView';
import { WaterView } from './components/views/WaterView';
import { SolarView } from './components/views/SolarView';
import { HvacEnvView } from './components/views/HvacEnvView';
import { OccupancyView } from './components/views/OccupancyView';
import { AssetsView } from './components/views/AssetsView';
import { WastageView } from './components/views/WastageView';
import { OptimizationView } from './components/views/OptimizationView';
import { WhatIfStudio } from './components/views/WhatIfStudio';
import { TimelineView } from './components/views/TimelineView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { ExecutiveReportView } from './components/views/ExecutiveReportView';
import { AdminView } from './components/views/AdminView';
import { SatelliteView } from './components/views/SatelliteView';
import { LandingPage } from './components/views/LandingPage';

import {
  Box, Globe, Layers, Zap, Droplets, Users,
  Ruler, RotateCcw, Navigation, MapPin, ExternalLink
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('3D_TWIN');
  const [viewMode, setViewMode] = useState<ViewMode>('3D_ON_SATELLITE');
  const [cameraPreset, setCameraPreset] = useState<string>('CAMPUS');
  const show3D = activeTab === '3D_TWIN';

  // Core Data State
  const [telemetry, setTelemetry] = useState<LiveTelemetry | null>(MOCK_TELEMETRY);
  const [buildings, setBuildings] = useState<Building[]>(MOCK_BUILDINGS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [wastageItems, setWastageItems] = useState<WastageItem[]>(MOCK_WASTAGE);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [energyFlow, setEnergyFlow] = useState<EnergyFlowData | null>(MOCK_ENERGY_FLOW);
  const isPausedRef = React.useRef(false);

  // Selection & 3D Interactive State
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [isBuildingEntered, setIsBuildingEntered] = useState<boolean>(false);

  // Measurement State
  const [measurementMode, setMeasurementMode] = useState<'NONE' | 'DISTANCE' | 'AREA'>('NONE');
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);

  // GPS State
  const [currentGps, setCurrentGps] = useState<GpsCoordinate>({
    latitude: 17.59972,
    longitude: 78.43000,
    altitude_m: 545.0,
    heading_deg: 42,
    satellites: 18,
    accuracy_m: 0.4
  });
  const [gpsPinMode, setGpsPinMode] = useState<boolean>(false);
  const [droppedPins, setDroppedPins] = useState<Array<{ lat: number; lng: number; altitude: number; label: string }>>([]);
  const [booting, setBooting] = useState(false);
  const [onCampus, setOnCampus] = useState(false);

  // Simulation Controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);

  const enterTwin = (tab: ActiveTab = '3D_TWIN') => {
    setActiveTab(tab);
    setOnCampus(true);
    setBooting(true);
    window.setTimeout(() => setBooting(false), 900);
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchBuildings().then(setBuildings).catch(console.error);
    fetchAssets().then(setAssets).catch(console.error);
    fetchAlerts().then(setAlerts).catch(console.error);
    fetchWastage().then(setWastageItems).catch(console.error);
    fetchRecommendations().then(setRecommendations).catch(console.error);
    fetchTelemetryHistory().then(setHistoryData).catch(console.error);
    fetchEnergyFlow().then(setEnergyFlow).catch(console.error);

    fetchCampusSummary().then(res => setTelemetry(res.live_metrics)).catch(console.error);
    const unsubscribe = subscribeTelemetryWs((liveData) => {
      if (isPausedRef.current) return;
      setTelemetry(prev => prev ? {
        ...liveData,
        simulated_hour: prev.simulated_hour,
        simulated_time: prev.simulated_time,
        is_daylight: prev.is_daylight,
      } : liveData);
    });

    return () => unsubscribe();
  }, []);

  const handleSetSimulationTime = (hour: number) => {
    const h = Math.max(0, Math.min(23.5, hour));
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    const simulated_time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    setTelemetry(prev => prev ? {
      ...prev,
      simulated_hour: h,
      simulated_time,
      is_daylight: h >= 6 && h < 18.5,
    } : prev);
    updateSimulationTime(h);
  };

  const handleSetMultiplier = (m: number) => {
    setTimeMultiplier(m);
    updateSimulationTime(undefined, m);
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    isPausedRef.current = next;
    setIsPaused(next);
    updateSimulationTime(undefined, undefined, next);
  };

  const handleAiNavigate = (
    tab: ActiveTab,
    extra?: { buildingId?: string; cameraPreset?: string; gpsPin?: boolean; enter?: boolean }
  ) => {
    setActiveTab(tab);
    if (extra?.cameraPreset) setCameraPreset(extra.cameraPreset);
    if (extra?.buildingId) {
      const b = buildings.find(x => x.id === extra.buildingId);
      if (b) {
        setSelectedBuilding(b);
        setSelectedFloor(null);
        setIsBuildingEntered(!!extra.enter);
      }
    } else if (extra?.enter && selectedBuilding) {
      setIsBuildingEntered(true);
    }
    if (extra?.gpsPin) setGpsPinMode(true);
  };

  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    setSelectedFloor(null);
    setIsBuildingEntered(false);
    setActiveTab('3D_TWIN');
  };

  if (!onCampus) {
    return (
      <LandingPage
        onEnterTwin={() => enterTwin('3D_TWIN')}
        onEnterSatellite={() => enterTwin('SATELLITE')}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col app-shell text-[var(--text)] overflow-hidden font-sans select-none">
      <div className={`boot-splash ${booting ? '' : 'done'}`} aria-hidden={!booting}>
        <div className="text-center space-y-3">
          <div className="mx-auto w-11 h-11 rounded-xl bg-[#141414] text-white grid place-items-center font-extrabold text-sm">MLR</div>
          <div className="text-lg font-semibold tracking-tight text-[#141414]">MLRIT Twin</div>
          <p className="text-[13px] text-[#6b6b6b]">Opening campus scene…</p>
        </div>
      </div>

      <TopNavbar
        telemetry={telemetry}
        buildings={buildings}
        assets={assets}
        onGoHome={() => setOnCampus(false)}
        onSelectBuilding={handleSelectBuilding}
        onSetSimulationTime={handleSetSimulationTime}
        onSetMultiplier={handleSetMultiplier}
        onTogglePause={handleTogglePause}
        isPaused={isPaused}
        timeMultiplier={timeMultiplier}
      />

      <div className="flex-1 flex relative overflow-hidden min-h-0">
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== '3D_TWIN') {
              setIsBuildingEntered(false);
            }
          }}
          activeAlertsCount={telemetry?.alerts?.total_active ?? 2}
        />

        <main className="flex-1 relative overflow-hidden min-w-0 bg-[#f6f6f6]">
          {/* Keep WebGL mounted & sized even when other tabs are open (fixes Netlify 0×0 canvas) */}
          <div
            className="absolute inset-0"
            style={{
              visibility: show3D ? 'visible' : 'hidden',
              pointerEvents: show3D ? 'auto' : 'none',
              zIndex: show3D ? 1 : 0,
            }}
            aria-hidden={!show3D}
          >
            <Campus3DScene
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={handleSelectBuilding}
              selectedFloor={selectedFloor}
              isBuildingEntered={isBuildingEntered}
              viewMode={viewMode}
              simulatedHour={telemetry?.simulated_hour ?? 14.5}
              alerts={alerts}
              measurementMode={measurementMode}
              onMeasurementResult={setMeasurementResult}
              cameraPreset={cameraPreset}
              onGpsUpdate={setCurrentGps}
              gpsPinMode={gpsPinMode}
              onDropGpsPin={(pin) => {
                setDroppedPins(prev => [pin, ...prev]);
                setGpsPinMode(false);
              }}
            />

            <div className="absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-3 z-10 pointer-events-none">
              <div className="flex flex-wrap gap-1.5 pointer-events-auto font-mono">
                {[
                  { id: '3D_ON_SATELLITE' as ViewMode, label: '3D on Satellite', icon: Layers },
                  { id: '3D_REALISTIC' as ViewMode, label: 'Architectural', icon: Box },
                  { id: 'SATELLITE' as ViewMode, label: 'Orthophoto', icon: Globe },
                  { id: 'HEATMAP_ENERGY' as ViewMode, label: 'Energy', icon: Zap },
                  { id: 'HEATMAP_WATER' as ViewMode, label: 'Water', icon: Droplets },
                  { id: 'HEATMAP_OCCUPANCY' as ViewMode, label: 'Occupancy', icon: Users },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setViewMode(id)}
                    className={`scene-chip flex items-center gap-1.5 ${
                      viewMode === id ? 'scene-chip-active' : 'scene-chip-idle'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="pointer-events-auto flex items-center gap-1 glass-panel p-1.5 rounded-xl font-mono text-[11px]">
                <span className="text-[10px] text-[var(--muted)] px-1.5 uppercase tracking-wider">Fly to</span>
                {[
                  { id: 'CAMPUS', label: 'Overview' },
                  { id: 'AERIAL', label: 'Top-Down' },
                  { id: 'DRONE', label: 'Drone' },
                  { id: 'AERO', label: 'Aero' },
                  { id: 'CIET', label: 'CIET' },
                  { id: 'SPORTS', label: 'Stadium' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCameraPreset(preset.id);
                      setSelectedBuilding(null);
                      setIsBuildingEntered(false);
                    }}
                    className={`px-2 py-1 rounded-full transition-colors ${
                      cameraPreset === preset.id && !selectedBuilding
                        ? 'bg-[#141414] text-white font-semibold'
                        : 'text-[#6b6b6b] hover:bg-[#f6f6f6] hover:text-[#141414]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="absolute top-[4.5rem] left-4 flex flex-col space-y-2 z-10 font-mono text-xs max-w-sm animate-fade-in-up">
              <div className="glass-panel-glow p-3 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <div className="flex items-center space-x-1.5 text-[#141414] font-bold text-[10px] tracking-wide">
                    <Navigation className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>MLRIT GPS · RTK FIXED</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    {currentGps.satellites} SATS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[var(--muted)]">LAT</span>
                    <span className="text-[var(--text)] font-bold ml-1">{currentGps.latitude.toFixed(6)}° N</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">LNG</span>
                    <span className="text-[var(--text)] font-bold ml-1">{currentGps.longitude.toFixed(6)}° E</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">ALT</span>
                    <span className="text-[#141414] font-bold ml-1">{currentGps.altitude_m}m AMSL</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">ACC</span>
                    <span className="text-emerald-400 font-bold ml-1">±{currentGps.accuracy_m}m</span>
                  </div>
                </div>

                <div className="pt-1.5 flex items-center justify-between border-t border-white/5">
                  <button
                    onClick={() => setGpsPinMode(!gpsPinMode)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                      gpsPinMode
                        ? 'bg-[var(--amber)] text-[#1a1208] animate-breathe'
                        : 'bg-[#f6f6f6] text-[#141414] hover:bg-[#ececec]'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{gpsPinMode ? 'Click map to place' : 'Drop GPS pin'}</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps?q=${currentGps.latitude},${currentGps.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#141414] hover:underline flex items-center space-x-1"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {droppedPins.length > 0 && (
                <div className="glass-panel p-2.5 rounded-xl text-[10px] space-y-1">
                  <div className="text-[var(--muted)] font-bold uppercase tracking-wide">Waypoints ({droppedPins.length})</div>
                  {droppedPins.slice(0, 2).map((p, pIdx) => (
                    <div key={pIdx} className="p-1.5 rounded-lg bg-black/30 flex justify-between items-center text-[#c5d4dc]">
                      <span>{p.lat.toFixed(5)}N, {p.lng.toFixed(5)}E</span>
                      <a
                        href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7dd3c0] hover:underline flex items-center space-x-0.5"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-3 glass-panel-glow px-4 py-2.5 rounded-2xl z-20 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-[#141414]" />
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Spatial</span>
              </div>

              <button
                onClick={() => {
                  setMeasurementMode(measurementMode === 'DISTANCE' ? 'NONE' : 'DISTANCE');
                  setMeasurementResult(null);
                }}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  measurementMode === 'DISTANCE'
                    ? 'bg-[#141414] text-white font-semibold'
                    : 'text-[#6b6b6b] hover:bg-[#f6f6f6] hover:text-[#141414]'
                }`}
              >
                Distance
              </button>

              <button
                onClick={() => {
                  setMeasurementMode(measurementMode === 'AREA' ? 'NONE' : 'AREA');
                  setMeasurementResult(null);
                }}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  measurementMode === 'AREA'
                    ? 'bg-[#141414] text-white font-semibold'
                    : 'text-[#6b6b6b] hover:bg-[#f6f6f6] hover:text-[#141414]'
                }`}
              >
                Area
              </button>

              {measurementResult && (
                <div className="pl-3 border-l border-[var(--line)] text-[#141414] font-bold">
                  {measurementResult.summaryText}
                </div>
              )}

              {measurementMode !== 'NONE' && (
                <button
                  onClick={() => {
                    setMeasurementMode('NONE');
                    setMeasurementResult(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg text-[var(--muted)] hover:text-white"
                  title="Clear measurement"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Tab Views sit above the (hidden) WebGL layer */}
          <div key={activeTab} className={`relative z-10 h-full view-enter ${show3D ? 'pointer-events-none' : ''}`}>
          {activeTab === 'OVERVIEW' && (
            <OverviewDashboard
              telemetry={telemetry}
              buildings={buildings}
              alerts={alerts}
              wastageItems={wastageItems}
              onSelectBuilding={handleSelectBuilding}
              historyData={historyData}
            />
          )}

          {activeTab === 'ENERGY' && (
            <EnergyView
              telemetry={telemetry}
              buildings={buildings}
              energyFlow={energyFlow}
              historyData={historyData}
            />
          )}

          {activeTab === 'WATER' && (
            <WaterView
              telemetry={telemetry}
              buildings={buildings}
              alerts={alerts}
            />
          )}

          {activeTab === 'SOLAR' && (
            <SolarView
              telemetry={telemetry}
              buildings={buildings}
              onSelectBuilding={handleSelectBuilding}
            />
          )}

          {activeTab === 'HVAC' && (
            <HvacEnvView
              telemetry={telemetry}
              buildings={buildings}
            />
          )}

          {activeTab === 'OCCUPANCY' && (
            <OccupancyView
              telemetry={telemetry}
              buildings={buildings}
              onSelectBuilding={handleSelectBuilding}
            />
          )}

          {activeTab === 'ASSETS' && (
            <AssetsView
              assets={assets}
              buildings={buildings}
              onSelectBuilding={handleSelectBuilding}
            />
          )}

          {activeTab === 'WASTAGE' && (
            <WastageView
              wastageItems={wastageItems}
              onSelectBuilding={handleSelectBuilding}
              buildings={buildings}
            />
          )}

          {activeTab === 'OPTIMIZATION' && (
            <OptimizationView
              recommendations={recommendations}
            />
          )}

          {activeTab === 'WHAT_IF' && (
            <WhatIfStudio />
          )}

          {activeTab === 'TIMELINE' && (
            <TimelineView />
          )}

          {activeTab === 'AI_ASSISTANT' && (
            <AiAssistantView onNavigate={handleAiNavigate} />
          )}

          {activeTab === 'REPORT' && (
            <ExecutiveReportView />
          )}

          {activeTab === 'ADMIN' && (
            <AdminView
              buildings={buildings}
              onRefresh={() => fetchBuildings().then(setBuildings)}
            />
          )}

          {activeTab === 'SATELLITE' && (
            <SatelliteView
              buildings={buildings}
              onSelectBuilding={handleSelectBuilding}
              telemetry={telemetry}
            />
          )}
          </div>
        </main>

        {/* Right Dynamic Context Inspector Drawer */}
        <InspectorDrawer
          building={selectedBuilding}
          onClose={() => {
            setSelectedBuilding(null);
            setIsBuildingEntered(false);
          }}
          isEntered={isBuildingEntered}
          onToggleEnter={() => setIsBuildingEntered(!isBuildingEntered)}
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
          alerts={alerts}
          wastageItems={wastageItems}
        />
      </div>
    </div>
  );
};

export default App;
