import React from 'react';
import {
  X, Layers, Zap, Droplets, Sun, Users, Thermometer,
  AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Building, Floor, Room, Alert, WastageItem } from '../../types/campus';

interface InspectorDrawerProps {
  building: Building | null;
  onClose: () => void;
  isEntered: boolean;
  onToggleEnter: () => void;
  selectedFloor: number | null;
  onSelectFloor: (floorNum: number | null) => void;
  alerts: Alert[];
  wastageItems: WastageItem[];
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  building,
  onClose,
  isEntered,
  onToggleEnter,
  selectedFloor,
  onSelectFloor,
  alerts,
  wastageItems
}) => {
  if (!building) return null;

  const buildingAlerts = alerts.filter(a => a.building_id === building.id && a.status === 'ACTIVE');
  const buildingWastage = wastageItems.filter(w => w.building_id === building.id);
  const floors = building.floors?.length ? building.floors : [];
  const activeFloor = floors.find(f => f.floor_number === (selectedFloor ?? 0)) || floors[0];

  return (
    <aside className="fixed top-16 right-0 w-[22rem] h-[calc(100vh-4rem)] glass-panel-glow border-l border-[var(--line)] flex flex-col z-30 overflow-y-auto select-none animate-fade-in-up">
      <div className="p-4 border-b border-white/8 flex items-start justify-between bg-black/20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#5eb8a8]/15 text-[#7dd3c0] border border-[#5eb8a8]/30">
              {building.code}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted)]">{building.type}</span>
          </div>
          <h2 className="text-base font-bold text-[var(--text)] mt-1.5 tracking-tight">{building.name}</h2>
          <p className="text-xs text-[var(--muted)] font-mono mt-0.5">
            {building.total_area_sqm.toLocaleString()} m² · {building.floors_count} floors · {building.construction_year}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 border-b border-white/8 bg-[#2a8f7f]/8">
        <button
          onClick={onToggleEnter}
          className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-mono font-bold tracking-wide transition-all ${
            isEntered
              ? 'bg-[var(--amber)] hover:brightness-110 text-[#1a1208]'
              : 'btn-primary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEntered ? 'Back to campus' : 'Enter building · explode floors'}</span>
        </button>
      </div>

      {/* Core Telemetry Cards */}
      <div className="p-4 space-y-4">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {/* Power */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20">
            <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] text-slate-400">POWER</span>
            </div>
            <div className="text-base font-bold text-cyan-300">{building.energy_consumption_kw} kW</div>
            <div className="text-[9px] text-slate-400 mt-1 space-y-0.5">
              <div>HVAC: {building.hvac_load_kw} kW</div>
              <div>Light: {building.lighting_load_kw} kW</div>
              <div>Equip: {building.equipment_load_kw} kW</div>
            </div>
          </div>

          {/* Solar */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20">
            <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[10px] text-slate-400">ROOFTOP SOLAR</span>
            </div>
            <div className="text-base font-bold text-emerald-300">{building.current_solar_gen_kw} kW</div>
            <div className="text-[9px] text-slate-400 mt-1">
              <div>Cap: {building.solar_capacity_kw} kWp</div>
              <div>Area: {building.solar_area_sqm} m²</div>
            </div>
          </div>

          {/* Water */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-blue-500/20">
            <div className="flex items-center space-x-1.5 text-blue-400 mb-1">
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-[10px] text-slate-400">WATER FLOW</span>
            </div>
            <div className="text-base font-bold text-blue-300">{building.water_consumption_lpm} LPM</div>
            <div className="text-[9px] text-slate-400 mt-1">
              <div>Daily: {(building.daily_water_liters / 1000).toFixed(1)} kL</div>
            </div>
          </div>

          {/* Occupancy */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-violet-500/20">
            <div className="flex items-center space-x-1.5 text-violet-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] text-slate-400">OCCUPANCY</span>
            </div>
            <div className="text-base font-bold text-violet-300">{building.current_occupancy}</div>
            <div className="text-[9px] text-slate-400 mt-1">
              <div>Rate: {building.occupancy_rate_pct}%</div>
              <div>Max: {building.max_capacity}</div>
            </div>
          </div>
        </div>

        {/* Efficiency & Carbon Badges */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400">EFFICIENCY SCORE</div>
              <div className="text-sm font-bold text-emerald-400">{building.energy_efficiency_score} / 100</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">CARBON FOOTPRINT</div>
            <div className="text-xs font-bold text-rose-400">{building.carbon_emissions_kg_hr} kg/hr</div>
          </div>
        </div>

        {/* Active Building Alerts */}
        {buildingAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>ACTIVE ANOMALIES ({buildingAlerts.length})</span>
            </span>

            {buildingAlerts.map(alt => (
              <div key={alt.id} className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs">
                <div className="flex items-center justify-between text-red-300 font-medium mb-1">
                  <span>{alt.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-200 uppercase font-mono">{alt.severity}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-2">{alt.message}</p>
                <div className="text-[10px] text-amber-300 bg-black/40 p-1.5 rounded font-mono">
                  Action: {alt.recommended_action}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wastage Detection in this building */}
        {buildingWastage.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              DETECTED WASTAGE
            </span>
            {buildingWastage.map(wst => (
              <div key={wst.id} className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs font-mono">
                <div className="flex justify-between text-amber-300 font-bold mb-1">
                  <span>{wst.category}</span>
                  <span>₹{wst.estimated_monthly_cost_inr.toLocaleString()}/mo</span>
                </div>
                <p className="text-[10px] text-slate-300 mb-1">{wst.description}</p>
                <div className="text-[9px] text-cyan-300">Fix: {wst.recommended_action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Floor Explorer Section (Shown when in exploded view) */}
        {isEntered && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                INSPECT FLOORS ({floors.length || building.floors_count})
              </span>
              <button
                onClick={() => onSelectFloor(null)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${selectedFloor === null ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All Floors
              </button>
            </div>

            {/* Floor Tab Selector */}
            <div className="flex flex-wrap gap-1">
              {floors.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => onSelectFloor(fl.floor_number)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedFloor === fl.floor_number
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {fl.name}
                </button>
              ))}
            </div>

            {/* Selected Floor Rooms */}
            {activeFloor && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-200">{activeFloor.name}</span>
                  <span className="text-cyan-400">{activeFloor.energy_kw} kW • {activeFloor.current_occupancy} occupants</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(activeFloor.rooms ?? []).map(room => (
                    <div
                      key={room.id}
                      className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-200 flex items-center space-x-1.5">
                          <span>{room.name}</span>
                          {room.current_occupancy === 0 && room.lighting_status === 'on' && (
                            <span className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0.2 rounded font-mono">WASTE</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Temp: {room.hvac_temp_c}°C • Light: {room.lighting_status.toUpperCase()} • Occ: {room.current_occupancy}
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px] text-cyan-300">
                        {room.energy_kw} kW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
