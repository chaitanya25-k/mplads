import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Download, 
  FileText, 
  IndianRupee, 
  Building2, 
  MapPin, 
  RefreshCw,
  Scale
} from 'lucide-react';
import { WorkItem, AnomalyAlert, DeepAuditResponse } from '../types';

interface ForensicAuditModalProps {
  work: WorkItem | null;
  anomaly: AnomalyAlert | null;
  onClose: () => void;
}

export const ForensicAuditModal: React.FC<ForensicAuditModalProps> = ({
  work,
  anomaly,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [auditData, setAuditData] = useState<DeepAuditResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'FINANCIAL' | 'NOTICE'>('FINDINGS');

  const fetchDeepAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/deep-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: work?.id || anomaly?.workId,
          workData: work,
          mpData: { name: work?.mpName || anomaly?.mpName }
        })
      });
      const data = await response.json();
      setAuditData(data);
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeepAudit();
  }, [work, anomaly]);

  const copyNotice = () => {
    if (auditData?.draftNoticeText) {
      navigator.clipboard.writeText(auditData.draftNoticeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  Gemini 3.7 AI Forensic Engine
                </span>
                <span className="text-xs text-slate-400">
                  MoSPI DIID Automated Inspection
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-0.5">
                Deep Forensic Audit: {work?.workCode || anomaly?.workCode || 'MPLADS Transaction'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-100">Running Gemini AI Forensic Analysis...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Cross-referencing schedule of rates, geo-spatial proximity, contractor bidding concentration & MPLADS 2023 guidelines.
                </p>
              </div>
            </div>
          ) : auditData ? (
            <>
              {/* Verdict & Score Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">Forensic Assessment Verdict:</span>
                    <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                      auditData.verdict === 'HIGH_RISK_FRAUD'
                        ? 'bg-rose-600 text-slate-50'
                        : auditData.verdict === 'PROCEDURAL_IRREGULARITY'
                        ? 'bg-amber-600 text-slate-50'
                        : 'bg-emerald-600 text-slate-50'
                    }`}>
                      {auditData.verdict.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {auditData.executiveSummary}
                  </p>
                </div>

                <div className="text-center bg-slate-900 p-4 rounded-xl border border-slate-800 shrink-0 min-w-[140px]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    AI Risk Index
                  </span>
                  <div className={`text-3xl font-black mt-1 ${
                    auditData.riskScore >= 85 ? 'text-rose-400' : auditData.riskScore >= 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {auditData.riskScore}<span className="text-sm font-medium text-slate-500">/100</span>
                  </div>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('FINDINGS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'FINDINGS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Key Findings & Clause Violations
                </button>
                <button
                  onClick={() => setActiveTab('FINANCIAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'FINANCIAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Financial & Contractor Risk
                </button>
                <button
                  onClick={() => setActiveTab('NOTICE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'NOTICE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Draft Statutory Show-Cause Notice
                </button>
              </div>

              {/* Tab 1: Key Findings & Guideline Violations */}
              {activeTab === 'FINDINGS' && (
                <div className="space-y-4">
                  {/* Key Findings */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Forensic Findings
                    </h4>
                    <div className="space-y-2">
                      {auditData.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-200">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Violations */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Regulatory Clause Breaches (MPLADS Guidelines 2023)
                    </h4>
                    <div className="space-y-2">
                      {auditData.guidelineViolations.map((v, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 font-mono">{v.clause}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.severity === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {v.severity} Severity
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1">{v.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Financial Discrepancy & Vendor Concentration */}
              {activeTab === 'FINANCIAL' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      <span>Financial Exposure & Discrepancy Breakdown</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {auditData.financialDiscrepancyAnalysis}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>Contractor Monopoly & Collusion Assessment</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {auditData.contractorRiskAssessment}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Recommended Corrective Interventions</span>
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {auditData.recommendedActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 3: Draft Show-Cause Notice */}
              {activeTab === 'NOTICE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Statutory show-cause notice generated under powers of District Authority (MPLADS)
                    </span>
                    <button
                      onClick={copyNotice}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Notice Text'}</span>
                    </button>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {auditData.draftNoticeText}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Unable to load forensic report. Please retry.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Powered by MoSPI Data Informatics & Innovation Division (DIID)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
