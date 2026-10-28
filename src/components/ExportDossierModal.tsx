import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Building2,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { NationalStats, StateSummary, AnomalyAlert, WorkItem, MPRecord, CalamityRecord, ContractorAnalytics } from '../types';

interface ExportDossierModalProps {
  stats: NationalStats;
  stateSummaries: StateSummary[];
  anomalies: AnomalyAlert[];
  works: WorkItem[];
  mps: MPRecord[];
  calamities: CalamityRecord[];
  contractors: ContractorAnalytics[];
  onClose: () => void;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  stats,
  stateSummaries,
  anomalies,
  works,
  mps,
  calamities,
  contractors,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL');
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportAnomaliesCSV = () => {
    const headers = ["Anomaly ID", "Work Code", "Work Title", "MP Name", "State", "District", "Category", "Severity", "Risk Score", "Status", "Statutory Clause"];
    const rows = anomalies.map(a => [
      `"${a.id}"`,
      `"${a.workCode}"`,
      `"${a.workTitle.replace(/"/g, '""')}"`,
      `"${a.mpName}"`,
      `"${a.state}"`,
      `"${a.district}"`,
      `"${a.category}"`,
      `"${a.severity}"`,
      a.riskScore,
      `"${a.status}"`,
      `"${(a.evidence?.statutoryRuleClause || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoSPI_MPLADS_Anomalies_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWorksCSV = () => {
    const headers = ["Work Code", "Title", "MP Name", "State", "District", "Sector", "Sanctioned Cost", "Expenditure", "Physical %", "Financial %", "Contractor", "Status", "Has Anomalies"];
    const rows = works.map(w => [
      `"${w.workCode}"`,
      `"${w.title.replace(/"/g, '""')}"`,
      `"${w.mpName}"`,
      `"${w.state}"`,
      `"${w.district}"`,
      `"${w.sector}"`,
      w.sanctionedCost,
      w.expenditure,
      w.physicalProgress,
      w.financialProgress,
      `"${w.contractorName}"`,
      `"${w.status}"`,
      w.hasAnomalies ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoSPI_MPLADS_Works_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportObject = {
      metadata: {
        system: "MoSPI MPLADS AI Anomaly & Fraud Intelligence System",
        generatedAt: new Date().toISOString(),
        version: "2.4-Enterprise"
      },
      stats,
      criticalAnomaliesCount: criticalAnomalies.length,
      anomalies,
      stateSummaries,
      worksCount: works.length,
      works,
      contractors
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `MoSPI_MPLADS_Audit_Dossier_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lock className="w-4 h-4" />
            <span>CONFIDENTIAL • STATUTORY AUDIT DOSSIER EXPORT</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportAnomaliesCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Anomalies CSV</span>
            </button>

            <button
              onClick={handleExportWorksCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Works CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON Dossier</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Canvas */}
        <div className="overflow-y-auto pr-2 space-y-6 text-slate-200 font-mono text-xs">
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-amber-500/50 pb-6 space-y-2">
            <div className="inline-block p-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xl font-bold">
              🏛️
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              GOVERNMENT OF INDIA • MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
            </div>
            <div className="text-sm font-bold text-slate-100">
              DATA INFORMATICS & INNOVATION DIVISION (DIID) • SARDAR PATEL BHAWAN, NEW DELHI
            </div>
            <div className="text-xs text-amber-400 font-bold tracking-wide">
              MEMBERS OF PARLIAMENT LOCAL AREA DEVELOPMENT SCHEME (MPLADS)
            </div>
            <h1 className="text-base font-black text-slate-50 underline decoration-amber-500 underline-offset-4">
              EXECUTIVE STATUTORY AUDIT & AI ANOMALY FORENSIC DOSSIER
            </h1>
            <div className="text-[11px] text-slate-400 pt-1">
              Doc Ref: MoSPI/DIID/MPLADS-AI/AUD-2024-25/094 • Date of Generation: {dateStr}
            </div>
          </div>

          {/* Section 1: Executive Macro Utilization */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              1. Macro Portfolio Envelope & Fund Utilization Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Statutory Envelope</span>
                <strong className="text-slate-100 text-sm">₹{(stats.totalAllocatedLimit / 10000000).toFixed(2)} Cr</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Active Fund Utilization</span>
                <strong className="text-emerald-400 text-sm">{stats.averageUtilizationRate.toFixed(1)}%</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Critical Red Flags</span>
                <strong className="text-rose-400 text-sm">{stats.criticalRedFlags} Active</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">High-Risk Exposure</span>
                <strong className="text-amber-400 text-sm">₹{(stats.highRiskExposureAmount / 10000000).toFixed(2)} Cr</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Critical Red Flag Triage Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              2. Critical Integrity & Fraud Alerts (Automated AI Detection)
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Work Code</th>
                    <th className="p-2.5">Title & District</th>
                    <th className="p-2.5">Anomaly Category</th>
                    <th className="p-2.5">Risk</th>
                    <th className="p-2.5">Statutory Clause</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                  {criticalAnomalies.map((anom) => (
                    <tr key={anom.id}>
                      <td className="p-2.5 font-bold text-amber-400">{anom.workCode}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-200">{anom.workTitle}</div>
                        <div className="text-[10px] text-slate-500">{anom.district}, {anom.state}</div>
                      </td>
                      <td className="p-2.5 text-rose-300 font-semibold">{anom.category}</td>
                      <td className="p-2.5 font-bold text-rose-400">{anom.riskScore}/100</td>
                      <td className="p-2.5 text-[10px] text-slate-400 max-w-xs truncate">
                        {anom.evidence?.statutoryRuleClause || 'MPLADS Guidelines 2023'}
                      </td>
                      <td className="p-2.5 text-[10px] font-bold text-amber-300">
                        {anom.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Statutory Administrative Directives */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              3. Immediate Statutory Directives Issued under MPLADS Guidelines 2023
            </h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Directive 01 (Disbursement Freezes):</strong> District Magistrates / District Authorities in Pune and Lucknow are directed to immediately invoke Para 4.8 and withhold pending treasury disbursements against Work Codes <code>MPLADS/2024-25/088</code> and <code>MPLADS/2024-25/042</code> pending joint physical verification.
              </p>
              <p>
                <strong>Directive 02 (Contractor Monopoly Audit):</strong> Implementing Agencies in Ludhiana District must submit rate analysis justification for solar high mast tenders exceeding Schedule of Rates benchmarks by &gt;35%.
              </p>
              <p>
                <strong>Directive 03 (SNA SPARSH Reconciliation):</strong> All State Nodal Authorities (SNAs) must confirm 100% geo-tag verification proofs prior to issuing final Utilization Certificates (UCs).
              </p>
            </div>
          </div>

          {/* Section 4: Signature / Sign-off */}
          <div className="pt-6 border-t border-slate-800 flex justify-between items-end text-[11px] text-slate-400">
            <div>
              <div>Generated via AI Studio Enterprise Core v2.4</div>
              <div>MoSPI Data Informatics & Innovation Division</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-200">Authorized Signatory (MPLADS Apex Division)</div>
              <div>Ministry of Statistics & Programme Implementation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
