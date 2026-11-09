import React from 'react';
import { AlertOctagon, TrendingDown, DollarSign, Zap, Droplets, CheckCircle, ArrowRight } from 'lucide-react';
import { WastageItem, Building } from '../../types/campus';

interface WastageViewProps {
  wastageItems: WastageItem[];
  onSelectBuilding: (b: Building) => void;
  buildings: Building[];
}

export const WastageView: React.FC<WastageViewProps> = ({ wastageItems, onSelectBuilding, buildings }) => {
  const totalCost = wastageItems.reduce((acc, w) => acc + w.estimated_monthly_cost_inr, 0);
  const totalKwh = wastageItems.reduce((acc, w) => acc + w.estimated_monthly_kwh, 0);
  const totalCo2 = wastageItems.reduce((acc, w) => acc + w.estimated_monthly_co2_kg, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-amber-500/25">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            MLRIT HYDERABAD // REAL-TIME WASTAGE & ANOMALY DETECTOR
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Identified Energy & Water Inefficiencies
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Automated Algorithmic Detection: Vacant Room AC Operation • Riser Water Leaks • Standby Loads
        </p>
      </div>

      {/* Financial Impact Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-red-500/30">
          <div className="text-xs text-slate-400">TOTAL ESTIMATED WASTED EXPENDITURE</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            ₹{totalCost.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Annual Impact: ₹{(totalCost * 12).toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/30">
          <div className="text-xs text-slate-400">AVOIDABLE ELECTRICITY DRAIN</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {totalKwh.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kWh / month</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-2">Peak Wasted Draw: ~15.2 kW continuous</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-rose-500/30">
          <div className="text-xs text-slate-400">EXCESS CO2 EMISSIONS</div>
          <div className="text-2xl font-bold text-rose-300 mt-1">
            {totalCo2.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg / month</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Grid Factor: 0.72 kg CO2/kWh</div>
        </div>
      </div>

      {/* Wastage Item Cards */}
      <div className="space-y-4">
        {wastageItems.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/40 transition-all font-mono"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.priority} PRIORITY
                  </span>
                  <span className="text-xs text-cyan-400 font-bold">{item.building_name}</span>
                  <span className="text-xs text-slate-400">({item.location})</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{item.description}</h3>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-amber-300">
                  ₹{item.estimated_monthly_cost_inr.toLocaleString()} / mo
                </div>
                <div className="text-[10px] text-slate-400">
                  Drain: {item.wasted_quantity_per_hour} {item.unit}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">PRIMARY ROOT CAUSE</div>
                <div className="text-slate-300 mt-0.5">{item.primary_cause}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">RECOMMENDED CORRECTIVE ACTION</div>
                <div className="text-cyan-300 mt-0.5">{item.recommended_action}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">ESTIMATED DATA // DIGITAL TWIN ALGORITHM AUDIT</span>
              <button
                onClick={() => {
                  const b = buildings.find(bld => bld.id === item.building_id);
                  if (b) onSelectBuilding(b);
                }}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Inspect in 3D View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
