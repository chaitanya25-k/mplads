import React from 'react';
import { 
  ShieldAlert, 
  IndianRupee, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building, 
  ArrowUpRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Coins,
  Network
} from 'lucide-react';
import { NationalStats, StateSummary, AnomalyAlert, WorkItem } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface NationalOverviewProps {
  stats: NationalStats;
  stateSummaries: StateSummary[];
  sectorStats: Array<{ sector: string; worksCount: number; sanctionedCost: number; expenditure: number; avgCompletion: number }>;
  anomalies: AnomalyAlert[];
  onSelectAnomaly: (anomaly: AnomalyAlert) => void;
  onNavigateTab: (tab: string) => void;
  onInspectWork: (workId: string) => void;
}

const SECTOR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1'];

export const NationalOverview: React.FC<NationalOverviewProps> = ({
  stats,
  stateSummaries,
  sectorStats,
  anomalies,
  onSelectAnomaly,
  onNavigateTab,
  onInspectWork
}) => {
  const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
  const formatCrores = (val: number) => `₹${(val / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if Critical Issues Exist */}
      {criticalAnomalies.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/70 border border-rose-500/40 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded border border-rose-400/40">
                  CRITICAL FRAUD ALERTS ACTIVE
                </span>
                <span className="text-xs text-rose-200">
                  {criticalAnomalies.length} High-Risk Irregularities Detected
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 mt-1">
                Potential financial risk exposure of <strong className="text-amber-300">{formatCrores(stats.highRiskExposureAmount)}</strong> across duplicate community assets, ghost roads, and cost inflations.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ANOMALIES')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-slate-50 shadow transition-all shrink-0 cursor-pointer"
          >
            <span>Open Red Flag Triage</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocation Limit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Parliamentary Limit
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 tracking-tight">
              {formatCrores(stats.totalAllocatedLimit)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Across {stats.totalMPs} Hon'ble MPs</span>
              <span className="text-emerald-400 font-medium">{stats.averageUtilizationRate.toFixed(1)}% Utilized</span>
            </div>
          </div>
        </div>

        {/* Total Expenditure Released */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Scheme Expenditure
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 tracking-tight">
              {formatCrores(stats.totalExpenditure)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Unspent Balance:</span>
              <span className="text-amber-400 font-medium">{formatCrores(stats.totalAllocatedLimit - stats.totalExpenditure)}</span>
            </div>
          </div>
        </div>

        {/* High Risk Financial Exposure Protected */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Anomalous Exposure Flagged
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 tracking-tight">
              {formatCrores(stats.highRiskExposureAmount)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Protected Savings:</span>
              <span className="text-emerald-400 font-bold">{formatCrores(stats.potentialSavingsPrevented)}</span>
            </div>
          </div>
        </div>

        {/* Calamity Relief Funds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Calamity Consents Approved
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-300 tracking-tight">
              {formatCrores(stats.calamityFundsApproved)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Punjab & Wayanad Relief</span>
              <button 
                onClick={() => onNavigateTab('CALAMITY')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Track Relief →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Intelligence Banners: Vendor 2D Map & Spendings Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor 2D Risk Map Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Vendor 2D Risk & Monopoly Matrix
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Surveillance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Plots contractors on a 2D map based on frequency of work and average anomaly severity to pinpoint high-risk vendors & cartels.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('CONTRACTOR_RISK_MAP')}
            className="self-end inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-slate-950 shadow transition-all shrink-0 cursor-pointer"
          >
            <span>Launch Vendor 2D Map</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spendings & Trust Ledger Quick Access Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Real-Time Spending & Trust Ledger
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect every individual MPLADS payment voucher, vendor ID, attachment UC, and calculated statutory Trust Score (0–100).
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('SPENDINGS')}
            className="self-end inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow transition-all shrink-0 cursor-pointer"
          >
            <span>Open Spending Ledger</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualizations: State Heatmap & Sector Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Performance & Risk Matrix */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                State-wise Allocation & Fund Utilization
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparative analysis of allocated limits vs expenditure across major States & UTs
              </p>
            </div>
            <button 
              onClick={() => onNavigateTab('MPS')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all 231+ MPs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateSummaries.slice(0, 8)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="state" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(val) => `₹${(val / 10000000).toFixed(0)}Cr`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value: any, name: any) => [
                    formatCrores(Number(value)), 
                    name === 'totalAllocated' ? 'Allocated Limit' : 'Expenditure Released'
                  ]}
                />
                <Bar dataKey="totalAllocated" fill="#3b82f6" name="totalAllocated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalExpenditure" fill="#10b981" name="totalExpenditure" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick State Summary Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 font-semibold">State / UT</th>
                  <th className="py-2 font-semibold">MPs</th>
                  <th className="py-2 font-semibold">Allocated</th>
                  <th className="py-2 font-semibold">Utilization</th>
                  <th className="py-2 font-semibold">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stateSummaries.slice(0, 5).map((st) => (
                  <tr key={st.state} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 font-medium text-slate-200">{st.state}</td>
                    <td className="py-2 text-slate-400">{st.mpCount}</td>
                    <td className="py-2 text-slate-300">{formatCrores(st.totalAllocated)}</td>
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              st.utilizationRate >= 75 ? 'bg-emerald-500' : st.utilizationRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, st.utilizationRate)}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-medium">{st.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.riskLevel === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : st.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {st.riskLevel === 'CRITICAL' ? '⚠️ High Anomalies' : st.riskLevel === 'HIGH' ? 'Moderate Risk' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sectoral Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Sectoral Fund Allocation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution across key community development sectors
            </p>

            <div className="h-52 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorStats}
                    dataKey="sanctionedCost"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {sectorStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => formatCrores(Number(val))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
            {sectorStats.slice(0, 6).map((sec, idx) => (
              <div key={sec.sector} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }} 
                  />
                  <span className="text-slate-300 truncate">{sec.sector}</span>
                </div>
                <span className="font-semibold text-slate-200 shrink-0">
                  {formatCrores(sec.sanctionedCost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live AI Anomaly Ticker & Red Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base font-bold text-slate-100">
              Live AI Anomaly & Fraud Queue
            </h2>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
              {anomalies.length} Flags
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('ANOMALIES')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            Open Full Investigation Hub →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {anomalies.slice(0, 3).map((anm) => (
            <div 
              key={anm.id}
              onClick={() => onSelectAnomaly(anm)}
              className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    anm.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : anm.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {anm.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-bold text-rose-400">
                    Risk {anm.riskScore}/100
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mt-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {anm.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {anm.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{anm.district}, {anm.state}</span>
                <span className="text-amber-400 font-medium group-hover:underline flex items-center gap-1">
                  Deep Audit →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
