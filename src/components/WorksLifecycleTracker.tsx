import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Camera, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { WorkItem, WorkStatus, SectorCategory } from '../types';

interface WorksLifecycleTrackerProps {
  works: WorkItem[];
  onInspectWork: (workId: string) => void;
  onSelectWorkForAudit: (work: WorkItem) => void;
}

export const WorksLifecycleTracker: React.FC<WorksLifecycleTrackerProps> = ({
  works,
  onInspectWork,
  onSelectWorkForAudit
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [anomaliesOnly, setAnomaliesOnly] = useState<boolean>(false);
  const [selectedWorkForModal, setSelectedWorkForModal] = useState<WorkItem | null>(null);

  const sectors = Array.from(new Set(works.map(w => w.sector))).sort();

  const filtered = works.filter(w => {
    if (selectedSector !== 'ALL' && w.sector !== selectedSector) return false;
    if (selectedStatus !== 'ALL' && w.status !== selectedStatus) return false;
    if (anomaliesOnly && !w.hasAnomalies) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.workCode.toLowerCase().includes(q) ||
        w.mpName.toLowerCase().includes(q) ||
        w.district.toLowerCase().includes(q) ||
        w.state.toLowerCase().includes(q) ||
        w.contractorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(2)} L`;
  const formatRupees = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderKanban className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Works Lifecycle & Physical-Financial Divergence Tracker
              </h1>
              <p className="text-xs text-slate-400">
                Granular tracking of sanctions, milestone disbursements, contractor allocations & geo-tagged physical progress
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setAnomaliesOnly(!anomaliesOnly)}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              anomaliesOnly
                ? 'bg-rose-600 text-slate-50 shadow-rose-600/30 shadow-md'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Show Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work title, code, contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Sector */}
        <div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Sectors ({sectors.length})</option>
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 text-xs font-medium text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Implementation Statuses</option>
            <option value="PHYSICAL_COMPLETED">Physical Completed</option>
            <option value="UC_SUBMITTED">Utilization Certificate Submitted</option>
            <option value="UNDER_EXECUTION">Under Execution</option>
            <option value="MILESTONE_PAID">Milestone Paid</option>
            <option value="STALLED">Stalled / Bottleneck</option>
          </select>
        </div>
      </div>

      {/* Works Table / Card Matrix */}
      <div className="space-y-4">
        {filtered.map(work => {
          const divergence = Math.abs(work.financialProgress - work.physicalProgress);
          const isSevereDivergence = work.financialProgress >= 70 && work.physicalProgress <= 30;

          return (
            <div
              key={work.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-sm transition-all hover:border-slate-700 ${
                isSevereDivergence || work.hasAnomalies
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/15 via-slate-900 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                    {work.sector}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {work.workCode}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {work.hasAnomalies && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{work.anomalyIds.length} Flagged Issues</span>
                    </span>
                  )}

                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    work.status === 'UC_SUBMITTED' || work.status === 'PHYSICAL_COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : work.status === 'STALLED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    {work.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3 className="text-base font-bold text-slate-100">
                  {work.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {work.description}
                </p>
              </div>

              {/* Physical vs Financial Comparison Bars */}
              <div className="mt-4 bg-slate-950/70 rounded-lg p-4 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Physical Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Physical Progress on Ground</span>
                    <span className="font-bold text-slate-200">{work.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        work.physicalProgress >= 75 ? 'bg-emerald-500' : work.physicalProgress >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${work.physicalProgress}%` }}
                    />
                  </div>
                </div>

                {/* Financial Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">
                      Funds Disbursed ({formatLakhs(work.expenditure)} / {formatLakhs(work.sanctionedCost)})
                    </span>
                    <span className="font-bold text-slate-200">{work.financialProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${work.financialProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Meta information: Location, Agency, Contractor */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                <div>
                  <span className="text-slate-500 block text-[10px]">Location:</span>
                  <span className="text-slate-300 font-medium">{work.blockPanchayat}, {work.district}, {work.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Implementing Agency:</span>
                  <span className="text-slate-300 font-medium truncate block">{work.implementingAgency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Contractor:</span>
                  <span className="text-slate-300 font-medium truncate block">{work.contractorName}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="font-medium">Hon'ble MP: <strong className="text-slate-200">{work.mpName}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Sanctioned: {work.sanctionDate}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectWorkForAudit(work)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Forensic Audit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
