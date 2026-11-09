import React, { useState } from 'react';
import { Zap, Activity, Cpu, ArrowDownRight, Layers, Sliders } from 'lucide-react';
import { LiveTelemetry, Building, EnergyFlowData } from '../../types/campus';

interface EnergyViewProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  energyFlow: EnergyFlowData | null;
  historyData: any[];
}

export const EnergyView: React.FC<EnergyViewProps> = ({
  telemetry,
  buildings,
  energyFlow,
  historyData
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HVAC' | 'LIGHTING' | 'EQUIP'>('ALL');

  const totalPower = telemetry?.power?.total_consumption_kw ?? 2450;
  const solarGen = telemetry?.power?.solar_generation_kw ?? 1420;
  const gridDraw = telemetry?.power?.grid_draw_kw ?? 1030;
  const powerFactor = telemetry?.power?.power_factor ?? 0.97;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              MLRIT HYDERABAD // ENERGY INTELLIGENCE MODULE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">
            Campus Power Distribution & Energy Topology
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            TSSPDCL 33kV Feeder Grid • Dundigal Substation • 2.4 MWp Rooftop Solar Arrays • Microgrid BESS
          </p>
        </div>

        {/* Real-time Grid Electrical Parameters */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">VOLTAGE</div>
            <div className="text-sm font-bold text-cyan-300">{telemetry?.power?.grid_voltage_kv ?? 33.1} kV</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">FREQUENCY</div>
            <div className="text-sm font-bold text-emerald-300">{telemetry?.power?.grid_frequency_hz ?? 50.02} Hz</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">POWER FACTOR</div>
            <div className="text-sm font-bold text-amber-300">{powerFactor}</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20">
          <div className="text-xs text-slate-400">TOTAL CAMPUS DEMAND</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{totalPower} kW</div>
          <div className="text-[10px] text-slate-500 mt-2">Peak Demand: {telemetry?.power?.peak_demand_kw ?? 2840} kW</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="text-xs text-slate-400">SOLAR GENERATION</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{solarGen} kW</div>
          <div className="text-[10px] text-emerald-400 mt-2">Offsetting {telemetry?.power?.solar_coverage_pct ?? 58}% of load</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/20">
          <div className="text-xs text-slate-400">TSSPDCL GRID DRAW</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{gridDraw} kW</div>
          <div className="text-[10px] text-slate-500 mt-2">Commercial HT Tariff: ₹9.0 / kWh</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-violet-500/20">
          <div className="text-xs text-slate-400">BESS BATTERY STORAGE</div>
          <div className="text-2xl font-bold text-violet-300 mt-1">{telemetry?.power?.battery_storage_kw ?? -240} kW</div>
          <div className="text-[10px] text-violet-400 mt-2">SoC: {telemetry?.power?.battery_soc_pct ?? 76.5}% (Charging)</div>
        </div>
      </div>

      {/* Energy Flow Topology (Visual Node-Link Sankey Pipeline) */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Campus Energy Flow Hierarchy (Sankey Flow Model)</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Source Generation → Dundigal Substation Step-Down → Facility Distribution → End Loads
            </p>
          </div>
        </div>

        {/* 4 Stage Interactive Energy Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Stage 1: Energy Sources */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
              1. ENERGY INFEED
            </span>

            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
              <div className="flex justify-between text-amber-300 font-bold">
                <span>TSSPDCL Grid 33kV</span>
                <span>{gridDraw} kW</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Dundigal Substation Line</div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex justify-between text-emerald-300 font-bold">
                <span>Rooftop Solar PV</span>
                <span>{solarGen} kW</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">2,470 kWp Total Installed</div>
            </div>
          </div>

          {/* Stage 2: Substation */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
              2. SUBSTATION 11kV
            </span>

            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
              <div className="flex justify-between text-cyan-300 font-bold">
                <span>Transformer TR-01</span>
                <span>{Math.round(totalPower * 0.48)} kW</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Serving Aero & Admin</div>
            </div>

            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40">
              <div className="flex justify-between text-red-300 font-bold">
                <span>Transformer TR-02</span>
                <span>{Math.round(totalPower * 0.52)} kW</span>
              </div>
              <div className="text-[10px] text-red-400 mt-1">Warning: Thermal Load 79%</div>
            </div>
          </div>

          {/* Stage 3: Top Facilities */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 max-h-80 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
              3. FACILITY LOADS
            </span>

            {buildings.slice(0, 5).map(b => (
              <div key={b.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-300 truncate max-w-[120px]">{b.name}</span>
                <span className="text-cyan-300 font-bold">{b.energy_consumption_kw} kW</span>
              </div>
            ))}
          </div>

          {/* Stage 4: End-Use Equipment */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
              4. END-USE APPORTIONMENT
            </span>

            <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
              <div className="flex justify-between text-cyan-300">
                <span>HVAC & Cooling</span>
                <span className="font-bold">50% (~{Math.round(totalPower * 0.50)} kW)</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
              <div className="flex justify-between text-amber-300">
                <span>Lighting & Lumens</span>
                <span className="font-bold">28% (~{Math.round(totalPower * 0.28)} kW)</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-violet-950/30 border border-violet-500/20">
              <div className="flex justify-between text-violet-300">
                <span>Computing & Wind Tunnel</span>
                <span className="font-bold">22% (~{Math.round(totalPower * 0.22)} kW)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building-wise Power Consumption Chart */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 font-mono">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Facility-Wise Power Draw (kW) & Solar Offset
        </h3>

        <div className="space-y-3">
          {buildings.map(b => {
            const maxVal = 700;
            const powerPct = Math.min(100, (b.energy_consumption_kw / maxVal) * 100);
            const solarPct = Math.min(100, (b.current_solar_gen_kw / maxVal) * 100);

            return (
              <div key={b.id} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-medium">{b.name} ({b.code})</span>
                  <div className="space-x-3 text-[11px]">
                    <span className="text-cyan-400">{b.energy_consumption_kw} kW</span>
                    <span className="text-emerald-400">Solar: {b.current_solar_gen_kw} kW</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${powerPct}%` }} className="h-full bg-cyan-500 rounded-l-full" />
                  <div style={{ width: `${solarPct}%` }} className="h-full bg-emerald-500 rounded-r-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
