import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, TrendingDown, DollarSign, Leaf, Droplets, RotateCcw } from 'lucide-react';
import { WhatIfRequest, WhatIfResponse } from '../../types/campus';
import { simulateWhatIf } from '../../services/api';

export const WhatIfStudio: React.FC = () => {
  const [params, setParams] = useState<WhatIfRequest>({
    lighting_led_upgrade_pct: 0,
    hvac_setpoint_adjustment_c: 0,
    hvac_runtime_reduction_pct: 0,
    solar_capacity_increase_kw: 0,
    operating_hours_limit: undefined,
    occupancy_shift_pct: 0,
    rainwater_harvesting_expansion_pct: 0,
    replace_inefficient_equipment: false
  });

  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-recalculate on change
  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await simulateWhatIf(params);
        if (active) setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [params]);

  // Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'LED_UPGRADE') {
      setParams({
        lighting_led_upgrade_pct: 100,
        hvac_setpoint_adjustment_c: 0,
        hvac_runtime_reduction_pct: 0,
        solar_capacity_increase_kw: 0,
        occupancy_shift_pct: 0,
        rainwater_harvesting_expansion_pct: 0,
        replace_inefficient_equipment: false
      });
    } else if (presetName === 'SOLAR_EXPANSION') {
      setParams({
        lighting_led_upgrade_pct: 0,
        hvac_setpoint_adjustment_c: 0,
        hvac_runtime_reduction_pct: 0,
        solar_capacity_increase_kw: 1000,
        occupancy_shift_pct: 0,
        rainwater_harvesting_expansion_pct: 0,
        replace_inefficient_equipment: false
      });
    } else if (presetName === 'NET_ZERO_BLUEPRINT') {
      setParams({
        lighting_led_upgrade_pct: 100,
        hvac_setpoint_adjustment_c: 2.0,
        hvac_runtime_reduction_pct: 15,
        solar_capacity_increase_kw: 1500,
        occupancy_shift_pct: 0,
        rainwater_harvesting_expansion_pct: 80,
        replace_inefficient_equipment: true
      });
    } else {
      // Reset
      setParams({
        lighting_led_upgrade_pct: 0,
        hvac_setpoint_adjustment_c: 0,
        hvac_runtime_reduction_pct: 0,
        solar_capacity_increase_kw: 0,
        occupancy_shift_pct: 0,
        rainwater_harvesting_expansion_pct: 0,
        replace_inefficient_equipment: false
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel-glow border border-violet-500/25">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
              MLRIT HYDERABAD // WHAT-IF SIMULATION & ROI STUDIO
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">
            Campus Decarbonization & Operational Scenario Sandbox
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simulate Capital Retrofits, Setback Algorithms, Solar Additions & Calculate Real Financial ROI
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => applyPreset('LED_UPGRADE')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-colors"
          >
            100% LED Retrofit
          </button>
          <button
            onClick={() => applyPreset('SOLAR_EXPANSION')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 transition-colors"
          >
            Solar +1,000 kWp
          </button>
          <button
            onClick={() => applyPreset('NET_ZERO_BLUEPRINT')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-950 font-bold transition-all shadow-lg shadow-violet-500/20"
          >
            ★ Net-Zero 2028 Plan
          </button>
          <button
            onClick={() => applyPreset('RESET')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Reset parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4 p-5 rounded-2xl glass-panel border border-slate-800 font-mono">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4" />
            <span>Interactive Operational Levers</span>
          </h3>

          {/* Slider 1: LED Replacement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-200">
              <span>Lighting LED Retrofit:</span>
              <span className="font-bold text-cyan-400">{params.lighting_led_upgrade_pct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.lighting_led_upgrade_pct}
              onChange={(e) => setParams({ ...params, lighting_led_upgrade_pct: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="text-[10px] text-slate-500">Replaces fluorescent & metal halide fixtures with 55% efficient smart LEDs</div>
          </div>

          {/* Slider 2: HVAC Setpoint Adjustment */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-200">
              <span>HVAC Temperature Setpoint Drift:</span>
              <span className="font-bold text-cyan-400">+{params.hvac_setpoint_adjustment_c}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={params.hvac_setpoint_adjustment_c}
              onChange={(e) => setParams({ ...params, hvac_setpoint_adjustment_c: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="text-[10px] text-slate-500">Adjusts classroom cooling from 21.5°C up to 24.5°C (~6.5% power saved per °C)</div>
          </div>

          {/* Slider 3: HVAC Runtime Setback */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-200">
              <span>HVAC Automated Low-Occupancy Setback:</span>
              <span className="font-bold text-cyan-400">{params.hvac_runtime_reduction_pct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={params.hvac_runtime_reduction_pct}
              onChange={(e) => setParams({ ...params, hvac_runtime_reduction_pct: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="text-[10px] text-slate-500">Cycles fans and throttles compressor during class changes and lunch breaks</div>
          </div>

          {/* Slider 4: Rooftop Solar Addition */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-200">
              <span>Additional Solar PV Capacity:</span>
              <span className="font-bold text-emerald-400">+{params.solar_capacity_increase_kw} kWp</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="100"
              value={params.solar_capacity_increase_kw}
              onChange={(e) => setParams({ ...params, solar_capacity_increase_kw: parseFloat(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="text-[10px] text-slate-500">Utilizes remaining shadow-free roof slab on Sports Complex & Aeronautical Block</div>
          </div>

          {/* Slider 5: Rainwater Harvesting */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-200">
              <span>Rainwater Harvesting & Ground Recharge:</span>
              <span className="font-bold text-blue-400">{params.rainwater_harvesting_expansion_pct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={params.rainwater_harvesting_expansion_pct}
              onChange={(e) => setParams({ ...params, rainwater_harvesting_expansion_pct: parseFloat(e.target.value) })}
              className="w-full accent-blue-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="text-[10px] text-slate-500">Constructs percolation shafts along MLRIT cricket ground perimeter</div>
          </div>

          {/* Toggle: Chiller VFD Retrofit */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <div className="text-xs text-slate-200 font-bold">Chiller VFD & IE4 Motor Retrofit</div>
              <div className="text-[10px] text-slate-500">Upgrade central centrifugal chillers with variable speed drives</div>
            </div>
            <input
              type="checkbox"
              checked={params.replace_inefficient_equipment}
              onChange={(e) => setParams({ ...params, replace_inefficient_equipment: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
            />
          </div>
        </div>

        {/* Right Column: Dynamic Financial & Environmental Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Summary Box */}
          <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/30 font-mono space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                ESTIMATED IMPACT CALCULATOR
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                PREDICTED MODEL
              </span>
            </div>

            {/* Annual Financial Savings */}
            <div>
              <div className="text-xs text-slate-400">ANNUAL FINANCIAL SAVINGS</div>
              <div className="text-3xl font-bold text-emerald-300 mt-1">
                ₹{(result?.financial_savings_inr_yr ?? 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ year</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">ENERGY SAVINGS</div>
                <div className="text-lg font-bold text-cyan-300">{result?.energy_savings_mwh_yr ?? 0} MWh</div>
                <div className="text-[10px] text-emerald-400 font-bold">-{result?.energy_savings_pct ?? 0}% Reduction</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">CO2 EMISSIONS AVOIDED</div>
                <div className="text-lg font-bold text-emerald-300">{result?.co2_reduction_tons_yr ?? 0} Tons</div>
                <div className="text-[10px] text-slate-500">Per annum</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">ESTIMATED CAPEX</div>
                <div className="text-base font-bold text-amber-300">
                  ₹{(result?.estimated_capex_inr ?? 0).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">PAYBACK PERIOD</div>
                <div className="text-base font-bold text-violet-300">
                  {result?.payback_period_years ?? 0} <span className="text-xs font-normal">Years</span>
                </div>
              </div>
            </div>

            {/* Grid Dependency Reduction */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">TSSPDCL Grid Dependency Reduction:</span>
                <span className="text-emerald-400 font-bold">-{result?.grid_dependency_reduction_pct ?? 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, result?.grid_dependency_reduction_pct ?? 0)}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
