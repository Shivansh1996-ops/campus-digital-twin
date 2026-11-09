import React, { useState, useEffect } from 'react';
import { History, TrendingUp, ShieldCheck, Zap, Sun, Leaf, ArrowRight } from 'lucide-react';
import { TimelineYear } from '../../types/campus';
import { fetchTimeline } from '../../services/api';
import { buildTimeline } from '../../services/clientIntelligence';

export const TimelineView: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineYear[]>(buildTimeline());
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  useEffect(() => {
    fetchTimeline().then(data => {
      if (Array.isArray(data) && data.length && typeof data[0]?.health_score === 'number') {
        setTimeline(data);
      }
    }).catch(console.error);
  }, []);

  const currentData = timeline.find(t => t.year === selectedYear) || timeline[2];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MLRIT HYDERABAD // DIGITAL TWIN TIMELINE & NET-ZERO 2028 ROADMAP
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Historical Evolution & Future Decarbonization Trajectory
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Compare Historical Performance (2024-2025) vs Current Operational State (2026) vs Net-Zero Milestones (2027-2028)
        </p>
      </div>

      {/* Year Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        {timeline.map(item => {
          const isSelected = item.year === selectedYear;
          return (
            <button
              key={item.year}
              onClick={() => setSelectedYear(item.year)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'glass-panel-glow border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>{item.year}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  item.year <= 2026 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-violet-500/20 text-violet-300'
                }`}>
                  {item.year <= 2026 ? 'ACTUAL' : 'TARGET'}
                </span>
              </div>
              <div className="text-base font-bold text-slate-100">{item.health_score} / 100</div>
              <div className="text-[10px] text-emerald-400 mt-1">{item.renewable_pct}% Clean Energy</div>
            </button>
          );
        })}
      </div>

      {/* Selected Year Comprehensive Breakdown */}
      {currentData && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-cyan-400 font-bold uppercase">{currentData.label}</span>
              <h3 className="text-xl font-bold text-slate-100 mt-1">Status: {currentData.status}</h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">CUMULATIVE CAPEX INVESTED</div>
              <div className="text-lg font-bold text-amber-300">₹{(currentData.total_capex_spent_inr).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">ANNUAL POWER DEMAND</div>
              <div className="text-xl font-bold text-cyan-300 mt-1">{currentData.energy_consumption_mwh.toLocaleString()} MWh</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">ANNUAL SOLAR GENERATION</div>
              <div className="text-xl font-bold text-emerald-300 mt-1">{currentData.solar_generation_mwh.toLocaleString()} MWh</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">ANNUAL WATER CONSUMPTION</div>
              <div className="text-xl font-bold text-blue-300 mt-1">{(currentData.water_consumption_kl / 1000).toFixed(0)} ML</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">ANNUAL CO2 EMISSIONS</div>
              <div className="text-xl font-bold text-rose-300 mt-1">{currentData.carbon_emissions_tons.toLocaleString()} Tons</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
