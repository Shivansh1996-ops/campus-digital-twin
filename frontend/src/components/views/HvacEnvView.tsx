import React from 'react';
import { Wind, Thermometer, Droplets, Sun, AlertTriangle, ShieldCheck, Gauge } from 'lucide-react';
import { LiveTelemetry, Building } from '../../types/campus';

interface HvacEnvViewProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
}

export const HvacEnvView: React.FC<HvacEnvViewProps> = ({ telemetry, buildings }) => {
  const env = telemetry?.environment;
  const weather = telemetry?.weather;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MLRIT HYDERABAD // HVAC & CAMPUS ENVIRONMENTAL QUALITY INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Thermal Comfort, Chiller Plants & Microclimate Air Quality
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Dundigal Atmospheric AQI • Air Handling Units • Subsonic Aero Flow • CO2 PPM Spatial Distribution
        </p>
      </div>

      {/* Environmental Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-amber-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>OUTDOOR AMBIENT TEMP</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{weather?.temperature_c ?? 31.5}°C</div>
          <div className="text-[10px] text-slate-400 mt-2">Dundigal High Temp Peak</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-emerald-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>AIR QUALITY INDEX (AQI)</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {weather?.air_quality_aqi ?? 42} <span className="text-xs">AQI</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2">Clean Green Campus Zone</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>INDOOR CO2 CONCENTRATION</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">{env?.avg_campus_co2_ppm ?? 448} PPM</div>
          <div className="text-[10px] text-slate-400 mt-2">ASHRAE Standard: &lt; 800 PPM</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-blue-500/20">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>CAMPUS ACOUSTIC NOISE</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{env?.noise_avg_db ?? 46.2} dB</div>
          <div className="text-[10px] text-blue-400 mt-2">Optimal Quiet Study Zone</div>
        </div>
      </div>

      {/* Building-wise HVAC Load & Thermal Setpoint Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 font-mono">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Facility Thermal & HVAC Operations Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map(b => (
            <div key={b.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-xs">{b.name}</span>
                <span className="text-cyan-400 font-bold text-xs">{b.hvac_load_kw} kW</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <div>
                  <span>Target Temp:</span>
                  <div className="text-slate-200 font-bold">23.5°C</div>
                </div>
                <div>
                  <span>Share of Load:</span>
                  <div className="text-cyan-300 font-bold">
                    {Math.round((b.hvac_load_kw / (b.energy_consumption_kw || 1)) * 100)}%
                  </div>
                </div>
                <div>
                  <span>Status:</span>
                  <div className="text-emerald-400 font-bold">Eco-Mode</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
