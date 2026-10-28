import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Sparkles, 
  Copy, 
  Printer, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

interface ExecutiveBriefModalProps {
  onClose: () => void;
}

export const ExecutiveBriefModal: React.FC<ExecutiveBriefModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportText, setReportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [targetAudience, setTargetAudience] = useState<string>("Hon'ble Union Minister & Secretary, MoSPI");

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/executive-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAudience })
      });
      const data = await response.json();
      setReportText(data.report || '');
    } catch (err) {
      console.error('Error generating executive brief:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [targetAudience]);

  const copyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MoSPI MPLADS Executive Audit Briefing</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1, h2, h3 { color: #0f172a; }
              pre { font-family: inherit; white-space: pre-wrap; font-size: 14px; }
            </style>
          </head>
          <body>
            <pre>${reportText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                MoSPI Apex Executive Audit Briefing
              </h2>
              <p className="text-xs text-slate-400">
                Formal strategic dossier for MoSPI Leadership & Parliamentary Standing Committee
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Regenerate Report"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-100">Synthesizing Ministerial Intelligence Brief...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Aggregating ₹33,613 Cr portfolio metrics, high-risk integrity anomalies, vendor cartel indices, and statutory guidelines compliance.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {reportText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={copyText}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Dossier'}</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
