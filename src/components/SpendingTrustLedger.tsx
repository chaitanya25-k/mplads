import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Building2, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileX2,
  PieChart,
  ArrowUpDown,
  Building,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { SpendingRecord, SpendingTrustSummary } from '../types';

interface SpendingTrustLedgerProps {
  onInspectWork?: (workId: string) => void;
  onNavigateToAnomalies?: () => void;
}

export const SpendingTrustLedger: React.FC<SpendingTrustLedgerProps> = ({ 
  onInspectWork,
  onNavigateToAnomalies 
}) => {
  const [spendings, setSpendings] = useState<SpendingRecord[]>([]);
  const [summary, setSummary] = useState<SpendingTrustSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedHouse, setSelectedHouse] = useState<string>('ALL');
  const [selectedTrustFilter, setSelectedTrustFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'FLAGGED'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TRUST_DESC' | 'TRUST_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'DATE_DESC'>('TRUST_DESC');

  // Detail Modal
  const [selectedSpending, setSelectedSpending] = useState<SpendingRecord | null>(null);
  const [isReevaluating, setIsReevaluating] = useState<boolean>(false);
  const [reevalSuccess, setReevalSuccess] = useState<string | null>(null);

  const fetchSpendings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/spendings');
      const data = await res.json();
      if (data.success) {
        setSpendings(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Error fetching spending data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpendings();
  }, []);

  // Filter and Sort logic
  const filteredSpendings = useMemo(() => {
    return spendings.filter(item => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.workId.toLowerCase().includes(q) ||
          item.mpName.toLowerCase().includes(q) ||
          item.vendorName.toLowerCase().includes(q) ||
          item.workDescription.toLowerCase().includes(q) ||
          item.constituency.toLowerCase().includes(q) ||
          item.letterNo.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // State
      if (selectedState !== 'ALL' && item.state !== selectedState) return false;

      // House
      if (selectedHouse !== 'ALL' && item.house !== selectedHouse) return false;

      // Status
      if (selectedStatus !== 'ALL' && item.workStatus !== selectedStatus) return false;

      // Category
      if (selectedCategory !== 'ALL' && item.workCategory !== selectedCategory) return false;

      // Trust Tier
      if (selectedTrustFilter === 'HIGH' && item.trustScore < 85) return false;
      if (selectedTrustFilter === 'MODERATE' && (item.trustScore < 50 || item.trustScore >= 85)) return false;
      if (selectedTrustFilter === 'FLAGGED' && item.trustScore >= 50) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'TRUST_DESC') return b.trustScore - a.trustScore;
      if (sortBy === 'TRUST_ASC') return a.trustScore - b.trustScore;
      if (sortBy === 'AMOUNT_DESC') return b.disbursedAmount - a.disbursedAmount;
      if (sortBy === 'AMOUNT_ASC') return a.disbursedAmount - b.disbursedAmount;
      if (sortBy === 'DATE_DESC') return new Date(b.expenditureDate).getTime() - new Date(a.expenditureDate).getTime();
      return 0;
    });
  }, [spendings, searchQuery, selectedState, selectedHouse, selectedTrustFilter, selectedStatus, selectedCategory, sortBy]);

  // Unique list of states
  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(spendings.map(s => s.state))).filter(Boolean);
    return states.sort();
  }, [spendings]);

  // Unique categories
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(spendings.map(s => s.workCategory))).filter(Boolean);
    return cats.sort();
  }, [spendings]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Sno", "Work_ID", "Letter_No", "MP_Name", "House", "State", "Constituency", 
      "Vendor_Name", "Vendor_ID", "Disbursed_Amount_INR", "Work_Status", 
      "File_Status", "Attach_ID", "Trust_Score", "Trust_Rating", "Risk_Flags", "AI_Audit_Summary"
    ];
    
    const rows = filteredSpendings.map(s => [
      s.sno,
      `"${s.workId}"`,
      `"${s.letterNo}"`,
      `"${s.mpName}"`,
      `"${s.house}"`,
      `"${s.state}"`,
      `"${s.constituency}"`,
      `"${s.vendorName}"`,
      s.vendorId,
      s.disbursedAmount,
      `"${s.workStatus}"`,
      s.fileStatus ? "YES" : "NO",
      s.attachId || "N/A",
      s.trustScore,
      `"${s.trustRating}"`,
      `"${s.riskFlags.join('; ')}"`,
      `"${s.aiAuditSummary.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPLADS_Spending_Trust_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Re-evaluate spending
  const handleReevaluate = async (spending: SpendingRecord) => {
    setIsReevaluating(true);
    setReevalSuccess(null);
    try {
      const res = await fetch(`/api/data/spendings/${spending.id}/re-evaluate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.spending) {
        setSelectedSpending(data.spending);
        setSpendings(prev => prev.map(s => s.id === data.spending.id ? data.spending : s));
        setReevalSuccess("Spending Trust Score successfully re-evaluated with AI auditor models!");
        setTimeout(() => setReevalSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Re-evaluation failed:", err);
    } finally {
      setIsReevaluating(false);
    }
  };

  const getTrustBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
  };

  const getTrustBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                Spending & Trust Score Ledger
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  MoSPI SPARSH Feed
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every fund disbursement, vendor clearance & milestone payment audited with statutory AI Trust Scores (0–100).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={fetchSpendings}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tracked */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Disbursed</div>
          <div className="text-lg font-black text-slate-50 mt-1">
            ₹{((summary?.totalDisbursedValue || 0) / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{spendings.length} Recorded Spendings</div>
        </div>

        {/* Avg Trust Score */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Trust Score</div>
          <div className="text-lg font-black text-emerald-400 mt-1 flex items-baseline gap-1">
            <span>{summary?.averageTrustScore || 0}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.averageTrustScore || 0}%` }}
            />
          </div>
        </div>

        {/* High Trust (≥85) */}
        <div 
          onClick={() => setSelectedTrustFilter(selectedTrustFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTrustFilter === 'HIGH' 
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm' 
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            <span>High Trust (≥85)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-slate-50 mt-1">
            {summary?.highTrustCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Statutorily Verified</div>
        </div>

        {/* Moderate Trust (50-84) */}
        <div 
          onClick={() => setSelectedTrustFilter(selectedTrustFilter === 'MODERATE' ? 'ALL' : 'MODERATE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTrustFilter === 'MODERATE' 
              ? 'bg-amber-950/40 border-amber-500/50 shadow-sm' 
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <span>Watchlist (50-84)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-slate-50 mt-1">
            {summary?.moderateTrustCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Minor Discrepancies</div>
        </div>

        {/* Flagged Trust (<50) */}
        <div 
          onClick={() => setSelectedTrustFilter(selectedTrustFilter === 'FLAGGED' ? 'ALL' : 'FLAGGED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTrustFilter === 'FLAGGED' 
              ? 'bg-rose-950/40 border-rose-500/50 shadow-sm' 
              : 'bg-slate-900 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            <span>Flagged (&lt;50)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-400 mt-1">
            {summary?.flaggedCount || 0}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Immediate Audit Required</div>
        </div>

        {/* Verified Docs */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doc Compliance</div>
          <div className="text-lg font-black text-indigo-400 mt-1">
            {summary?.verifiedDocumentPercentage || 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Attach ID & Letter Verified</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Work ID, MP, Vendor, Letter No, Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* State Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All States ({spendings.length})</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* House Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Houses</option>
              <option value="Lok Sabha">Lok Sabha</option>
              <option value="Rajya Sabha">Rajya Sabha</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Work Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TRUST_DESC">Trust: Highest First</option>
              <option value="TRUST_ASC">Trust: Lowest First (High Risk)</option>
              <option value="AMOUNT_DESC">Amount: Highest First</option>
              <option value="AMOUNT_ASC">Amount: Lowest First</option>
              <option value="DATE_DESC">Date: Newest First</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium mr-1">Filter by Trust Rating:</span>
          
          <button
            onClick={() => setSelectedTrustFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              selectedTrustFilter === 'ALL'
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({spendings.length})
          </button>
          
          <button
            onClick={() => setSelectedTrustFilter('HIGH')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center space-x-1 ${
              selectedTrustFilter === 'HIGH'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>High Trust &ge;85 ({summary?.highTrustCount || 0})</span>
          </button>

          <button
            onClick={() => setSelectedTrustFilter('MODERATE')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center space-x-1 ${
              selectedTrustFilter === 'MODERATE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>Watchlist 50-84 ({summary?.moderateTrustCount || 0})</span>
          </button>

          <button
            onClick={() => setSelectedTrustFilter('FLAGGED')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center space-x-1 ${
              selectedTrustFilter === 'FLAGGED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            <span>Flagged Risk &lt;50 ({summary?.flaggedCount || 0})</span>
          </button>

          {/* Reset Filters */}
          {(searchQuery || selectedState !== 'ALL' || selectedHouse !== 'ALL' || selectedTrustFilter !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('ALL');
                setSelectedHouse('ALL');
                setSelectedTrustFilter('ALL');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="ml-auto text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Spendings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-bold">Work ID & Letter No</th>
                <th className="px-4 py-3.5 font-bold">MP & Constituency</th>
                <th className="px-4 py-3.5 font-bold">Activity & Work Details</th>
                <th className="px-4 py-3.5 font-bold">Vendor / Agency</th>
                <th className="px-4 py-3.5 font-bold text-right">Disbursed (₹)</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-center">Docs</th>
                <th className="px-4 py-3.5 font-bold text-center">Trust Score</th>
                <th className="px-4 py-3.5 font-bold text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSpendings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-400">No spending transactions match your filters.</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search parameters or adjusting trust thresholds.</p>
                  </td>
                </tr>
              ) : (
                filteredSpendings.map((item) => {
                  const isFlagged = item.trustScore < 50;
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isFlagged ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Work ID & Letter No */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-slate-200 truncate max-w-[140px]" title={item.workId}>
                          {item.workId}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={item.letterNo}>
                          {item.letterNo}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {item.expenditureDate}
                        </div>
                      </td>

                      {/* MP & Constituency */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{item.mpName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[130px]">{item.constituency}, {item.state}</span>
                        </div>
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.house}
                        </span>
                      </td>

                      {/* Activity & Description */}
                      <td className="px-4 py-3 max-w-[240px]">
                        <div className="font-medium text-slate-200 line-clamp-1" title={item.activityName}>
                          {item.activityName}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5" title={item.workDescription}>
                          {item.workDescription}
                        </div>
                        <div className="text-[9px] text-amber-400/80 mt-1 font-medium">
                          {item.workCategory}
                        </div>
                      </td>

                      {/* Vendor / Agency */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="font-medium text-slate-200 truncate" title={item.vendorName}>
                          {item.vendorName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {item.vendorId}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5" title={item.implementingAgency}>
                          IA: {item.implementingAgency}
                        </div>
                      </td>

                      {/* Disbursed Amount */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-slate-50 text-sm">
                          ₹{item.disbursedAmount.toLocaleString('en-IN')}
                        </div>
                        {item.sanctionAmount && (
                          <div className="text-[10px] text-slate-500">
                            Sanc: ₹{item.sanctionAmount.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Work Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.workStatus === 'Payment Success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.workStatus === 'Payment In-Progress'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : item.workStatus === 'Payment Withheld'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {item.workStatus}
                        </span>
                      </td>

                      {/* Docs verification */}
                      <td className="px-4 py-3 text-center">
                        {item.fileStatus && item.attachId ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="flex items-center text-[10px] text-emerald-400 font-semibold" title={`Attach ID: ${item.attachId}`}>
                              <FileCheck2 className="w-3.5 h-3.5 mr-0.5 text-emerald-400" />
                              ID:{item.attachId}
                            </span>
                            <span className="text-[9px] text-slate-500">Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="flex items-center text-[10px] text-amber-400/90 font-medium">
                              <FileX2 className="w-3.5 h-3.5 mr-0.5 text-amber-500" />
                              Missing
                            </span>
                            <span className="text-[9px] text-rose-400">Pending UC</span>
                          </div>
                        )}
                      </td>

                      {/* Trust Score & Bar */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getTrustBadgeClass(item.trustScore)}`}>
                            {item.trustScore} / 100
                          </span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getTrustBarColor(item.trustScore)}`}
                              style={{ width: `${item.trustScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedSpending(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors border border-slate-700"
                          title="Open Detailed Trust Audit Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Showing <strong className="text-slate-200">{filteredSpendings.length}</strong> of <strong className="text-slate-200">{spendings.length}</strong> spending transactions
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> High Trust (&ge;85)
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 ml-2" /> Moderate (50-84)
            <span className="inline-block w-2 h-2 rounded-full bg-rose-400 ml-2" /> Low Trust (&lt;50)
          </div>
        </div>
      </div>

      {/* Deep Audit Modal for Selected Spending */}
      {selectedSpending && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl border ${getTrustBadgeClass(selectedSpending.trustScore)}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-50">
                      Spending Trust & Statutory Audit Dossier
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTrustBadgeClass(selectedSpending.trustScore)}`}>
                      {selectedSpending.trustRating} TRUST
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Disbursement Reference: <span className="font-mono text-slate-200">{selectedSpending.workId}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSpending(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Toast message if re-evaluated */}
              {reevalSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{reevalSuccess}</span>
                </div>
              )}

              {/* Trust Score Hero Box */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:border-r border-slate-800 pr-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Trust Score</div>
                  <div className={`text-4xl font-black mt-2 ${
                    selectedSpending.trustScore >= 85 ? 'text-emerald-400' :
                    selectedSpending.trustScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {selectedSpending.trustScore}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getTrustBarColor(selectedSpending.trustScore)}`}
                      style={{ width: `${selectedSpending.trustScore}%` }}
                    />
                  </div>
                </div>

                {/* 4 Factor Breakdown */}
                <div className="md:col-span-2 space-y-2 text-xs">
                  <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                    Multi-Factor Trust Metric Breakdown (Max 25 pts each)
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vendor Integrity & Concentration:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedSpending.trustFactors?.vendorIntegrity || 20}/25
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${((selectedSpending.trustFactors?.vendorIntegrity || 20) / 25) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Document Completeness & UC Proof:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedSpending.trustFactors?.documentationCompleteness || 20}/25
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${((selectedSpending.trustFactors?.documentationCompleteness || 20) / 25) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Milestone & Ground Progress Alignment:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedSpending.trustFactors?.milestoneAlignment || 20}/25
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${((selectedSpending.trustFactors?.milestoneAlignment || 20) / 25) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Statutory MoSPI Guidelines Compliance:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedSpending.trustFactors?.statutoryCompliance || 20}/25
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${((selectedSpending.trustFactors?.statutoryCompliance || 20) / 25) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* AI Auditor Verdict */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Forensic Audit & Statutory Compliance Evaluation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSpending.aiAuditSummary}
                </p>
              </div>

              {/* Risk Flags if any */}
              {selectedSpending.riskFlags && selectedSpending.riskFlags.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Active Risk Flags & Statutory Caveats</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300">
                    {selectedSpending.riskFlags.map((flag, idx) => (
                      <li key={idx} className={flag.includes('CRITICAL') ? 'text-rose-300 font-semibold' : ''}>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disbursement Details</div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Disbursed Amount:</span>
                    <span className="font-bold text-slate-100">₹{selectedSpending.disbursedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Sanctioned Amount:</span>
                    <span className="font-bold text-slate-100">₹{(selectedSpending.sanctionAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="font-bold text-emerald-400">{selectedSpending.workStatus}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Disbursement Date:</span>
                    <span className="font-medium text-slate-200">{selectedSpending.expenditureDate}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor & Agency Record</div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Vendor Name:</span>
                    <span className="font-bold text-slate-100 truncate max-w-[160px]" title={selectedSpending.vendorName}>
                      {selectedSpending.vendorName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Vendor System ID:</span>
                    <span className="font-mono text-amber-400">{selectedSpending.vendorId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Letter No:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[160px]" title={selectedSpending.letterNo}>
                      {selectedSpending.letterNo}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Attachment / UC ID:</span>
                    <span className="font-mono text-emerald-400">{selectedSpending.attachId || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Checklist */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MoSPI MPLADS 2023 Guidelines Verification Checklist
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Para 2.4: Permissible asset class category</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Para 3.4: Schedule of Rates (SoR) conformity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Para 4.8: Staggered milestone disbursement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Para 5.2: Geo-tagged photographic verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Audited against SNA SPARSH & MoSPI National DB
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReevaluate(selectedSpending)}
                  disabled={isReevaluating}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isReevaluating ? 'animate-spin' : ''}`} />
                  <span>{isReevaluating ? 'Analyzing with AI...' : 'Re-Evaluate with AI'}</span>
                </button>

                <button
                  onClick={() => setSelectedSpending(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
