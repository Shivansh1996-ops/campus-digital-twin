import React from 'react';
import {
  Box, LayoutDashboard, Globe, Zap, Droplets, Sun, Wind,
  Users, Server, AlertOctagon, Sparkles, Sliders, History,
  Bot, FileText, Settings, ShieldAlert, Satellite
} from 'lucide-react';

export type ActiveTab =
  | '3D_TWIN'
  | 'OVERVIEW'
  | 'SATELLITE'
  | 'ENERGY'
  | 'WATER'
  | 'SOLAR'
  | 'HVAC'
  | 'OCCUPANCY'
  | 'ASSETS'
  | 'WASTAGE'
  | 'OPTIMIZATION'
  | 'WHAT_IF'
  | 'TIMELINE'
  | 'AI_ASSISTANT'
  | 'REPORT'
  | 'ADMIN';

export interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeAlertsCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  activeAlertsCount
}) => {
  const navSections: NavSection[] = [
    {
      title: 'SPATIAL VIEWPORTS',
      items: [
        { id: '3D_TWIN', label: '3D Campus Twin', icon: Box },
        { id: 'SATELLITE', label: 'Satellite GIS Station', icon: Satellite, highlight: true },
        { id: 'OVERVIEW', label: 'Command Center', icon: LayoutDashboard },
      ]
    },
    {
      title: 'UTILITIES & GRIDS',
      items: [
        { id: 'ENERGY' as ActiveTab, label: 'Energy & Power Grid', icon: Zap },
        { id: 'SOLAR' as ActiveTab, label: 'Rooftop Solar PV', icon: Sun },
        { id: 'WATER' as ActiveTab, label: 'Water & Hydro-Flow', icon: Droplets },
        { id: 'HVAC' as ActiveTab, label: 'HVAC & Air Quality', icon: Wind },
      ]
    },
    {
      title: 'AI & PREDICTIVE',
      items: [
        { id: 'WASTAGE' as ActiveTab, label: 'Wastage Detector', icon: AlertOctagon, badge: '3' },
        { id: 'OPTIMIZATION' as ActiveTab, label: 'AI Optimization', icon: Sparkles },
        { id: 'WHAT_IF' as ActiveTab, label: 'What-If Simulation', icon: Sliders },
        { id: 'OCCUPANCY' as ActiveTab, label: 'Occupancy & Space', icon: Users },
        { id: 'TIMELINE' as ActiveTab, label: 'Net-Zero Timeline', icon: History },
      ]
    },
    {
      title: 'OPERATIONS & REPORT',
      items: [
        { id: 'AI_ASSISTANT' as ActiveTab, label: 'MLRIT AI Copilot', icon: Bot },
        { id: 'ASSETS' as ActiveTab, label: 'Asset Inventory', icon: Server },
        { id: 'REPORT' as ActiveTab, label: 'Executive Report', icon: FileText },
        { id: 'ADMIN' as ActiveTab, label: 'System Admin', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[15.5rem] h-[calc(100vh-4rem)] glass-panel border-r border-[var(--line)] flex flex-col justify-between py-3 px-2.5 z-20 select-none overflow-y-auto shrink-0 font-sans text-xs">
      <div className="space-y-4">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <span className="text-[9px] font-bold tracking-[0.16em] text-[var(--muted)] px-3 uppercase font-mono">
              {sec.title}
            </span>

            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''} ${item.highlight && !isActive ? 'highlight' : ''}`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-[var(--muted)]'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--danger)]/15 border border-[var(--danger)]/35 text-[#f0a090] font-bold font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeAlertsCount > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-xs">
          <div className="flex items-center gap-2 text-[#c2410c] font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">{activeAlertsCount} active alerts</span>
          </div>
          <p className="text-[11px] text-[#6b6b6b] leading-snug">
            TR-02 thermal overload and Marri Nilayam leak need attention.
          </p>
        </div>
      )}
    </aside>
  );
};
