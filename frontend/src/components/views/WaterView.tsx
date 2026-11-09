import React from 'react';
import { Droplets, AlertTriangle, ShieldCheck, Gauge, ArrowDown, Activity } from 'lucide-react';
import { LiveTelemetry, Building, Alert } from '../../types/campus';

interface WaterViewProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  alerts: Alert[];
}

export const WaterView: React.FC<WaterViewProps> = ({ telemetry, buildings, alerts }) => {
  const water = telemetry?.water;
  const leakAlert = alerts.find(a => a.metric_type === 'water_flow' && a.status === 'ACTIVE');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-blue-500/25">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
            MLRIT HYDERABAD // WATER INTELLIGENCE & LEAK ANOMALY DETECTION
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Campus Hydro-Infrastructure & Consumption Telemetry
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Borewell Extraction • Overhead Break Tanks • Marri Nilayam Boys Hostel Monitoring • Rainwater Harvesting
        </p>
      </div>

      {/* Critical Leak Detection Banner if active */}
      {leakAlert && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-red-300 uppercase">{leakAlert.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-200">CRITICAL</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{leakAlert.message}</p>
              <p className="text-[11px] text-amber-300 mt-0.5">{leakAlert.estimated_impact}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-red-300">138 LPM Leak Rate</div>
            <div className="text-[10px] text-slate-400 mt-1">Action: {leakAlert.recommended_action}</div>
          </div>
        </div>
      )}

      {/* Tank Level Gauges & Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        {/* Overhead Tank Level */}
        <div className="p-4 rounded-xl glass-panel border border-blue-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>OVERHEAD TANK LEVEL</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{water?.overhead_tank_pct ?? 78}%</div>
          <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${water?.overhead_tank_pct ?? 78}%` }} className="h-full bg-blue-500 rounded-full" />
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Capacity: 150,000 Liters</div>
        </div>

        {/* Underground Sump */}
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>UNDERGROUND SUMP</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">{water?.underground_sump_pct ?? 91}%</div>
          <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${water?.underground_sump_pct ?? 91}%` }} className="h-full bg-cyan-500 rounded-full" />
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Capacity: 300,000 Liters</div>
        </div>

        {/* Total Flow Rate */}
        <div className="p-4 rounded-xl glass-panel border border-blue-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>TOTAL WATER FLOW</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{water?.total_flow_lpm ?? 482} LPM</div>
          <div className="text-[10px] text-slate-400 mt-2">
            Rate: {water?.total_flow_m3_hr ?? 28.9} m³/hr
          </div>
        </div>

        {/* Rainwater Harvested */}
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>RAINWATER HARVESTED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{water?.rainwater_harvested_kl ?? 240} kL</div>
          <div className="text-[10px] text-emerald-400 mt-2">Sports Ground Catchment</div>
        </div>
      </div>

      {/* Building-wise Water Consumption */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 font-mono">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Facility-Wise Water Draw (LPM)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map(b => (
            <div key={b.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-200">{b.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.code} • {b.type}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${b.water_consumption_lpm > 100 ? 'text-red-400' : 'text-blue-300'}`}>
                  {b.water_consumption_lpm} LPM
                </div>
                <div className="text-[10px] text-slate-500">{(b.daily_water_liters / 1000).toFixed(1)} kL/day</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
