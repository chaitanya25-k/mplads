import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ContractorAnalytics, 
  RiskLevel, 
  WorkItem, 
  AnomalyAlert 
} from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  Maximize2, 
  Minimize2, 
  Building2, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Info, 
  Sparkles, 
  Sliders, 
  Layers, 
  FileText, 
  RefreshCw, 
  Globe, 
  TrendingUp, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  X
} from 'lucide-react';

interface Contractor2DRiskMapProps {
  contractors?: ContractorAnalytics[];
  works?: WorkItem[];
  anomalies?: AnomalyAlert[];
  onInspectWork?: (workId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const Contractor2DRiskMap: React.FC<Contractor2DRiskMapProps> = ({
  contractors: initialContractors,
  works = [],
  anomalies = [],
  onInspectWork,
  onNavigateTab
}) => {
  const [contractorList, setContractorList] = useState<ContractorAnalytics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'2D_MAP' | 'TABLE'>('2D_MAP');
  const [spotlightDangerZone, setSpotlightDangerZone] = useState<boolean>(false);
  const [showThresholdControls, setShowThresholdControls] = useState<boolean>(false);
  
  // Configurable thresholds for the 2D crosshairs
  const [frequencyThreshold, setFrequencyThreshold] = useState<number>(10);
  const [severityThreshold, setSeverityThreshold] = useState<number>(55);

  // Selected contractor for the deep inspection dossier drawer
  const [selectedContractor, setSelectedContractor] = useState<ContractorAnalytics | null>(null);

  // Hover state for 2D tooltip
  const [hoveredContractor, setHoveredContractor] = useState<{
    contractor: ContractorAnalytics;
    x: number;
    y: number;
  } | null>(null);

  // Search Grounding Intel state
  const [intelLoading, setIntelLoading] = useState<boolean>(false);
  const [intelData, setIntelData] = useState<{
    intelReport: string;
    source: string;
    groundingSources: Array<{ title: string; url: string }>;
  } | null>(null);

  // Fetch contractors from API or use prop fallback
  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/contractors');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setContractorList(data);
      } else if (initialContractors && initialContractors.length > 0) {
        setContractorList(initialContractors);
      }
    } catch (err) {
      console.error('Error fetching contractors for 2D risk map:', err);
      if (initialContractors && initialContractors.length > 0) {
        setContractorList(initialContractors);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  // Compute stats and quadrant classification for each contractor
  const enrichedContractors = useMemo(() => {
    return contractorList.map(c => {
      const freq = c.totalWorksAllocated;
      const severity = c.averageAnomalySeverity !== undefined 
        ? c.averageAnomalySeverity 
        : c.riskRating === 'CRITICAL' ? 88 : c.riskRating === 'HIGH' ? 72 : c.riskRating === 'MEDIUM' ? 35 : 12;

      let quadrant: 'Q1_DANGER' | 'Q2_ISOLATED' | 'Q3_CONCENTRATION' | 'Q4_COMPLIANT';
      if (freq >= frequencyThreshold && severity >= severityThreshold) {
        quadrant = 'Q1_DANGER'; // High Frequency, High Severity
      } else if (freq < frequencyThreshold && severity >= severityThreshold) {
        quadrant = 'Q2_ISOLATED'; // Low Frequency, High Severity
      } else if (freq >= frequencyThreshold && severity < severityThreshold) {
        quadrant = 'Q3_CONCENTRATION'; // High Frequency, Low Severity
      } else {
        quadrant = 'Q4_COMPLIANT'; // Low Frequency, Low Severity
      }

      return {
        ...c,
        computedSeverity: severity,
        quadrant
      };
    });
  }, [contractorList, frequencyThreshold, severityThreshold]);

  // Extract unique states for filter
  const stateOptions = useMemo(() => {
    const states = new Set(contractorList.map(c => c.state));
    return ['ALL', ...Array.from(states).sort()];
  }, [contractorList]);

  // Filtered contractors
  const filteredContractors = useMemo(() => {
    return enrichedContractors.filter(c => {
      const matchesSearch = 
        !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = selectedState === 'ALL' || c.state.toLowerCase() === selectedState.toLowerCase();
      const matchesRisk = selectedRisk === 'ALL' || c.riskRating === selectedRisk;
      const matchesQuadrant = selectedQuadrant === 'ALL' || c.quadrant === selectedQuadrant;

      return matchesSearch && matchesState && matchesRisk && matchesQuadrant;
    });
  }, [enrichedContractors, searchQuery, selectedState, selectedRisk, selectedQuadrant]);

  // KPI calculations
  const kpiStats = useMemo(() => {
    const total = enrichedContractors.length;
    const q1Count = enrichedContractors.filter(c => c.quadrant === 'Q1_DANGER').length;
    const q2Count = enrichedContractors.filter(c => c.quadrant === 'Q2_ISOLATED').length;
    const q3Count = enrichedContractors.filter(c => c.quadrant === 'Q3_CONCENTRATION').length;
    const q4Count = enrichedContractors.filter(c => c.quadrant === 'Q4_COMPLIANT').length;
    
    const highRiskValue = enrichedContractors
      .filter(c => c.riskRating === 'CRITICAL' || c.riskRating === 'HIGH')
      .reduce((acc, c) => acc + c.totalValue, 0);

    const monopolyCount = enrichedContractors.filter(c => c.districtWorkSharePercent >= 50).length;
    const frozenCount = enrichedContractors.filter(c => c.activeSanctionFreeze).length;

    const avgSeverity = total > 0 
      ? Math.round(enrichedContractors.reduce((acc, c) => acc + c.computedSeverity, 0) / total) 
      : 0;

    return {
      total,
      q1Count,
      q2Count,
      q3Count,
      q4Count,
      highRiskValue,
      monopolyCount,
      frozenCount,
      avgSeverity
    };
  }, [enrichedContractors]);

  // Handle freeze toggle
  const handleToggleFreeze = async (contractorName: string, currentState?: boolean) => {
    try {
      const res = await fetch('/api/contractors/toggle-freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorName, freezeState: !currentState })
      });
      const data = await res.json();
      if (data.success) {
        setContractorList(prev => prev.map(c => {
          if (c.name.toLowerCase() === contractorName.toLowerCase()) {
            return { ...c, activeSanctionFreeze: data.activeSanctionFreeze };
          }
          return c;
        }));
        if (selectedContractor && selectedContractor.name.toLowerCase() === contractorName.toLowerCase()) {
          setSelectedContractor(prev => prev ? { ...prev, activeSanctionFreeze: data.activeSanctionFreeze } : null);
        }
      }
    } catch (err) {
      console.error('Error toggling contractor freeze:', err);
    }
  };

  // Handle Gemini search grounding intelligence check
  const handleFetchSearchIntel = async (contractor: ContractorAnalytics) => {
    setIntelLoading(true);
    setIntelData(null);
    try {
      const res = await fetch('/api/contractors/search-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorName: contractor.name,
          district: contractor.district,
          state: contractor.state
        })
      });
      const data = await res.json();
      if (data.success) {
        setIntelData({
          intelReport: data.intelReport,
          source: data.source,
          groundingSources: data.groundingSources || []
        });
      }
    } catch (err) {
      console.error('Error fetching search intel:', err);
    } finally {
      setIntelLoading(false);
    }
  };

  // Open dossier modal & pre-clear intel
  const handleSelectContractor = (contractor: ContractorAnalytics) => {
    setSelectedContractor(contractor);
    setIntelData(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Contractor Name',
      'State',
      'District',
      'Category',
      'Frequency of Work (Allocated)',
      'Average Anomaly Severity (0-100)',
      'Total Sanctioned Value (INR)',
      'District Share (%)',
      'Average Delay (Days)',
      'Anomaly Count',
      'Risk Rating',
      'Risk Quadrant',
      'Disbursement Frozen'
    ];

    const rows = filteredContractors.map(c => [
      `"${c.name}"`,
      `"${c.state}"`,
      `"${c.district}"`,
      `"${c.category || 'Civil Infrastructure'}"`,
      c.totalWorksAllocated,
      c.computedSeverity,
      c.totalValue,
      c.districtWorkSharePercent,
      c.averageDelayDays,
      c.anomalyCount,
      c.riskRating,
      c.quadrant,
      c.activeSanctionFreeze ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Vendor_2D_Risk_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart bounds & scaling parameters
  const svgWidth = 920;
  const svgHeight = 580;
  const padding = { top: 40, right: 40, bottom: 65, left: 65 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max X axis (Frequency): 32 works
  const maxX = 30;
  // Max Y axis (Severity): 100 index
  const maxY = 100;

  const scaleX = (val: number) => padding.left + (Math.min(maxX, Math.max(0, val)) / maxX) * plotWidth;
  const scaleY = (val: number) => padding.top + plotHeight - (Math.min(maxY, Math.max(0, val)) / maxY) * plotHeight;

  // Scaled threshold line positions
  const threshX = scaleX(frequencyThreshold);
  const threshY = scaleY(severityThreshold);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>MoSPI Statutory Procurement Surveillance</span>
              <span className="text-slate-600">|</span>
              <span>2D Matrix Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Contractor 2D Risk & Monopoly Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Plotting government contractors across <span className="text-slate-200 font-semibold">Frequency of Work</span> (X-Axis) and <span className="text-slate-200 font-semibold">Average Anomaly Severity</span> (Y-Axis). Pinpoints tender cartels, ghost works, and systemic exposure for targeted CAG audits.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setShowThresholdControls(!showThresholdControls)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                showThresholdControls 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Calibrate dynamic threshold lines"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Calibrate Thresholds</span>
            </button>

            <button
              onClick={() => setSpotlightDangerZone(!spotlightDangerZone)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                spotlightDangerZone 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-950/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Highlight only high-risk vendors in danger quadrants"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${spotlightDangerZone ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>Danger Spotlight</span>
            </button>

            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setViewMode('2D_MAP')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === '2D_MAP' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                2D Map
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'TABLE' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                Ledger View
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Export contractor risk matrix to CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Threshold Calibration Drawer */}
        {showThresholdControls && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-lg border">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-300 flex items-center space-x-1">
                  <span>Frequency Cutoff (X-Axis)</span>
                  <span className="text-[10px] text-slate-500">(Separates Routine vs High-Volume Vendors)</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono font-bold">
                  {frequencyThreshold} Works
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="1"
                value={frequencyThreshold}
                onChange={(e) => setFrequencyThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>4 works (Strict)</span>
                <span>10 works (Standard MPLADS Benchmark)</span>
                <span>20 works (Monopoly)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-300 flex items-center space-x-1">
                  <span>Anomaly Severity Cutoff (Y-Axis)</span>
                  <span className="text-[10px] text-slate-500">(Separates Compliant vs Threat Zones)</span>
                </span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-mono font-bold">
                  {severityThreshold} / 100 Index
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={severityThreshold}
                onChange={(e) => setSeverityThreshold(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>30 (Low tolerance)</span>
                <span>55 (CAG Benchmark Trigger)</span>
                <span>80 (Critical only)</span>
              </div>
            </div>
          </div>
        )}

        {/* Macro KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Monitored</span>
            <div className="text-xl font-black text-slate-100 mt-0.5">{kpiStats.total}</div>
            <span className="text-[10px] text-slate-400">Civil & Tech Vendors</span>
          </div>

          <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">Danger Zone (Q1)</span>
            <div className="text-xl font-black text-rose-300 mt-0.5">{kpiStats.q1Count}</div>
            <span className="text-[10px] text-rose-400/80">High Freq + High Severity</span>
          </div>

          <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Isolated Threat (Q2)</span>
            <div className="text-xl font-black text-amber-300 mt-0.5">{kpiStats.q2Count}</div>
            <span className="text-[10px] text-amber-400/80">Low Freq + Severe Breaches</span>
          </div>

          <div className="bg-sky-950/20 p-3 rounded-lg border border-sky-900/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">Monopoly Watch (Q3)</span>
            <div className="text-xl font-black text-sky-300 mt-0.5">{kpiStats.q3Count}</div>
            <span className="text-[10px] text-sky-400/80">High Volume Concentration</span>
          </div>

          <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Compliant Safe (Q4)</span>
            <div className="text-xl font-black text-emerald-300 mt-0.5">{kpiStats.q4Count}</div>
            <span className="text-[10px] text-emerald-400/80">Clean Track Record</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Value in Danger</span>
            <div className="text-xl font-black text-rose-400 mt-0.5">
              ₹{(kpiStats.highRiskValue / 10000000).toFixed(1)} Cr
            </div>
            <span className="text-[10px] text-slate-400">{kpiStats.frozenCount} Accounts Frozen</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contractor name, district, state or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-100 pl-9 pr-8 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* State Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-500"
            >
              {stateOptions.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'All States' : st}</option>
              ))}
            </select>
          </div>

          {/* Risk Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Risk Tier:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Quadrant Quick Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Quadrant:</span>
            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Quadrants</option>
              <option value="Q1_DANGER">Q1: Danger Zone (High/High)</option>
              <option value="Q2_ISOLATED">Q2: Isolated Threat (Low/High)</option>
              <option value="Q3_CONCENTRATION">Q3: Monopoly Watch (High/Low)</option>
              <option value="Q4_COMPLIANT">Q4: Compliant Safe (Low/Low)</option>
            </select>
          </div>

          {(selectedState !== 'ALL' || selectedRisk !== 'ALL' || selectedQuadrant !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedState('ALL');
                setSelectedRisk('ALL');
                setSelectedQuadrant('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Visualizer Area */}
      {viewMode === '2D_MAP' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Top Plot Legend & Instructions */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-4 mb-2 border-b border-slate-800 gap-3">
            <div className="flex items-center flex-wrap gap-4">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive 2D Map:</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm" />
                <span className="text-slate-300 font-semibold">Critical Threat (Q1/Q2)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-sm" />
                <span className="text-slate-300 font-semibold">High Severity</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
                <span className="text-slate-300 font-semibold">Medium Watch</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
                <span className="text-slate-300 font-semibold">Compliant Clean</span>
              </span>
              <span className="text-[11px] text-slate-500 hidden lg:inline">
                (Bubble size proportional to Total Value ₹ Cr)
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Showing <span className="font-bold text-slate-100">{filteredContractors.length}</span> of {enrichedContractors.length} vendors
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="w-full overflow-x-auto select-none relative">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto min-w-[760px] text-slate-400"
              style={{ maxHeight: '640px' }}
            >
              <defs>
                {/* Quadrant gradient fills */}
                <linearGradient id="q1Grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="q2Grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0.03" />
                </linearGradient>
                <linearGradient id="q3Grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#a16207" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="q4Grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.02" />
                </linearGradient>

                {/* Pulsing glow filter for critical vendors */}
                <filter id="criticalGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Quadrant Background Rectangles */}
              {/* Q2: Top-Left (Low Freq, High Severity) */}
              <rect
                x={padding.left}
                y={padding.top}
                width={threshX - padding.left}
                height={threshY - padding.top}
                fill="url(#q2Grad)"
                className="transition-all"
              />
              {/* Q1: Top-Right (High Freq, High Severity - Danger Zone) */}
              <rect
                x={threshX}
                y={padding.top}
                width={padding.left + plotWidth - threshX}
                height={threshY - padding.top}
                fill="url(#q1Grad)"
                className="transition-all"
              />
              {/* Q4: Bottom-Left (Low Freq, Low Severity - Compliant) */}
              <rect
                x={padding.left}
                y={threshY}
                width={threshX - padding.left}
                height={padding.top + plotHeight - threshY}
                fill="url(#q4Grad)"
                className="transition-all"
              />
              {/* Q3: Bottom-Right (High Freq, Low Severity - Monopoly Watch) */}
              <rect
                x={threshX}
                y={threshY}
                width={padding.left + plotWidth - threshX}
                height={padding.top + plotHeight - threshY}
                fill="url(#q3Grad)"
                className="transition-all"
              />

              {/* Grid Lines */}
              {/* Horizontal Grid Lines */}
              {[0, 20, 40, 60, 80, 100].map(val => (
                <g key={`y-grid-${val}`}>
                  <line
                    x1={padding.left}
                    y1={scaleY(val)}
                    x2={padding.left + plotWidth}
                    y2={scaleY(val)}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 12}
                    y={scaleY(val) + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="currentColor"
                    className="font-mono"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Vertical Grid Lines */}
              {[0, 5, 10, 15, 20, 25, 30].map(val => (
                <g key={`x-grid-${val}`}>
                  <line
                    x1={scaleX(val)}
                    y1={padding.top}
                    x2={scaleX(val)}
                    y2={padding.top + plotHeight}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={scaleX(val)}
                    y={padding.top + plotHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="font-mono"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Quadrant Watermark Labels */}
              {/* Q1 Label (Top-Right) */}
              <g className="opacity-75">
                <text
                  x={padding.left + plotWidth - 15}
                  y={padding.top + 22}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight="900"
                  fill="#ef4444"
                  letterSpacing="0.05em"
                >
                  QUADRANT I: CRITICAL MONOPOLY & HIGH SEVERITY
                </text>
                <text
                  x={padding.left + plotWidth - 15}
                  y={padding.top + 38}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#f87171"
                  className="font-mono"
                >
                  High Volume + Severe Breaches | Immediate CAG Enquiry & Freeze
                </text>
              </g>

              {/* Q2 Label (Top-Left) */}
              <g className="opacity-75">
                <text
                  x={padding.left + 15}
                  y={padding.top + 22}
                  textAnchor="start"
                  fontSize="12"
                  fontWeight="900"
                  fill="#f97316"
                  letterSpacing="0.05em"
                >
                  QUADRANT II: ISOLATED SEVERE IRREGULARITY
                </text>
                <text
                  x={padding.left + 15}
                  y={padding.top + 38}
                  textAnchor="start"
                  fontSize="9.5"
                  fill="#fb923c"
                  className="font-mono"
                >
                  Low Volume + High Impact | Ghost Assets / Rate Inflation
                </text>
              </g>

              {/* Q3 Label (Bottom-Right) */}
              <g className="opacity-70">
                <text
                  x={padding.left + plotWidth - 15}
                  y={padding.top + plotHeight - 28}
                  textAnchor="end"
                  fontSize="11.5"
                  fontWeight="800"
                  fill="#eab308"
                  letterSpacing="0.05em"
                >
                  QUADRANT III: HIGH-VOLUME MONOPOLY WATCH
                </text>
                <text
                  x={padding.left + plotWidth - 15}
                  y={padding.top + plotHeight - 14}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#fde047"
                  className="font-mono"
                >
                  High Tender Concentration (&gt;40% HHI) | Single-Bidder Cartel Watch
                </text>
              </g>

              {/* Q4 Label (Bottom-Left) */}
              <g className="opacity-70">
                <text
                  x={padding.left + 15}
                  y={padding.top + plotHeight - 28}
                  textAnchor="start"
                  fontSize="11.5"
                  fontWeight="800"
                  fill="#10b981"
                  letterSpacing="0.05em"
                >
                  QUADRANT IV: ROUTINE COMPLIANT BENCHMARK
                </text>
                <text
                  x={padding.left + 15}
                  y={padding.top + plotHeight - 14}
                  textAnchor="start"
                  fontSize="9.5"
                  fill="#6ee7b7"
                  className="font-mono"
                >
                  Low Frequency + Normal Statutory Velocity | Safe Threshold
                </text>
              </g>

              {/* Dynamic Threshold Lines */}
              {/* Frequency Threshold Line (Vertical) */}
              <line
                x1={threshX}
                y1={padding.top}
                x2={threshX}
                y2={padding.top + plotHeight}
                stroke="#eab308"
                strokeWidth="1.8"
                strokeDasharray="5 4"
                className="transition-all"
              />
              <g transform={`translate(${threshX}, ${padding.top - 10})`}>
                <rect x="-42" y="-14" width="84" height="18" rx="4" fill="#eab308" />
                <text x="0" y="-2" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000000">
                  Freq Threshold: {frequencyThreshold}
                </text>
              </g>

              {/* Severity Threshold Line (Horizontal) */}
              <line
                x1={padding.left}
                y1={threshY}
                x2={padding.left + plotWidth}
                y2={threshY}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="5 4"
                className="transition-all"
              />
              <g transform={`translate(${padding.left + plotWidth + 8}, ${threshY + 3})`}>
                <rect x="0" y="-9" width="60" height="18" rx="4" fill="#ef4444" />
                <text x="30" y="3" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  Sev: {severityThreshold}
                </text>
              </g>

              {/* Axis Boundaries */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + plotHeight}
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1={padding.left}
                y1={padding.top + plotHeight}
                x2={padding.left + plotWidth}
                y2={padding.top + plotHeight}
                stroke="currentColor"
                strokeWidth="2"
              />

              {/* Axis Titles */}
              <text
                x={padding.left + plotWidth / 2}
                y={padding.top + plotHeight + 46}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="currentColor"
                letterSpacing="0.05em"
              >
                FREQUENCY OF WORK (Total Projects Allocated to Vendor) →
              </text>

              <text
                x={-(padding.top + plotHeight / 2)}
                y={padding.left - 42}
                transform="rotate(-90)"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="currentColor"
                letterSpacing="0.05em"
              >
                AVERAGE ANOMALY SEVERITY INDEX (0 = Safe, 100 = Critical Fraud) →
              </text>

              {/* Contractor Nodes (Data Points) */}
              {filteredContractors.map((contractor) => {
                const cx = scaleX(contractor.totalWorksAllocated);
                const cy = scaleY(contractor.computedSeverity);

                // Bubble radius based on financial value (min 9px, max 24px)
                const minR = 9;
                const maxR = 24;
                const radius = minR + (Math.min(contractor.totalValue, 150000000) / 150000000) * (maxR - minR);

                const isSelected = selectedContractor?.name === contractor.name;
                const isCritical = contractor.riskRating === 'CRITICAL';
                const isHigh = contractor.riskRating === 'HIGH';
                const isMedium = contractor.riskRating === 'MEDIUM';

                // Determine bubble fill color
                let fillColor = '#10b981'; // Green
                let strokeColor = '#059669';
                if (isCritical) {
                  fillColor = '#ef4444'; // Red
                  strokeColor = '#b91c1c';
                } else if (isHigh) {
                  fillColor = '#f97316'; // Orange
                  strokeColor = '#c2410c';
                } else if (isMedium) {
                  fillColor = '#eab308'; // Amber
                  strokeColor = '#a16207';
                }

                // Opacity handling when danger spotlight is turned on
                const isDimmed = spotlightDangerZone && contractor.quadrant !== 'Q1_DANGER' && contractor.quadrant !== 'Q2_ISOLATED';

                return (
                  <g 
                    key={contractor.name} 
                    className={`cursor-pointer transition-transform duration-200 ${isDimmed ? 'opacity-20' : 'opacity-100 hover:scale-110'}`}
                    onClick={() => handleSelectContractor(contractor)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredContractor({
                        contractor,
                        x: cx,
                        y: cy
                      });
                    }}
                    onMouseLeave={() => setHoveredContractor(null)}
                  >
                    {/* Animated Pulsing Halo for Critical High-Risk Vendors */}
                    {isCritical && !isDimmed && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 7}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="animate-spin"
                        style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: '6s' }}
                      />
                    )}

                    {/* Selected Node Ring */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 9}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                      />
                    )}

                    {/* Core Bubble */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={fillColor}
                      fillOpacity={isDimmed ? 0.3 : 0.88}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isCritical && !isDimmed ? 'url(#criticalGlow)' : undefined}
                    />

                    {/* Lock Icon / Freeze indicator */}
                    {contractor.activeSanctionFreeze && (
                      <circle
                        cx={cx + radius * 0.7}
                        cy={cy - radius * 0.7}
                        r="5"
                        fill="#000000"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Short Label on large nodes */}
                    {radius >= 14 && (
                      <text
                        cx={cx}
                        cy={cy + 3.5}
                        x={cx}
                        y={cy + 3.5}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#ffffff"
                        pointerEvents="none"
                        className="font-mono shadow-sm select-none"
                      >
                        {contractor.totalWorksAllocated}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredContractor && (
              <div 
                className="absolute z-30 pointer-events-none bg-slate-950/95 border border-amber-500/50 rounded-xl p-3.5 shadow-2xl text-slate-100 text-xs w-72 backdrop-blur-md transition-all duration-100"
                style={{
                  left: `${Math.min(svgWidth - 300, Math.max(10, (hoveredContractor.x / svgWidth) * 100))}%`,
                  top: `${Math.max(10, (hoveredContractor.y / svgHeight) * 100 - 15)}%`
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      {hoveredContractor.contractor.district}, {hoveredContractor.contractor.state}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm leading-tight">
                      {hoveredContractor.contractor.name}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                    hoveredContractor.contractor.riskRating === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    hoveredContractor.contractor.riskRating === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    hoveredContractor.contractor.riskRating === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {hoveredContractor.contractor.riskRating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-slate-400 block text-[10px]">Work Frequency:</span>
                    <span className="font-mono font-bold text-slate-100">{hoveredContractor.contractor.totalWorksAllocated} Works</span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-slate-400 block text-[10px]">Avg Anomaly Sev:</span>
                    <span className={`font-mono font-bold ${hoveredContractor.contractor.computedSeverity >= 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {hoveredContractor.contractor.computedSeverity} / 100
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-slate-400 block text-[10px]">Total Value:</span>
                    <span className="font-mono font-bold text-slate-100">
                      ₹{(hoveredContractor.contractor.totalValue / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded">
                    <span className="text-slate-400 block text-[10px]">District Share:</span>
                    <span className={`font-mono font-bold ${hoveredContractor.contractor.districtWorkSharePercent >= 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {hoveredContractor.contractor.districtWorkSharePercent}%
                    </span>
                  </div>
                </div>

                {hoveredContractor.contractor.activeSanctionFreeze && (
                  <div className="bg-rose-950/60 border border-rose-600/40 text-rose-300 text-[10px] px-2 py-1 rounded flex items-center space-x-1.5 font-bold mb-1.5">
                    <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Disbursements Frozen by District Authority</span>
                  </div>
                )}

                <div className="text-[10px] text-amber-400/90 font-medium flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Click node to open Forensic Dossier</span>
                  <span>→</span>
                </div>
              </div>
            )}
          </div>

          {/* Quadrant Legend Bar Below Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div 
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'Q1_DANGER' ? 'ALL' : 'Q1_DANGER')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedQuadrant === 'Q1_DANGER' 
                  ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-rose-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                <span>Q1: Danger Zone</span>
                <span className="px-1.5 py-0.2 bg-rose-500/20 rounded font-mono">{kpiStats.q1Count}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                High frequency (&ge;{frequencyThreshold}) + high severity (&ge;{severityThreshold}). Immediate debarment and CAG audit trigger.
              </p>
            </div>

            <div 
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'Q2_ISOLATED' ? 'ALL' : 'Q2_ISOLATED')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedQuadrant === 'Q2_ISOLATED' 
                  ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-orange-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-orange-400 font-bold mb-1">
                <span>Q2: Isolated Severe</span>
                <span className="px-1.5 py-0.2 bg-orange-500/20 rounded font-mono">{kpiStats.q2Count}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Low frequency + critical breaches (ghost roads, duplicate sanctions, fake geo-tags).
              </p>
            </div>

            <div 
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'Q3_CONCENTRATION' ? 'ALL' : 'Q3_CONCENTRATION')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedQuadrant === 'Q3_CONCENTRATION' 
                  ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-amber-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                <span>Q3: Monopoly Watch</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 rounded font-mono">{kpiStats.q3Count}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                High frequency + low anomaly rate. Screen for tender tailoring and single-bidder cartels.
              </p>
            </div>

            <div 
              onClick={() => setSelectedQuadrant(selectedQuadrant === 'Q4_COMPLIANT' ? 'ALL' : 'Q4_COMPLIANT')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedQuadrant === 'Q4_COMPLIANT' 
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-emerald-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                <span>Q4: Compliant Safe</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 rounded font-mono">{kpiStats.q4Count}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Normal work velocity, verified UCs, on-time completion, and clean physical audits.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tabular Ledger View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vendor Entity</th>
                  <th className="py-3 px-4 font-semibold">State & District</th>
                  <th className="py-3 px-4 font-semibold text-center">Frequency (Works)</th>
                  <th className="py-3 px-4 font-semibold text-center">Avg Anomaly Sev</th>
                  <th className="py-3 px-4 font-semibold text-center">Risk Tier</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Sanctioned</th>
                  <th className="py-3 px-4 font-semibold text-center">District Share</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredContractors.map((contractor) => (
                  <tr 
                    key={contractor.name} 
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                    onClick={() => handleSelectContractor(contractor)}
                  >
                    <td className="py-3 px-4 font-medium text-slate-100">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold block">{contractor.name}</span>
                          <span className="text-[10px] text-slate-400">{contractor.category || 'Civil Infrastructure'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span>{contractor.district}</span>
                      <span className="text-[10px] text-slate-400 block">{contractor.state}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-100">
                      {contractor.totalWorksAllocated}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        contractor.computedSeverity >= 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        contractor.computedSeverity >= 45 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {contractor.computedSeverity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        contractor.riskRating === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        contractor.riskRating === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        contractor.riskRating === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {contractor.riskRating}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ₹{(contractor.totalValue / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={contractor.districtWorkSharePercent >= 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {contractor.districtWorkSharePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {contractor.activeSanctionFreeze ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700 flex items-center justify-center space-x-1">
                          <Lock className="w-2.5 h-2.5 text-rose-400" />
                          <span>FROZEN</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectContractor(contractor);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                        title="Open Forensic Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Forensic Contractor Dossier Slide-Over / Modal */}
      {selectedContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl text-slate-100">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                    <span>MoSPI CAG Forensic Vendor Dossier</span>
                    <span className="text-slate-600">|</span>
                    <span>{selectedContractor.district}, {selectedContractor.state}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                    {selectedContractor.name}
                  </h2>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Category: <strong className="text-slate-200">{selectedContractor.category || 'Civil Infrastructure & Public Works'}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setSelectedContractor(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Risk Banner */}
              <div className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                selectedContractor.riskRating === 'CRITICAL' ? 'bg-rose-950/30 border-rose-800/60 text-rose-300' :
                selectedContractor.riskRating === 'HIGH' ? 'bg-orange-950/30 border-orange-800/60 text-orange-300' :
                selectedContractor.riskRating === 'MEDIUM' ? 'bg-amber-950/30 border-amber-800/60 text-amber-300' :
                'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                    Statutory Risk Assessment
                  </span>
                  <div className="text-lg font-black mt-0.5 flex items-center space-x-2">
                    <span>{selectedContractor.riskRating} RISK TIER</span>
                    {selectedContractor.activeSanctionFreeze && (
                      <span className="text-xs bg-rose-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                        Disbursement Frozen
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-90 block mt-0.5">
                    {selectedContractor.computedSeverity && selectedContractor.computedSeverity >= 60 
                      ? 'Statutory Red Flag: Identified high-priority target for CAG / MoSPI Special Audit.' 
                      : 'Compliant vendor conforming to MPLADS Operational Guidelines 2023.'}
                  </span>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                    Severity Score
                  </span>
                  <span className="text-2xl font-black font-mono">
                    {selectedContractor.computedSeverity || 15}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </span>
                </div>
              </div>

              {/* Matrix Coordinates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Frequency (X)</span>
                  <div className="text-lg font-black text-slate-100 font-mono mt-0.5">
                    {selectedContractor.totalWorksAllocated}
                  </div>
                  <span className="text-[10px] text-slate-400">Total Projects</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Severity (Y)</span>
                  <div className="text-lg font-black text-slate-100 font-mono mt-0.5">
                    {selectedContractor.computedSeverity}
                  </div>
                  <span className="text-[10px] text-slate-400">Anomaly Index</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tender Value</span>
                  <div className="text-lg font-black text-slate-100 font-mono mt-0.5">
                    ₹{(selectedContractor.totalValue / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[10px] text-slate-400">Public Funds</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">District Share</span>
                  <div className={`text-lg font-black font-mono mt-0.5 ${
                    selectedContractor.districtWorkSharePercent >= 50 ? 'text-rose-400' : 'text-slate-100'
                  }`}>
                    {selectedContractor.districtWorkSharePercent}%
                  </div>
                  <span className="text-[10px] text-slate-400">HHI Monopoly</span>
                </div>
              </div>

              {/* Identification details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Statutory Registration & Filing</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PAN Entity Number:</span>
                    <span className="font-mono font-bold text-slate-200">{selectedContractor.panNumber || 'AABCS9821K'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">GSTIN Registration:</span>
                    <span className="font-mono font-bold text-slate-200">{selectedContractor.gstin || '27AABCS9821K1Z9'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Average Delay:</span>
                    <span className="font-mono font-bold text-amber-400">{selectedContractor.averageDelayDays} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Active Red Flags:</span>
                    <span className="font-mono font-bold text-rose-400">{selectedContractor.anomalyCount} Flagged Items</span>
                  </div>
                </div>
              </div>

              {/* Statutory Guideline Violations Log */}
              {selectedContractor.statutoryViolations && selectedContractor.statutoryViolations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Recorded Statutory Breaches (MPLADS Guidelines 2023)</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedContractor.statutoryViolations.map((violation, idx) => (
                      <div key={idx} className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg text-xs text-rose-200 flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{violation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Works Assigned */}
              {selectedContractor.recentWorks && selectedContractor.recentWorks.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recent Works Associated with Vendor</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedContractor.recentWorks.map((workTitle, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <span className="truncate pr-2">{workTitle}</span>
                        <span className="text-[10px] text-amber-400 font-semibold shrink-0">Under Audit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Search Grounding & Real-time Public Registry Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Live Search Grounding: Public Registry & Media Surveillance
                    </h4>
                  </div>
                  <button
                    onClick={() => handleFetchSearchIntel(selectedContractor)}
                    disabled={intelLoading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${intelLoading ? 'animate-spin' : ''}`} />
                    <span>{intelLoading ? 'Checking Registries...' : 'Run Search Intelligence'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Grounds vendor intelligence using real-time Google Search across Ministry of Corporate Affairs (MCA21), GeM debarment lists, and public procurement gazettes.
                </p>

                {intelLoading && (
                  <div className="flex items-center justify-center py-6 text-slate-400 space-x-2 text-xs">
                    <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                    <span>Searching public procurement gazettes and MCA databases...</span>
                  </div>
                )}

                {intelData && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 whitespace-pre-line text-slate-200 text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                      {intelData.intelReport}
                    </div>

                    {intelData.groundingSources && intelData.groundingSources.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Verified Grounding Sources:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {intelData.groundingSources.map((source, i) => (
                            <a
                              key={i}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/40 px-2 py-1 rounded border border-sky-800/50 flex items-center space-x-1 hover:underline"
                            >
                              <span>{source.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleToggleFreeze(selectedContractor.name, selectedContractor.activeSanctionFreeze)}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  selectedContractor.activeSanctionFreeze 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {selectedContractor.activeSanctionFreeze ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unfreeze Disbursements</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Freeze Milestone Disbursements</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('WORKS');
                    setSelectedContractor(null);
                  }
                }}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>View Linked Works in Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
