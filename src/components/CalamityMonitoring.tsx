import React, { useState } from 'react';
import { 
  CloudRain, 
  Search, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Layers,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { CalamityRecord } from '../types';

interface CalamityMonitoringProps {
  calamities: CalamityRecord[];
  onAskAIAboutCalamity: (calamityName: string) => void;
}

export const CalamityMonitoring: React.FC<CalamityMonitoringProps> = ({
  calamities,
  onAskAIAboutCalamity
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCalamityName, setSelectedCalamityName] = useState<string>('ALL');

  const calamityNames = Array.from(new Set(calamities.map(c => c.calamityName))).sort();
  const totalConsentAmount = calamities.reduce((acc, c) => acc + c.consentAmount, 0);

  const filtered = calamities.filter(c => {
    if (selectedType !== 'ALL' && c.calamityType !== selectedType) return false;
    if (selectedCalamityName !== 'ALL' && c.calamityName !== selectedCalamityName) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.calamityName.toLowerCase().includes(q) ||
        c.mpName.toLowerCase().includes(q) ||
        c.stateAffected.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(2)} Lakhs`;
  const formatCrores = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;
  const formatExactRupees = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CloudRain className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Calamity Relief & Disaster Consent Monitoring System
              </h1>
              <p className="text-xs text-slate-400">
                Official tracking of special calamity fund consents by Hon'ble MPs under Para 3.8 of MPLADS Guidelines
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">Total Calamity Fund Consented: </span>
          <span className="text-indigo-300 font-bold text-sm ml-1">{formatCrores(totalConsentAmount)}</span>
        </div>
      </div>

      {/* Statutory Guidelines Rule Card */}
      <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-100 block">National Calamity Ceiling (Max ₹1.00 Crore per MP):</strong>
            <span>MP may recommend up to ₹1 Cr for calamity of severe nature in any part of the country.</span>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-100 block">State Calamity Ceiling (Max ₹25.00 Lakhs per MP):</strong>
            <span>MP may recommend up to ₹25 Lakhs per year for affected district in their state.</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by MP name or Calamity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Calamity Name */}
        <div>
          <select
            value={selectedCalamityName}
            onChange={(e) => setSelectedCalamityName(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Calamities ({calamityNames.length})</option>
            {calamityNames.map(cn => (
              <option key={cn} value={cn}>{cn}</option>
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
            <option value="ALL">All Calamity Types</option>
            <option value="National Calamity">National Calamity</option>
            <option value="State Calamity">State Calamity</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Sr.</th>
                <th className="py-3 px-4 font-semibold">Calamity Name & Category</th>
                <th className="py-3 px-4 font-semibold">Hon'ble Member of Parliament</th>
                <th className="py-3 px-4 font-semibold">Date of Consent</th>
                <th className="py-3 px-4 font-semibold text-right">Consent Amount ( ₹ )</th>
                <th className="py-3 px-4 font-semibold">Disbursement & Utilization</th>
                <th className="py-3 px-4 font-semibold text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const isCeilingBreach = (item.calamityType === 'National Calamity' && item.consentAmount > 10000000) ||
                                       (item.calamityType === 'State Calamity' && item.consentAmount > 2500000);

                return (
                  <tr key={item.srNo} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{item.srNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.calamityName}</div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        item.calamityType === 'National Calamity'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.calamityType} • Affected State: {item.stateAffected}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.mpName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.dateOfConsent}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 text-sm">
                      {formatExactRupees(item.consentAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.utilizationPercent}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-medium text-[11px]">{item.utilizationPercent}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCeilingBreach ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ⚠ Ceiling Breach
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
