import React from 'react';
import { Users, AlertTriangle, ArrowUpRight, BarChart2, ShieldCheck } from 'lucide-react';
import { LiveTelemetry, Building } from '../../types/campus';

interface OccupancyViewProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  onSelectBuilding: (b: Building) => void;
}

export const OccupancyView: React.FC<OccupancyViewProps> = ({ telemetry, buildings, onSelectBuilding }) => {
  const occ = telemetry?.occupancy;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-violet-500/25">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
            MLRIT HYDERABAD // OCCUPANCY & SPACE UTILIZATION INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Real-time Footfall, Density & Classroom Utilization
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Optical & PIR Motion Sensor Aggregation • Class Scheduling Analytics • Overcrowded vs Underutilized Detection
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-violet-500/20">
          <div className="text-xs text-slate-400">TOTAL CAMPUS HEADCOUNT</div>
          <div className="text-2xl font-bold text-violet-300 mt-1">
            {occ?.total_occupancy?.toLocaleString() ?? 4820} <span className="text-xs">Students & Staff</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Design Capacity: {occ?.total_capacity?.toLocaleString() ?? 7200}</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20">
          <div className="text-xs text-slate-400">AVERAGE UTILIZATION</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{occ?.utilization_pct ?? 67}%</div>
          <div className="text-[10px] text-emerald-400 mt-2">Optimal Academic Quad Range (60-80%)</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="text-xs text-slate-400">ACTIVE BUILDINGS</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{occ?.active_buildings_count ?? 10} / 10</div>
          <div className="text-[10px] text-slate-500 mt-2">All facilities operational</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/20">
          <div className="text-xs text-slate-400">UNDERUTILIZED SPACE</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">1 Block</div>
          <div className="text-[10px] text-amber-400 mt-2">Auditorium off-peak hours</div>
        </div>
      </div>

      {/* Facility Utilization Matrix */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 font-mono">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Facility Utilization & Capacity Distribution
        </h3>

        <div className="space-y-3">
          {buildings.map(b => {
            const pct = b.occupancy_rate_pct;
            const barColor = pct > 80 ? 'bg-rose-500' : (pct > 50 ? 'bg-cyan-500' : 'bg-slate-500');

            return (
              <div
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{b.name}</span>
                    <span className="text-slate-400 text-[10px] ml-2 font-mono">({b.code})</span>
                  </div>
                  <div className="space-x-3 text-[11px] font-mono">
                    <span className="text-slate-400">{b.current_occupancy} / {b.max_capacity} Heads</span>
                    <span className="font-bold text-cyan-300">{pct}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div style={{ width: `${pct}%` }} className={`h-full ${barColor} rounded-full`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
