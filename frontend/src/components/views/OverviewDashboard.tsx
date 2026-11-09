import React from 'react';
import {
  Zap, Droplets, Sun, Users, ShieldCheck, AlertTriangle,
  TrendingUp, Activity, ArrowUpRight, BarChart3, Wind
} from 'lucide-react';
import { LiveTelemetry, Building, Alert, WastageItem } from '../../types/campus';

interface OverviewDashboardProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  alerts: Alert[];
  wastageItems: WastageItem[];
  onSelectBuilding: (b: Building) => void;
  historyData: any[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  telemetry,
  buildings,
  alerts,
  wastageItems,
  onSelectBuilding,
  historyData
}) => {
  const health = telemetry?.health_score;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-hero">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
            <span className="text-xs font-medium text-[#6b6b6b] uppercase tracking-[0.14em]">
              Command center · live telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1.5 tracking-tight">
            MLRIT Hyderabad Campus Command
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono mt-1">
            Dundigal · 10 facilities · 4.2 MWp rooftop solar · live twin telemetry
          </p>
        </div>

        <div className="flex items-center space-x-4 p-3 rounded-2xl bg-[#fafafa] border border-[var(--line)]">
          <div className="text-right">
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Health score</div>
            <div className="text-2xl font-semibold tracking-tight text-[#141414]">{health?.overall_score ?? 86}<span className="text-sm text-[var(--muted)]"> / 100</span></div>
            <div className="text-[10px] font-semibold text-[#15803d]">{health?.grade ?? 'A'} — {health?.status ?? 'OPTIMAL'}</div>
          </div>
          <div className="w-12 h-12 rounded-xl brand-mark flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Total Power */}
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>CAMPUS POWER DEMAND</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#141414]">
            {telemetry?.power?.total_consumption_kw ?? 3477} <span className="text-sm font-normal text-slate-400">kW</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[var(--line)]">
            <span>Grid: {telemetry?.power?.grid_draw_kw ?? 1637} kW</span>
            <span className="text-emerald-400 font-bold">Solar: {telemetry?.power?.solar_coverage_pct ?? 52}%</span>
          </div>
        </div>

        {/* Solar Generation */}
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>SOLAR GENERATION</span>
            <Sun className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {telemetry?.power?.solar_generation_kw ?? 1840} <span className="text-sm font-normal text-slate-400">kW</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[var(--line)]">
            <span>Cap: 4,200 kWp</span>
            <span className="text-emerald-400">CO2 Avoided: {telemetry?.environment?.co2_avoided_by_solar_kg_hr ?? 1306} kg/h</span>
          </div>
        </div>

        {/* Water Flow */}
        <div className="p-4 rounded-xl glass-panel border border-blue-500/20 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>WATER FLOW RATE</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">
            {telemetry?.water?.total_flow_lpm ?? 482} <span className="text-sm font-normal text-slate-400">LPM</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[var(--line)]">
            <span>Tank: {telemetry?.water?.overhead_tank_pct ?? 78}%</span>
            <span className="text-red-400 font-bold">1 Active Leak</span>
          </div>
        </div>

        {/* Occupancy */}
        <div className="p-4 rounded-xl glass-panel border border-violet-500/20 hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>CAMPUS OCCUPANCY</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-violet-300">
            {telemetry?.occupancy?.total_occupancy?.toLocaleString() ?? '4,820'} <span className="text-sm font-normal text-slate-400">heads</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[var(--line)]">
            <span>Cap: {telemetry?.occupancy?.total_capacity?.toLocaleString() ?? '7,200'}</span>
            <span className="text-cyan-400 font-bold">{telemetry?.occupancy?.utilization_pct ?? 67}%</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Live Power Demand Trend Chart & Health Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Telemetry Curve */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-[var(--line)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>24-Hour Diurnal Energy Demand vs Solar Profile</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Campus Grid Power vs Rooftop PV Generation</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /><span>Power</span></span>
              <span className="flex items-center space-x-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span>Solar</span></span>
            </div>
          </div>

          {/* Simple Canvas / SVG Bar Chart */}
          <div className="h-48 w-full flex items-end gap-1.5 pt-6 pb-2 border-b border-[var(--line)] font-mono text-[9px]">
            {(historyData.length ? historyData : Array.from({ length: 24 }, (_, i) => ({
              hour: i, time_label: `${i}:00`,
              power_kw: 1200 + Math.sin(i * 0.26) * 800,
              solar_gen_kw: Math.max(0, Math.sin((i - 6) * 0.26) * 1420),
            }))).map((pt, idx) => {
              const maxPower = 4000;
              const pkw = pt.power_kw ?? pt.power?.total_consumption_kw ?? 0;
              const skw = pt.solar_gen_kw ?? pt.solar?.generation_kw ?? 0;
              const powerH = Math.min(100, (pkw / maxPower) * 100);
              const solarH = Math.min(100, (skw / maxPower) * 100);
              const isCurrent = idx === Math.floor(telemetry?.simulated_hour ?? 14);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 hidden group-hover:flex flex-col bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] z-20 whitespace-nowrap">
                    <span className="text-slate-300">{pt.time_label ?? `${pt.hour ?? idx}:00`}</span>
                    <span className="text-cyan-400">Power: {Math.round(pkw)} kW</span>
                    <span className="text-emerald-400">Solar: {Math.round(skw)} kW</span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    <div
                      style={{ height: `${powerH}%` }}
                      className={`w-full rounded-t ${isCurrent ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50' : 'bg-cyan-500/60 group-hover:bg-cyan-400'}`}
                    />
                    <div
                      style={{ height: `${solarH}%` }}
                      className="w-full rounded-t bg-emerald-500/60 group-hover:bg-emerald-400"
                    />
                  </div>
                  {idx % 4 === 0 && <span className="text-slate-500 mt-1">{pt.hour ?? idx}:00</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Score Sub-Categories */}
        <div className="p-5 rounded-2xl glass-panel border border-[var(--line)] space-y-3 font-mono text-xs">
          <h3 className="font-bold text-slate-200 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Health & Sustainability Pillars</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { label: 'Energy Efficiency', val: health?.energy_efficiency ?? 82, color: 'bg-cyan-400' },
              { label: 'Water Efficiency', val: health?.water_efficiency ?? 78, color: 'bg-blue-400' },
              { label: 'Infrastructure Health', val: health?.infrastructure_health ?? 72, color: 'bg-amber-400' },
              { label: 'Occupancy Efficiency', val: health?.occupancy_efficiency ?? 88, color: 'bg-violet-400' },
              { label: 'Environmental Quality', val: health?.environmental_quality ?? 92, color: 'bg-emerald-400' },
              { label: 'Safety & Security', val: health?.safety ?? 94, color: 'bg-rose-400' },
            ].map(pillar => (
              <div key={pillar.label}>
                <div className="flex justify-between text-[11px] mb-1 text-slate-300">
                  <span>{pillar.label}</span>
                  <span className="font-bold">{pillar.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${pillar.val}%` }} className={`h-full ${pillar.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-[var(--line)]/80">
            Overall Health is graded <span className="text-emerald-400 font-bold">{health?.grade ?? 'A'}</span>. Primary friction stems from active water leakage in Hostel Alpha and thermal load warnings on Transformer T2.
          </div>
        </div>
      </div>

      {/* Buildings Quick Matrix */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#141414] tracking-tight">
            Campus facilities ({buildings.length} blocks)
          </h3>
          <span className="text-xs text-slate-400">Click a building to fly the 3D camera</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {buildings.map(b => (
            <div
              key={b.id}
              onClick={() => onSelectBuilding(b)}
              className="p-3.5 rounded-2xl bg-[#fafafa] border border-[var(--line)] hover:bg-white hover:shadow-[0_12px_32px_rgba(20,20,20,0.08)] cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[var(--line)] text-[#6b6b6b]">
                      {b.code}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                      b.maintenance_status === 'CRITICAL' ? 'bg-red-50 text-red-700' : (
                        b.maintenance_status === 'ATTENTION' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'
                      )
                    }`}>
                      {b.maintenance_status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#141414] mt-1.5">
                    {b.name}
                  </h4>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#141414] transition-colors" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[var(--line)] text-[10px] text-[#3f3f3f]">
                <div>
                  <div className="text-slate-500">Power</div>
                  <div className="font-semibold text-[#141414]">{b.energy_consumption_kw} kW</div>
                </div>
                <div>
                  <div className="text-slate-500">Solar</div>
                  <div className="font-semibold text-[#15803d]">{b.current_solar_gen_kw} kW</div>
                </div>
                <div>
                  <div className="text-slate-500">People</div>
                  <div className="font-semibold text-[#141414]">{b.current_occupancy}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
