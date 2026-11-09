import React, { useState } from 'react';
import { Settings, Download, Database } from 'lucide-react';
import { Building } from '../../types/campus';

interface AdminViewProps {
  buildings: Building[];
  onRefresh: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ buildings, onRefresh }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(buildings[0] || null);
  const [successMsg, setSuccessMsg] = useState('');

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg(`Downloaded ${filename}`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleExportCsv = () => {
    const cols = ['id', 'code', 'name', 'type', 'floors_count', 'total_area_sqm', 'solar_capacity_kw', 'energy_consumption_kw', 'current_occupancy', 'maintenance_status'];
    const rows = buildings.map(b => cols.map(c => JSON.stringify((b as any)[c] ?? '')).join(','));
    download('mlrit-campus-inventory.csv', [cols.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  const handleExportJson = () => {
    download('mlrit-digital-twin.json', JSON.stringify({ generated_at: new Date().toISOString(), buildings }, null, 2), 'application/json');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/25">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MLRIT HYDERABAD // ADMINISTRATION & DATA MANAGEMENT
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">
          Campus Inventory, CSV / JSON Export & IoT Ingestion Gateway
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Manage Building Profiles • Configure Sensor Thresholds • Export Facilities Backup
        </p>
      </div>

      {/* Export / Backup Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-200 flex items-center space-x-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Campus Inventory (CSV)</span>
          </h3>
          <p className="text-slate-400 text-[11px]">
            Download normalized tabular dataset of all 10 MLRIT campus facilities, areas, solar capacities, and loads.
          </p>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            Download CSV Inventory
          </button>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-200 flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Export Complete Digital Twin Snapshot (JSON)</span>
          </h3>
          <p className="text-slate-400 text-[11px]">
            Full JSON backup containing hierarchical campus schema: buildings, floors, rooms, sensors, and live telemetry.
          </p>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Download JSON Snapshot
          </button>
        </div>
      </div>

      {/* Building Modifier Form */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 font-mono space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Edit Facility Metadata & Energy Baselines
          </h3>
          <select
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            value={selectedBuilding?.id}
            onChange={(e) => setSelectedBuilding(buildings.find(b => b.id === e.target.value) || null)}
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        {successMsg && (
          <div className="text-[11px] text-emerald-300 font-mono">{successMsg}</div>
        )}
        {selectedBuilding && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Building Name</label>
              <input
                type="text"
                disabled
                value={selectedBuilding.name}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Built-up Area (sqm)</label>
              <input
                type="number"
                disabled
                value={selectedBuilding.total_area_sqm}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Floors Count</label>
              <input
                type="number"
                disabled
                value={selectedBuilding.floors_count}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Solar PV Capacity (kWp)</label>
              <input
                type="number"
                disabled
                value={selectedBuilding.solar_capacity_kw}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Max Occupant Capacity</label>
              <input
                type="number"
                disabled
                value={selectedBuilding.max_capacity}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Energy Efficiency Rating (0-100)</label>
              <input
                type="number"
                disabled
                value={selectedBuilding.energy_efficiency_score}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
