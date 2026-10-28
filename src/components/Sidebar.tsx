import React, { useState } from 'react';
import {  
  ShieldAlert, 
  BarChart3, 
  Users, 
  FolderKanban, 
  CloudRain, 
  FileSpreadsheet, 
  Bot, 
  Sparkles,
  Search,
  Building2,
  AlertTriangle,
  Cpu,
  FileCode,
  Download,
  Database,
  Menu,
  ChevronLeft,
  ChevronRight,
  Coins,
  Network,
  Sun, 
  Moon 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  criticalCount: number;
  onOpenExecutiveBrief: () => void;
  onOpenExportDossier: () => void;
  onRunBatchScan: () => void;
  isScanning: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  criticalCount,
  onOpenExecutiveBrief,
  onOpenExportDossier,
  onRunBatchScan,
  isScanning,
  isExpanded,
  setIsExpanded
}) => {
  const roles = [
    { id: 'NATIONAL', label: 'MoSPI National Apex', icon: Building2 },
    { id: 'STATE', label: 'State Nodal Authority (SNA)', icon: Building2 },
    { id: 'DISTRICT', label: 'District Magistrate / DA', icon: Building2 },
    { id: 'MP', label: 'Hon\'ble MP Portal', icon: Users },
    { id: 'PUBLIC', label: 'Public Transparency', icon: Search }
  ];

  const navItems = [
    { id: 'OVERVIEW', label: 'National Dashboard', icon: BarChart3 },
    { id: 'CONTRACTOR_RISK_MAP', label: 'Vendor 2D Risk Map', icon: Network, highlight: true },
    { id: 'SPENDINGS', label: 'Spendings & Trust Scores', icon: Coins, highlight: true },
    { id: 'ARCHITECTURE', label: 'Problem ID 26102 & Architecture', icon: FileCode },
    { id: 'ML_MODELS', label: 'ML Models & Telemetry', icon: Cpu },
    { id: 'DATASET_STUDIO', label: 'Dataset Studio & Upload', icon: Database },
    { id: 'AUDIT_LOG', label: 'Upload & Action Logs', icon: Database },
    { id: 'ANOMALIES', label: 'AI Anomaly & Fraud Hub', icon: ShieldAlert, badge: criticalCount },
    { id: 'MPS', label: 'MP Portfolio & Limits', icon: Users },
    { id: 'WORKS', label: 'Works & GIS Explorer', icon: FolderKanban },
    { id: 'CALAMITY', label: 'Calamity Relief Tracker', icon: CloudRain },
    { id: 'BATCH_CSV', label: 'CSV Batch Parser', icon: FileSpreadsheet },
    { id: 'AI_ASSISTANT', label: 'MoSPI AI Advisor', icon: Bot }
  ];

  return (
    <aside className={`flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'} min-h-screen shrink-0`}>
      {/* Header & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {isExpanded && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-50 shrink-0 text-sm shadow-inner border border-amber-400/30">
              🏛️
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                MoSPI AI
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate">
                Intelligence Core
              </span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${!isExpanded ? 'mx-auto' : ''}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'text-amber-300 font-semibold' : ''}`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 border border-slate-900" />
                )}
              </div>
              
              {isExpanded && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions (Bottom) */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {isExpanded && (
          <div className="mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Active Role</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="w-full bg-slate-950 text-xs font-medium text-amber-300 rounded px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-500"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={onOpenExportDossier}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors ${!isExpanded ? 'px-0' : ''}`}
          title="Export Report"
        >
          <Download className="w-4 h-4 text-amber-400 shrink-0" />
          {isExpanded && <span>Export Dossier</span>}
        </button>

        
        <button
          onClick={() => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', current);
            localStorage.setItem('mospi-theme', current);
          }}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700`}
          title={!isExpanded ? "Toggle Theme (Light / Dark)" : undefined}
        >
          <Sun className="w-4 h-4 dark-only text-amber-400" />
          <Moon className="w-4 h-4 light-only text-slate-700" />
          {isExpanded && <span>Switch Theme</span>}
        </button>
        <button
          onClick={onRunBatchScan}
          disabled={isScanning}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            isScanning 
              ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:shadow-amber-500/20'
          } ${!isExpanded ? 'px-0' : ''}`}
          title="Run AI Scan"
        >
          <Sparkles className={`w-4 h-4 shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
          {isExpanded && <span>{isScanning ? 'Scanning...' : 'Run AI Scan'}</span>}
        </button>

        <button
          onClick={onOpenExecutiveBrief}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors ${!isExpanded ? 'px-0' : ''}`}
          title="Executive Brief"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          {isExpanded && <span>Executive Brief</span>}
        </button>
      </div>
    </aside>
  );
};


