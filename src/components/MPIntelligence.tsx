import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  IndianRupee, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight,
  TrendingUp,
  Scale,
  Sparkles
} from 'lucide-react';
import { MPRecord } from '../types';

interface MPIntelligenceProps {
  mps: MPRecord[];
  onSelectMP: (mp: MPRecord) => void;
  onAskAIAboutMP: (mpName: string) => void;
}

export const MPIntelligence: React.FC<MPIntelligenceProps> = ({
  mps,
  onSelectMP,
  onAskAIAboutMP
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const states = Array.from(new Set(mps.map(m => m.state))).sort();

  const filtered = mps.filter(mp => {
    if (selectedState !== 'ALL' && mp.state !== selectedState) return false;
    if (selectedType !== 'ALL' && mp.type !== selectedType) return false;
    if (selectedRisk === 'HIGH' && mp.riskScore < 75 && mp.anomalyCount === 0) return false;
    if (selectedRisk === 'MEDIUM' && (mp.riskScore < 40 || mp.riskScore >= 75)) return false;
    if (selectedRisk === 'LOW' && mp.riskScore >= 40) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        mp.name.toLowerCase().includes(q) ||
        mp.state.toLowerCase().includes(q) ||
        mp.tenure.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCrores = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;
  const formatExactRupees = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Hon'ble Members of Parliament Allocation & Entitlement Matrix
              </h1>
              <p className="text-xs text-slate-400">
                Official Parliamentary portfolio limits, fund utilization velocity, unspent balance tracking & SC/ST compliance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 shrink-0">
          <span>Total MPs Monitored: <strong className="text-amber-400 font-bold">{mps.length}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Showing: <strong className="text-slate-100 font-bold">{filtered.length}</strong></span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by MP name or State..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* State Filter */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All States / UTs ({states.length})</option>
            {states.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All MP Types</option>
            <option value="Elected MP">Elected MP</option>
            <option value="Nominated MP">Nominated MP</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Risk Ratings</option>
            <option value="HIGH">High Risk / Anomalies</option>
            <option value="MEDIUM">Moderate Risk</option>
            <option value="LOW">Compliant / Normal</option>
          </select>
        </div>
      </div>

      {/* MP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(mp => (
          <div
            key={mp.srNo}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Header: State & Type */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {mp.state}
                </span>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-slate-400">{mp.type}</span>
                  <span className="font-mono text-slate-500">#{mp.srNo}</span>
                </div>
              </div>

              {/* MP Name & Tenure */}
              <div className="mt-3">
                <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                  {mp.name}
                </h3>
                <span className="text-xs font-mono text-slate-400 block mt-0.5">
                  Tenure: {mp.tenure}
                </span>
              </div>

              {/* Financial Metrics */}
              <div className="mt-4 bg-slate-950/70 rounded-lg p-3 border border-slate-800/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Allocated Limit:</span>
                  <span className="text-slate-100 font-bold font-mono">{formatExactRupees(mp.allocatedAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Released Expenditure:</span>
                  <span className="text-emerald-400 font-semibold font-mono">{formatExactRupees(mp.expenditureAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Unspent Balance:</span>
                  <span className="text-amber-300 font-semibold font-mono">{formatExactRupees(mp.unspentBalance)}</span>
                </div>

                {/* Progress Bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Fund Utilization Rate</span>
                    <span className="font-bold text-slate-200">{mp.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        mp.utilizationRate >= 75 ? 'bg-emerald-500' : mp.utilizationRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, mp.utilizationRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* SC / ST Statutory Quotas & Works Summary */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-400 block">SC Quota (≥15%):</span>
                  <span className={`font-bold mt-0.5 block ${mp.scPercentage >= 15 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mp.scPercentage.toFixed(1)}% {mp.scPercentage >= 15 ? '✓ Compliant' : '⚠ Deficit'}
                  </span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-400 block">ST Quota (≥7.5%):</span>
                  <span className={`font-bold mt-0.5 block ${mp.stPercentage >= 7.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mp.stPercentage.toFixed(1)}% {mp.stPercentage >= 7.5 ? '✓ Compliant' : '⚠ Deficit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {mp.anomalyCount > 0 ? (
                <span className="inline-flex items-center space-x-1 text-xs text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{mp.anomalyCount} Flagged Anomalies</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Compliant</span>
                </span>
              )}

              <button
                onClick={() => onAskAIAboutMP(mp.name)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
