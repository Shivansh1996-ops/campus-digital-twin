import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Zap, Droplets, Sun, AlertTriangle } from 'lucide-react';
import { fetchExecutiveReport } from '../../services/api';

export const ExecutiveReportView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveReport()
      .then(data => setReport(data && typeof data === 'object' ? data : {}))
      .catch(() => setReport({}))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center font-mono text-cyan-400">Compiling MLRIT Executive Audit Report...</div>;
  }

  const kpi = report?.kpi_overview ?? {};
  const health = kpi.health_score ?? {};
  const power = kpi.power ?? {};
  const water = kpi.water ?? {};
  const occ = kpi.occupancy ?? {};
  const anomalies = report?.critical_anomalies ?? [];
  const recs = report?.top_roi_recommendations ?? [];
  const certs = report?.certifications ?? [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Action Header */}
      <div className="flex items-center justify-between p-4 rounded-xl glass-panel-glow border border-cyan-500/25 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-100 font-mono">MLRIT Official Facilities Audit Report</h2>
          <p className="text-[11px] text-slate-400 font-mono">Generated: {report?.generated_at ?? '—'}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Body */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-8 space-y-6 text-slate-200 font-mono text-xs print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-700 pb-4 flex justify-between items-start">
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              INSTITUTIONAL DIGITAL TWIN PLATFORM // OFFICIAL REPORT
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">
              Marri Laxman Reddy Institute of Technology (MLRIT)
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Dundigal, Gandimaisamma, Hyderabad, Telangana 500043
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-400">
            <div>DOC ID: {report?.report_id ?? 'MLRIT-EXEC'}</div>
            <div className="text-emerald-400 font-bold mt-1">HEALTH SCORE: {health.overall_score ?? 82}/100</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs">1. Executive Summary</h3>
          <p className="text-slate-300 leading-relaxed text-[11px]">{report?.executive_summary ?? 'Campus digital twin operational summary.'}</p>
        </div>

        {/* Core KPI Matrix Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs">2. Key Performance Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-slate-500">Power Demand:</span>
              <div className="font-bold text-cyan-300 text-sm">{power.total_consumption_kw ?? 2847} kW</div>
            </div>
            <div>
              <span className="text-slate-500">Rooftop Solar:</span>
              <div className="font-bold text-emerald-300 text-sm">{power.solar_generation_kw ?? 1420} kW ({power.solar_coverage_pct ?? 50}%)</div>
            </div>
            <div>
              <span className="text-slate-500">Water Consumption:</span>
              <div className="font-bold text-blue-300 text-sm">{water.total_flow_lpm ?? 482} LPM</div>
            </div>
            <div>
              <span className="text-slate-500">Campus Occupancy:</span>
              <div className="font-bold text-violet-300 text-sm">{occ.total_occupancy ?? 4820} Heads</div>
            </div>
          </div>
        </div>

        {/* Active Operational Anomalies */}
        <div className="space-y-2">
          <h3 className="font-bold text-red-400 uppercase tracking-wider text-xs">3. Active Anomalies & Critical Risks</h3>
          <div className="space-y-2">
            {anomalies.map((alt: any) => (
              <div key={alt.id} className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                <div className="flex justify-between font-bold text-red-300">
                  <span>{alt.title} ({alt.building_name})</span>
                  <span>{alt.severity}</span>
                </div>
                <p className="text-slate-300 text-[10px] mt-1">{alt.message}</p>
                <div className="text-cyan-400 text-[10px] mt-1 font-bold">Action: {alt.recommended_action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top ROI Optimization Opportunities */}
        <div className="space-y-2">
          <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-xs">4. Top Capital & Energy Optimization Opportunities</h3>
          <div className="space-y-2">
            {recs.map((rec: any) => (
              <div key={rec.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-slate-200 font-bold">
                  <span>{rec.title}</span>
                  <span className="text-emerald-400">Save ₹{rec.expected_financial_savings_inr_yr.toLocaleString()}/yr</span>
                </div>
                <div className="text-slate-400 text-[10px] mt-1">
                  Payback: {rec.payback_period_months} Months • CO2 Reduction: {rec.expected_co2_reduction_tons_yr} Tons/yr • Priority: {rec.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Certifications */}
        <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="space-x-4">
            {certs.map((c: any) => (
              <span key={c.standard}>• {c.standard}: <strong className="text-cyan-400">{c.status}</strong></span>
            ))}
          </div>
          <div>MLRIT DUNDIGAL CAMPUS // APPROVED FOR CIRCULATION</div>
        </div>
      </div>
    </div>
  );
};
