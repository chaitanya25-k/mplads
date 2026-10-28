import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileText, 
  Layers,
  RefreshCw,
  Info
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface CSVBatchAuditorProps {
  onAnomaliesDetected: () => void;
}

export const CSVBatchAuditor: React.FC<CSVBatchAuditorProps> = ({ onAnomaliesDetected }) => {
  const [csvText, setCsvText] = useState<string>('');
  const [datasetType, setDatasetType] = useState<'WORKS' | 'MP_ALLOCATION'>('WORKS');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{ ingested: number; anomalies: number; details: AnomalyAlert[] } | null>(null);

  const sampleWorksCSV = `Sr. No.,Work Title,State,District,Sanctioned Cost,Expenditure,Physical Progress
1,Construction of CC Road in Ward 4,Maharashtra,Pune,3500000,3500000,10
2,Installation of 10 Solar Lights,Punjab,Ludhiana,4500000,4500000,100
3,Renovation of Primary School Building,Uttar Pradesh,Lucknow,2400000,1200000,50
4,Construction of CC Road in Ward 4,Maharashtra,Pune,3600000,1800000,15`;

  const loadSample = () => {
    setCsvText(sampleWorksCSV);
    setDatasetType('WORKS');
  };

  const handleUploadAndScan = async () => {
    if (!csvText.trim()) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: csvText,
          datasetType
        })
      });
      const data = await response.json();
      if (data.success) {
        setResult({
          ingested: data.recordsIngested,
          anomalies: data.anomaliesDetectedInBatch,
          details: data.anomalies || []
        });
        onAnomaliesDetected();
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Custom Dataset Ingestion & Automated AI Batch Auditor
              </h1>
              <p className="text-xs text-slate-400">
                Upload CSV exports from MoSPI digigov or District Portals for immediate multi-vector anomaly scanning
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          Load Test Anomaly CSV
        </button>
      </div>

      {/* Upload & Ingestion Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>Paste CSV Content or Upload File</span>
            </label>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Format:</span>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value as any)}
                className="bg-slate-950 text-slate-200 rounded px-2.5 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="WORKS">District Works Dataset</option>
                <option value="MP_ALLOCATION">MP Allocation Dataset</option>
              </select>
            </div>
          </div>

          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Sr. No., Work Title, State, District, Sanctioned Cost, Expenditure, Physical Progress..."
            className="w-full bg-slate-950 text-xs font-mono text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Supports UTF-8 CSV exports from MoSPI DigiGov / SNA SPARSH
            </span>
            <button
              onClick={handleUploadAndScan}
              disabled={isProcessing || !csvText.trim()}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow ${
                isProcessing || !csvText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Auditing Batch...' : 'Run Automated Anomaly Audit'}</span>
            </button>
          </div>
        </div>

        {/* Info & Results Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Automated Rules Verified</span>
            </h3>
            <ul className="space-y-2 mt-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Duplicate Work:</strong> Flags identical work titles within 200m in same GP.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Physical-Financial Divergence:</strong> Flags &gt;80% payouts with &lt;20% physical progress.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cost Inflation:</strong> Flags costs 35%+ higher than standard Schedule of Rates.</span>
              </li>
            </ul>
          </div>

          {result && (
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="font-bold text-slate-100 flex items-center justify-between">
                <span>Batch Audit Results</span>
                <span className="text-emerald-400">✓ Scan Complete</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Records Ingested:</span>
                <strong className="text-slate-100">{result.ingested}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Anomalies Flagged:</span>
                <strong className="text-rose-400 font-bold">{result.anomalies}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
