import React, { useState } from 'react';
import { UploadCloud, Bot, FileText, AlertTriangle, CheckCircle2, TrendingUp, BarChart } from 'lucide-react';
import Markdown from 'react-markdown';

export const AICSVAnalyzer: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const analyzeWithAI = async () => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: fileContent, fileName })
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAnalysisResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze CSV');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-100 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-indigo-400" />
          AI Dataset Analyzer
        </h3>
        <p className="text-sm text-slate-400 mt-1">Upload a CSV file and let the AI automatically generate reports, graphs, and flag anomalies. Non-MPLADS data will be detected and rejected.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
        <label className="flex-1 cursor-pointer w-full">
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-lg p-6 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-300">
              {fileName ? fileName : 'Click to upload CSV file'}
            </span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </div>
        </label>
        
        <button
          onClick={analyzeWithAI}
          disabled={!fileContent || isAnalyzing}
          className={`shrink-0 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-bold transition-all w-full md:w-auto h-[116px] ${
            !fileContent || isAnalyzing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg shadow-indigo-900/20'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <Bot className="w-6 h-6 animate-pulse mb-2 text-indigo-300" />
              <span>Analyzing AI...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <BarChart className="w-6 h-6 mb-2" />
              <span>Generate AI Report</span>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-500/50 rounded-lg p-4 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Analysis Failed</span>
            {error}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {!analysisResult.isMpladsData ? (
            <div className="bg-amber-950/30 border border-amber-500/50 rounded-lg p-5 flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-base font-bold text-amber-400 mb-1">Invalid Dataset Detected</h4>
                <p className="text-sm text-amber-200/80">The uploaded file <strong>{fileName}</strong> does not appear to contain MPLADS related data. Please ensure you upload official MoSPI, District Authority, or works implementation datasets.</p>
                
                <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 font-mono">
                  <strong>AI Explanation:</strong> {analysisResult.explanation}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Summary */}
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Executive Summary
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Data Visualization / Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Metrics Discovered</h4>
                  <ul className="space-y-3">
                    {analysisResult.metrics?.map((metric: any, i: number) => (
                      <li key={i} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                        <span className="text-slate-400">{metric.label}</span>
                        <span className="font-bold text-slate-200">{metric.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Anomalies Flagged
                  </h4>
                  {analysisResult.anomalies?.length > 0 ? (
                    <div className="space-y-3">
                      {analysisResult.anomalies.map((anm: any, i: number) => (
                        <div key={i} className="bg-rose-950/10 border border-rose-900/30 p-2.5 rounded text-xs">
                          <strong className="text-rose-300 block mb-1">{anm.title}</strong>
                          <span className="text-slate-400">{anm.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500/50" />
                      No significant anomalies detected in this batch.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed Markdown Report */}
              {analysisResult.detailedReport && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Detailed AI Analysis Report</h4>
                  <div className="markdown-body text-sm text-slate-300 max-w-none space-y-4 prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-a:text-indigo-400">
                    <Markdown>{analysisResult.detailedReport}</Markdown>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
