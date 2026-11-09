import React, { useState } from 'react';
import { Server, Search, Filter, ShieldCheck, AlertTriangle, Cpu, Wrench, CheckCircle } from 'lucide-react';
import { Asset, Building } from '../../types/campus';

interface AssetsViewProps {
  assets: Asset[];
  buildings: Building[];
  onSelectBuilding: (b: Building) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, buildings, onSelectBuilding }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'ELECTRICAL', 'MECHANICAL', 'IT', 'SECURITY', 'PLUMBING', 'RENEWABLE'];

  const filtered = assets.filter(a => {
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.type.toLowerCase().includes(search.toLowerCase()) ||
                          a.building_id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MLRIT HYDERABAD // CAMPUS INFRASTRUCTURE & ASSET INVENTORY
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Mechanical, Electrical, IT, Plumbing & Specialized Aero Assets
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Lifecycle Tracking • Subsonic Wind Tunnel • Transformers • Solar Arrays • Vibration Telemetry
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter assets by name, type, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {filtered.map(asset => (
          <div
            key={asset.id}
            className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                  {asset.category}
                </span>
                <h4 className="text-xs font-bold text-slate-200 mt-1.5 leading-snug">{asset.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{asset.location_description}</p>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                asset.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : (
                  asset.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                )
              }`}>
                {asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500">HEALTH SCORE:</span>
                <div className="font-bold text-cyan-400">{asset.health_score} / 100</div>
              </div>
              <div>
                <span className="text-slate-500">POWER RATING:</span>
                <div className="font-bold text-slate-200">{asset.power_kw} kW</div>
              </div>
              <div>
                <span className="text-slate-500">INSTALLED:</span>
                <div className="text-slate-300">{asset.installation_year}</div>
              </div>
              <div>
                <span className="text-slate-500">NEXT SERVICE:</span>
                <div className="text-slate-300">{asset.next_service_date}</div>
              </div>
            </div>

            {/* Metrics pills if present */}
            {asset.metrics && Object.keys(asset.metrics).length > 0 && (
              <div className="p-2 rounded bg-black/40 border border-slate-800/60 text-[10px] space-y-0.5">
                {Object.entries(asset.metrics).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span className="capitalize">{k.replace('_', ' ')}:</span>
                    <span className="text-cyan-300 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
