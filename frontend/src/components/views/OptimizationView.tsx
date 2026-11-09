import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, DollarSign, Clock, Leaf } from 'lucide-react';
import { Recommendation } from '../../types/campus';

interface OptimizationViewProps {
  recommendations: Recommendation[];
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({ recommendations }) => {
  const totalFinancial = recommendations.reduce((acc, r) => acc + r.expected_financial_savings_inr_yr, 0);
  const totalEnergy = recommendations.reduce((acc, r) => acc + r.expected_energy_savings_kwh_yr, 0);
  const totalCo2 = recommendations.reduce((acc, r) => acc + r.expected_co2_reduction_tons_yr, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MLRIT HYDERABAD // AI-ASSISTED CAMPUS OPTIMIZATION ENGINE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Predictive Capital & Operational Optimization Opportunities
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Grounded Data-Driven Energy, Solar, HVAC, and Water Initiatives Ranked by ROI & Payback Velocity
        </p>
      </div>

      {/* Aggregate Savings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/30">
          <div className="text-xs text-slate-400">TOTAL COMBINED ANNUAL SAVINGS</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            ₹{totalFinancial.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ year</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2">Combined across 3 top initiatives</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-cyan-500/30">
          <div className="text-xs text-slate-400">CLEAN ENERGY GENERATED & CONSERVED</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">
            {(totalEnergy / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-normal">MWh / year</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">{totalEnergy.toLocaleString()} kWh</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-violet-500/30">
          <div className="text-xs text-slate-400">TOTAL CARBON REDUCTION</div>
          <div className="text-2xl font-bold text-violet-300 mt-1">
            {totalCo2.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Tons CO2 / yr</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">Telangana State Clean Campus Standard</div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all font-mono"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    rec.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    DIFFICULTY: {rec.implementation_difficulty}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {rec.confidence_score}% CONFIDENCE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1.5">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Target: {rec.building_name}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-bold text-emerald-300">
                  ₹{rec.expected_financial_savings_inr_yr.toLocaleString()} / yr
                </div>
                <div className="text-xs text-cyan-400 font-bold">
                  Payback: {rec.payback_period_months} Months
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">IDENTIFIED PROBLEM</div>
                <div className="text-slate-300 mt-0.5">{rec.problem}</div>

                <div className="text-[10px] text-slate-500 uppercase mt-2">EVIDENCE BASE</div>
                <div className="text-slate-400 mt-0.5">{rec.evidence}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">AI RECOMMENDED ACTION</div>
                <div className="text-cyan-300 mt-0.5">{rec.recommended_action}</div>

                <div className="flex items-center space-x-4 mt-3 text-[11px]">
                  <span className="text-cyan-400">Energy: {rec.expected_energy_savings_kwh_yr.toLocaleString()} kWh/yr</span>
                  <span className="text-emerald-400">CO2: {rec.expected_co2_reduction_tons_yr} Tons</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>DATA SOURCE: PREDICTED AI HEURISTICS // MLRIT DIGITAL TWIN</span>
              <span className="text-cyan-400">Ready for What-If Simulation Test</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
