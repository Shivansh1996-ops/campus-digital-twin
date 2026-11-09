import React, { useState } from 'react';
import {
  Sun, Moon, Play, Pause, FastForward, Search, ShieldCheck,
  AlertTriangle, Droplets, Zap, Users, Thermometer, Wind,
  Compass, Radio, Sparkles, Navigation
} from 'lucide-react';
import { LiveTelemetry, Building, Asset } from '../../types/campus';

interface TopNavbarProps {
  telemetry: LiveTelemetry | null;
  buildings: Building[];
  assets: Asset[];
  onSelectBuilding: (b: Building) => void;
  onSetSimulationTime: (hour: number) => void;
  onSetMultiplier: (m: number) => void;
  onTogglePause: () => void;
  isPaused: boolean;
  timeMultiplier: number;
  onGoHome?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  telemetry,
  buildings,
  assets,
  onSelectBuilding,
  onSetSimulationTime,
  onSetMultiplier,
  onTogglePause,
  isPaused,
  timeMultiplier,
  onGoHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredBuildings = searchQuery.trim()
    ? buildings.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredAssets = searchQuery.trim()
    ? assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const healthScore = telemetry?.health_score?.overall_score ?? 86;
  const grade = telemetry?.health_score?.grade ?? 'A';

  return (
    <header className="h-14 w-full bg-white border-b border-[var(--line)] px-4 flex items-center justify-between z-30 select-none relative">
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={onGoHome}
              title="Back to MLRIT campus site"
              className="w-10 h-10 rounded-xl brand-mark flex items-center justify-center hover:brightness-110"
            >
              <span className="font-extrabold text-sm text-white tracking-tight">MLR</span>
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-breathe" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-[15px] grad-text truncate">
                MLRIT Digital Twin
              </span>
              <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-[#f6f6f6] border border-[var(--line)] text-[#6b6b6b] tracking-wider font-semibold">
                HYDERABAD
              </span>
            </div>
            <p className="text-[10px] text-[var(--muted)] tracking-[0.14em] font-mono uppercase truncate">
              Campus intelligence · Dundigal
            </p>
          </div>
        </div>

        <div className="hidden 2xl:flex items-center space-x-2 pl-4 border-l border-[var(--line)]">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800">
            <Radio className="w-3 h-3 text-emerald-600 animate-breathe" />
            <span>TSSPDCL 33kV live</span>
          </div>
        </div>
      </div>

      {/* Global Search Bar with Autocomplete Dropdown */}
      <div className="relative w-64 md:w-80 lg:w-96">
        <div className="flex items-center bg-[#f6f6f6] border border-[var(--line)] hover:border-[var(--line-bright)] rounded-full px-3 py-1.5 focus-within:border-[#141414] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search buildings, labs, assets…"
            className="w-full bg-transparent text-xs text-[#141414] placeholder-slate-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
        </div>

        {/* Autocomplete Dropdown Modal */}
        {isSearchOpen && (filteredBuildings.length > 0 || filteredAssets.length > 0) && (
          <div className="absolute top-12 left-0 w-full glass-panel-glow rounded-xl p-2.5 max-h-80 overflow-y-auto shadow-2xl z-50 border border-cyan-500/40">
            {filteredBuildings.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 px-2 font-bold">
                  Campus Facilities ({filteredBuildings.length})
                </span>
                {filteredBuildings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBuilding(b);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-cyan-500/15 rounded-lg cursor-pointer flex items-center justify-between transition-colors mt-1"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{b.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.code} • {b.type} • {b.floors_count} Floors</p>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{b.energy_consumption_kw} kW</span>
                  </div>
                ))}
              </div>
            )}

            {filteredAssets.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 px-2 font-bold">
                  Infrastructure & Labs
                </span>
                {filteredAssets.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      const b = buildings.find(bld => bld.id === a.building_id);
                      if (b) onSelectBuilding(b);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-amber-500/15 rounded-lg cursor-pointer flex items-center justify-between transition-colors mt-1"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{a.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{a.type} • Health {a.health_score}%</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      a.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
        {[
          { icon: Zap, label: 'PWR', value: `${telemetry?.power?.total_consumption_kw ?? 2450} kW`, tone: 'text-[#141414]' },
          { icon: Sun, label: 'SOL', value: `${telemetry?.power?.solar_generation_kw ?? 1420} kW`, tone: 'text-[#141414]' },
          { icon: Droplets, label: 'H2O', value: `${telemetry?.water?.total_flow_lpm ?? 482} LPM`, tone: 'text-[#141414]' },
          { icon: Users, label: 'OCC', value: `${telemetry?.occupancy?.total_occupancy ?? 4820}`, tone: 'text-[#141414]' },
        ].map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-[var(--line)]">
            <Icon className={`w-3.5 h-3.5 ${tone}`} />
            <span className="text-[var(--muted)] text-[10px]">{label}</span>
            <span className={`font-bold ${tone}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#3f3f3f] bg-white px-2.5 py-1.5 rounded-full border border-[var(--line)]">
          <Thermometer className="w-3.5 h-3.5 text-[var(--amber)]" />
          <span>{telemetry?.weather?.temperature_c ?? 31.5}°C</span>
          <span className="text-[#d4d4d4]">|</span>
          <Wind className="w-3.5 h-3.5 text-[#141414]" />
          <span>AQI {telemetry?.weather?.air_quality_aqi ?? 42}</span>
        </div>

        <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-full border border-[var(--line)]">
          {telemetry?.is_daylight ? (
            <Sun className="w-4 h-4 text-[var(--amber)] animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-[#9db8d4]" />
          )}

          <span className="text-xs font-semibold text-[#141414] w-12 text-center">
            {telemetry?.simulated_time ?? '14:30'}
          </span>

          <input
            type="range"
            min="0"
            max="23.5"
            step="0.5"
            value={telemetry?.simulated_hour ?? 14.5}
            onChange={(e) => onSetSimulationTime(parseFloat(e.target.value))}
            className="w-14 lg:w-20 accent-[#141414] cursor-pointer h-1.5 bg-[#ececec] rounded-lg"
            title="Simulate time of day"
          />

          <button
            onClick={onTogglePause}
            className="p-1 hover:bg-[#f6f6f6] rounded-lg text-[#141414] transition-colors"
            title={isPaused ? 'Play simulation' : 'Pause simulation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-[var(--amber)]" />}
          </button>

          <button
            onClick={() => onSetMultiplier(timeMultiplier === 1 ? 5 : (timeMultiplier === 5 ? 60 : 1))}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#f6f6f6] hover:bg-[#ececec] text-[10px] text-[#141414] font-bold"
            title="Simulation speed"
          >
            <FastForward className="w-3 h-3" />
            <span>{timeMultiplier}x</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] text-white">
          <ShieldCheck className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/70">HEALTH</span>
            <span className="text-xs font-bold">{healthScore}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/15 font-bold">
              {grade}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
