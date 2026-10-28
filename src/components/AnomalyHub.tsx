import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Building2, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  ArrowRight,
  TrendingUp,
  Scale,
  ChevronDown,
  ChevronUp,
  Send,
  Bot
} from 'lucide-react';
import { AnomalyAlert, AnomalyCategory, RiskLevel } from '../types';
import { NudgeAuthorityModal } from './NudgeAuthorityModal';

interface AnomalyHubProps {
  anomalies: AnomalyAlert[];
  onSelectAnomaly: (anomaly: AnomalyAlert) => void;
  onUpdateStatus: (id: string, newStatus: any, notes?: string) => Promise<void>;
  onRunBatchScan: () => void;
  isScanning: boolean;
}

export const AnomalyHub: React.FC<AnomalyHubProps> = ({
  anomalies,
  onSelectAnomaly,
  onUpdateStatus,
  onRunBatchScan,
  isScanning
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'FROZEN' | 'RESOLVED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Expand state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Nudge Modal State
  const [nudgingAnomaly, setNudgingAnomaly] = useState<AnomalyAlert | null>(null);

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Categories', count: anomalies.length },
    { id: 'DUPLICATE_WORK', label: 'Duplicate Works (GIS/NLP)', count: anomalies.filter(a => a.category === 'DUPLICATE_WORK').length },
    { id: 'PHYSICAL_FINANCIAL_DIVERGENCE', label: 'Physical-Financial Gaps', count: anomalies.filter(a => a.category === 'PHYSICAL_FINANCIAL_DIVERGENCE').length },
    { id: 'COST_OVERRUN', label: 'Cost & Rate Inflation', count: anomalies.filter(a => a.category === 'COST_OVERRUN').length },
    { id: 'VENDOR_MONOPOLY', label: 'Vendor Cartelization', count: anomalies.filter(a => a.category === 'VENDOR_MONOPOLY').length },
    { id: 'YEAR_END_DUMPING', label: 'March Rush Dumping', count: anomalies.filter(a => a.category === 'YEAR_END_DUMPING').length },
    { id: 'SANCTION_LATENCY', label: 'Execution Bottlenecks', count: anomalies.filter(a => a.category === 'SANCTION_LATENCY').length }
  ];

  const filtered = anomalies.filter(a => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (activeTab === 'ACTIVE' && (a.status === 'RESOLVED_JUSTIFIED' || a.status === 'DISBURSEMENT_FROZEN')) return false;
    if (activeTab === 'FROZEN' && a.status !== 'DISBURSEMENT_FROZEN') return false;
    if (activeTab === 'RESOLVED' && a.status !== 'RESOLVED_JUSTIFIED') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.workTitle.toLowerCase().includes(q) ||
        a.workCode.toLowerCase().includes(q) ||
        a.mpName.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickAction = async (anomaly: AnomalyAlert, newStatus: any, notes: string) => {
    setUpdatingId(anomaly.id);
    try {
      await onUpdateStatus(anomaly.id, newStatus, notes);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                AI Anomaly & Fraud Detection Command Hub
              </h1>
              <p className="text-xs text-slate-400">
                Continuous ML surveillance over MPLADS sanctions, expenditure velocities, physical milestones & vendor bidding
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunBatchScan}
            disabled={isScanning}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-950 shadow transition-all ${
              isScanning 
                ? 'bg-amber-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning National Portfolio...' : 'Trigger National AI Scan'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === cat.id ? 'bg-slate-950 text-amber-300 font-black' : 'bg-slate-800 text-slate-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work code, MP, contractor, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
          />
        </div>

        {/* Severity & Status Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {/* Status Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            {(['ALL', 'ACTIVE', 'FROZEN', 'RESOLVED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Active Flags' : tab === 'FROZEN' ? 'Disbursement Frozen' : 'Resolved'}
              </button>
            ))}
          </div>

          {/* Severity Select */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 text-xs font-medium text-slate-300 rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 shrink-0"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity (90+ Risk)</option>
            <option value="HIGH">High Severity (75-89 Risk)</option>
            <option value="MEDIUM">Medium Severity (50-74 Risk)</option>
          </select>
        </div>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-semibold text-slate-200">No matching anomalies in current view</h3>
            <p className="text-xs text-slate-400 mt-1">
              All transactions in this category adhere to standard Schedule of Rates and MPLADS guidelines.
            </p>
          </div>
        ) : (
          filtered.map(anm => (
            <div
              key={anm.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${
                anm.severity === 'CRITICAL'
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900'
                  : anm.severity === 'HIGH'
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header (Clickable to Expand) */}
              <div className="cursor-pointer" onClick={() => toggleExpand(anm.id)}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      anm.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : anm.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {anm.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {anm.workCode}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400">ML Risk Score:</span>
                      <span className={`font-black px-2 py-0.5 rounded text-xs ${
                        anm.riskScore >= 90
                          ? 'bg-rose-600 text-slate-50'
                          : anm.riskScore >= 75
                          ? 'bg-amber-600 text-slate-50'
                          : 'bg-blue-600 text-slate-50'
                      }`}>
                        {anm.riskScore}/100
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      anm.status === 'DISBURSEMENT_FROZEN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : anm.status === 'FIELD_INSPECTION_ORDERED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : anm.status === 'RESOLVED_JUSTIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {anm.status.replace(/_/g, ' ')}
                    </span>
                    
                    {expandedId === anm.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Title & Core Summary */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{anm.title}</span>
                  </h3>
                  <p className={`text-xs text-slate-300 mt-1 leading-relaxed ${expandedId === anm.id ? '' : 'line-clamp-2'}`}>
                    {anm.summary}
                  </p>
                </div>
              </div>

              {/* Expanded Details Area */}
              {expandedId === anm.id && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in slide-in-from-top-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center">
                      <Bot className="w-4 h-4 mr-2" /> AI Forensic Reasoning
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <strong>Detection Method: </strong>{(anm.evidence as any)?.detectionMethod || "Multivariate Outlier Detection (Isolation Forest)"} <br />
                      <strong>Model Used: </strong>{(anm.evidence as any)?.mlModelUsed || "XGBoost + DBSCAN Geo-Clustering"} <br /><br />
                      This record was flagged because the data deviated significantly from normal state distributions or breached absolute statutory constraints defined in {anm.evidence?.statutoryRuleClause || "MPLADS Guidelines 2023"}. The system's multi-vector risk ensemble computed a confidence level that this is an irregularity requiring human intervention.
                    </p>
                  </div>

                  {/* Forensic Evidence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/70 rounded-lg p-3.5 mt-3 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Benchmark / Norm Value:</span>
                      <span className="text-slate-200 font-semibold mt-0.5 block">{anm.evidence?.expectedValue || 'Schedule of Rates Standard'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Recorded Ground Transaction:</span>
                      <span className="text-rose-400 font-bold mt-0.5 block">{anm.evidence?.actualValue || 'Discrepancy Found'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Statutory MPLADS Clause:</span>
                      <span className="text-amber-300/90 font-medium mt-0.5 block line-clamp-2">{anm.evidence?.statutoryRuleClause}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location & MP Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{anm.district}, {anm.state}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>MP: <strong className="text-slate-300 font-medium">{anm.mpName}</strong></span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setNudgingAnomaly(anm)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    title="Nudge higher authorities with a report"
                  >
                    <Send className="w-3 h-3" />
                    <span>Nudge Authority</span>
                  </button>

                  {/* Quick Freeze Disbursement */}
                  {anm.status !== 'DISBURSEMENT_FROZEN' && (
                    <button
                      onClick={() => handleQuickAction(anm, 'DISBURSEMENT_FROZEN', 'Automated statutory freeze on milestone payments pending DQM audit.')}
                      disabled={updatingId === anm.id}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      title="Instantly stop milestone payouts"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Freeze Payout</span>
                    </button>
                  )}

                  {/* Quick Field Inspection */}
                  {anm.status !== 'FIELD_INSPECTION_ORDERED' && (
                    <button
                      onClick={() => handleQuickAction(anm, 'FIELD_INSPECTION_ORDERED', 'District Quality Monitor (DQM) dispatched for physical on-site inspection.')}
                      disabled={updatingId === anm.id}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Dispatch Inspection</span>
                    </button>
                  )}

                  {/* Deep AI Forensic Audit Trigger */}
                  <button
                    onClick={() => onSelectAnomaly(anm)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deep AI Audit</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {nudgingAnomaly && (
        <NudgeAuthorityModal 
          anomaly={nudgingAnomaly} 
          onClose={() => setNudgingAnomaly(null)} 
        />
      )}
    </div>
  );
};
