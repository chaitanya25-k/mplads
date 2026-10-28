import React, { useState } from 'react';
import { Send, FileText, CheckCircle2, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { AnomalyAlert } from '../types';

interface NudgeAuthorityModalProps {
  anomaly: AnomalyAlert;
  onClose: () => void;
}

export const NudgeAuthorityModal: React.FC<NudgeAuthorityModalProps> = ({ anomaly, onClose }) => {
  const [step, setStep] = useState(1);
  const [nudgeStatus, setNudgeStatus] = useState<string>('DRAFT'); // DRAFT, SENT, IN_PROGRESS
  const [reportNotes, setReportNotes] = useState(`Subject: URGENT - High Risk Anomaly Detected (${anomaly.workCode})

To the District Magistrate / State Nodal Authority,
The AI Intelligence Core has flagged a severe irregularity in the ongoing project: ${anomaly.title}. 
Risk Score: ${anomaly.riskScore}/100.

Summary: ${anomaly.summary}
Clause Violated: ${anomaly.evidence.statutoryRuleClause}

Please initiate immediate review and field inspection.
`);

  const handleSendReport = () => {
    setNudgeStatus('SENT');
    setStep(2);
    // Simulate progressing status
    setTimeout(() => {
      setNudgeStatus('IN_PROGRESS');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-50">Nudge Higher Authorities & Report</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {step === 1 ? (
            <>
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-amber-400 mb-1">Create Escalation Report</h3>
                <p className="text-xs text-amber-200/70">Review the AI-generated draft report below. You can edit it before sending it directly to the State Nodal Authority (SNA) and District Magistrate.</p>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-200 block">Report Draft</label>
                <textarea
                  className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSendReport}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Report to Authorities</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              {nudgeStatus === 'SENT' ? (
                <div className="animate-pulse flex flex-col items-center space-y-4">
                  <Send className="w-12 h-12 text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-100">Report Sent Successfully</h3>
                  <p className="text-slate-400">The notification has been dispatched to higher authorities.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  <h3 className="text-lg font-bold text-emerald-300">Authority Notified & Progressing</h3>
                  <p className="text-slate-400 max-w-md">
                    The District Magistrate has acknowledged the alert. The work code <strong>{anomaly.workCode}</strong> has been placed under administrative review.
                  </p>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg w-full max-w-md mt-4 text-left">
                    <p className="text-xs font-semibold text-slate-500 mb-2">PROGRESS TRACKER</p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-4 h-4" /> <span>Report dispatched via SNA Network</span>
                      </div>
                      <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-4 h-4" /> <span>Received by District Magistrate Office</span>
                      </div>
                      <div className="flex items-center space-x-2 text-amber-400 text-xs animate-pulse">
                        <ShieldAlert className="w-4 h-4" /> <span>Under active review (Pending Field Inspection)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
