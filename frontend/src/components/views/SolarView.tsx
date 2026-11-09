import React from 'react';
import { Sun, Zap, ShieldCheck, Thermometer, ArrowUpRight, BatteryCharging } from 'lucide-react';
import { LiveTelemetry, Building } from '../../types/campus';

interface SolarViewProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  onSelectBuilding: (b: Building) => void;
}

export const SolarView: React.FC<SolarViewProps> = ({ telemetry, buildings, onSelectBuilding }) => {
  const totalCapacity = 2470; // kWp
  const currentGen = telemetry?.power?.solar_generation_kw ?? 1420;
  const coveragePct = telemetry?.power?.solar_coverage_pct ?? 58;
  const co2Avoided = telemetry?.environment?.co2_avoided_by_solar_kg_hr ?? 1008;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-emerald-500/25">
        <div className="flex items-center space-x-2">
          <Sun className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            MLRIT HYDERABAD // SOLAR & RENEWABLES INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Campus Clean Energy Generation & Microgrid PV Arrays
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          2,470 kWp Rooftop Bifacial TOPCon Solar • Solar Irradiance Telemetry • Carbon Avoidance Audit
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="text-xs text-slate-400">INSTANT GENERATION</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{currentGen} kW</div>
          <div className="text-[10px] text-emerald-400 mt-2">Coverage: {coveragePct}% of daytime load</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20">
          <div className="text-xs text-slate-400">TOTAL SOLAR CAPACITY</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{totalCapacity} kWp</div>
          <div className="text-[10px] text-slate-500 mt-2">8,500 m² Active PV Surface</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/20">
          <div className="text-xs text-slate-400">SOLAR IRRADIANCE</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {telemetry?.weather?.solar_irradiance_wm2 ?? 840} <span className="text-xs">W/m²</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-2">Sunny / Dundigal Sky</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="text-xs text-slate-400">CARBON AVOIDED TODAY</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            {(co2Avoided * 8 / 1000).toFixed(1)} <span className="text-xs">Tons</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2">Rate: {co2Avoided} kg CO2/hr</div>
        </div>
      </div>

      {/* Rooftop Array Breakdown Matrix */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 font-mono">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Facility Rooftop Solar Installations ({buildings.filter(b => b.solar_capacity_kw > 0).length} Systems)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.filter(b => b.solar_capacity_kw > 0).map(b => (
            <div
              key={b.id}
              onClick={() => onSelectBuilding(b)}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:bg-slate-800/40 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    {b.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 group-hover:text-emerald-300 transition-colors">
                    {b.name}
                  </h4>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800 text-[10px]">
                <div>
                  <div className="text-slate-500">CAPACITY</div>
                  <div className="font-bold text-slate-200">{b.solar_capacity_kw} kWp</div>
                </div>
                <div>
                  <div className="text-slate-500">NOW GENERATING</div>
                  <div className="font-bold text-emerald-300">{b.current_solar_gen_kw} kW</div>
                </div>
                <div>
                  <div className="text-slate-500">ROOF AREA</div>
                  <div className="text-slate-300">{b.solar_area_sqm} m²</div>
                </div>
                <div>
                  <div className="text-slate-500">STATUS</div>
                  <div className="text-emerald-400 font-bold">100% ONLINE</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
