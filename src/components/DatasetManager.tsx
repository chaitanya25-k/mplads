import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Filter,
  Layers,
  Save,
  X,
  IndianRupee
} from 'lucide-react';
import { WorkItem, MPRecord, AnomalyAlert } from '../types';
import { AICSVAnalyzer } from './AI_CSV_Analyzer';

interface DatasetManagerProps {
  works: WorkItem[];
  mps: MPRecord[];
  onDataChanged: () => void;
  onInspectWork: (work: WorkItem) => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  works,
  mps,
  onDataChanged,
  onInspectWork
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'WORKS' | 'MPS' | 'UPLOAD'>('WORKS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // CSV Upload State
  const [csvText, setCsvText] = useState<string>('');
  const [uploadDatasetType, setUploadDatasetType] = useState<'WORKS' | 'MP_ALLOCATION'>('WORKS');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{ ingested: number; anomalies: number } | null>(null);

  // Edit / Add Modal States
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [isAddingWork, setIsAddingWork] = useState<boolean>(false);
  const [isAddingMP, setIsAddingMP] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Form State for Add Work
  const [newWorkForm, setNewWorkForm] = useState({
    title: '',
    mpName: 'Hon\'ble MP',
    state: 'Maharashtra',
    district: 'Pune',
    sector: 'Community Assets',
    estimatedCost: 2500000,
    sanctionedCost: 3500000,
    expenditure: 3500000,
    physicalProgress: 15,
    contractorName: 'Local Infrastructure Ltd',
    implementingAgency: 'DRDA Pune',
    geoLatitude: 18.5204,
    geoLongitude: 73.8567,
    isScStArea: false
  });

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Sample CSV generators for download
  const downloadSampleWorksCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,Sr. No.,Work Title,State,District,Sanctioned Cost,Expenditure,Physical Progress,Sector,Contractor
1,Construction of CC Road in Manchar GP,Maharashtra,Pune,3500000,3500000,10,Roads & Bridges,Vanguard Infra
2,Installation of 10 Solar High Mast Lights,Punjab,Ludhiana,4500000,4500000,100,Electricity & Renewable Energy,Surya Shakti
3,Renovation of Primary School Building,Uttar Pradesh,Lucknow,2400000,1200000,50,Education,Apex Civil Corp
4,Construction of Community Center Ward 4,Maharashtra,Pune,3600000,1800000,15,Community Assets,Vanguard Infra`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MoSPI_MPLADS_Works_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCSV = async () => {
    if (!csvText.trim()) return;
    setIsUploading(true);
    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: csvText,
          datasetType: uploadDatasetType
        })
      });
      const data = await response.json();
      if (data.success) {
        setUploadResult({
          ingested: data.recordsIngested,
          anomalies: data.anomaliesDetectedInBatch
        });
        showToast(`Successfully ingested ${data.recordsIngested} records (${data.anomaliesDetectedInBatch} anomalies flagged).`);
        onDataChanged();
        setCsvText('');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingWork) {
        // Update existing
        const res = await fetch('/api/works/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingWork)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Work ${editingWork.workCode} updated & re-scanned.`);
          setEditingWork(null);
          onDataChanged();
        }
      } else if (isAddingWork) {
        // Add new
        const res = await fetch('/api/works/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWorkForm)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`New work added. Anomaly scan logged ${data.anomaliesDetected} flags.`);
          setIsAddingWork(false);
          onDataChanged();
        }
      }
    } catch (err) {
      console.error('Save work error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this work item from the live portfolio?")) return;
    try {
      const res = await fetch(`/api/works/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Work record deleted.');
        onDataChanged();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleResetBaseline = async () => {
    if (!window.confirm("Reset all works, MPs, and anomalies to official MoSPI baseline?")) return;
    try {
      const res = await fetch('/api/data/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('System reset to official MoSPI baseline records.');
        onDataChanged();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Filtered Works
  const filteredWorks = works.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.workCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.contractorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {statusNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-emerald-500/60 rounded-xl p-4 shadow-2xl flex items-center space-x-3 text-xs text-slate-100 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Dataset Management, Upload & Real-Time Manipulation Studio
              </h1>
              <p className="text-xs text-slate-400">
                Upload CSV datasets, add/edit works inline, test custom anomaly scenarios, and trigger real-time recalculations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={downloadSampleWorksCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>

          <button
            onClick={() => setIsAddingWork(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work Item</span>
          </button>

          <button
            onClick={handleResetBaseline}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Reset dataset back to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('WORKS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'WORKS'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          District Works Data Grid ({works.length})
        </button>
        <button
          onClick={() => setActiveSubTab('UPLOAD')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'UPLOAD'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CSV Ingestion & Batch Parser
        </button>
      </div>

      {/* Tab 1: Works Grid & Inline Manipulation */}
      {activeSubTab === 'WORKS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, code, state, or vendor..."
                className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredWorks.length} of {works.length} records
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Work Code</th>
                  <th className="p-3">Title & Location</th>
                  <th className="p-3">Sanction Cost</th>
                  <th className="p-3">Expenditure</th>
                  <th className="p-3">Progress (Phy / Fin)</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Status / Anomaly</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-amber-400 font-bold">
                      {work.workCode}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-100 line-clamp-1">{work.title}</div>
                      <div className="text-[11px] text-slate-400">{work.district}, {work.state}</div>
                    </td>
                    <td className="p-3 font-mono">
                      ₹{(work.sanctionedCost / 100000).toFixed(2)} L
                    </td>
                    <td className="p-3 font-mono">
                      ₹{(work.expenditure / 100000).toFixed(2)} L
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400 font-bold">{work.physicalProgress}% Phy</span>
                        <span className="text-slate-600">/</span>
                        <span className="font-mono text-amber-400 font-bold">{work.financialProgress}% Fin</span>
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 line-clamp-1">
                      {work.contractorName}
                    </td>
                    <td className="p-3">
                      {work.hasAnomalies ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          RED FLAG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setEditingWork(work)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWork(work.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: CSV Upload Form */}
      {activeSubTab === 'UPLOAD' && (
        <div className="space-y-6">
          <AICSVAnalyzer />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
              
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Paste Raw CSV Records or Upload File
              </label>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs ml-4 border border-slate-700">
                Browse File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setCsvText(event.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>

              <select
                value={uploadDatasetType}
                onChange={(e) => setUploadDatasetType(e.target.value as any)}
                className="bg-slate-950 text-xs text-slate-200 rounded px-2.5 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="WORKS">District Works Dataset</option>
                <option value="MP_ALLOCATION">MP Allocation Dataset</option>
              </select>
            </div>

            <textarea
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Sr. No., Work Title, State, District, Sanctioned Cost, Expenditure, Physical Progress..."
              className="w-full bg-slate-950 text-xs font-mono text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Supports bulk pasting from MS Excel, Google Sheets, or DigiGov exports
              </span>
              <button
                onClick={handleUploadCSV}
                disabled={isUploading || !csvText.trim()}
                className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow ${
                  isUploading || !csvText.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Auditing & Ingesting...' : 'Ingest & Scan Anomalies'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Ingestion Rules
            </h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant Spatial & NLP Duplicate Cross-Scan</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Physical vs Financial Milestone Audit</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cost Inflation vs Benchmark Schedule of Rates</span>
              </li>
            </ul>

            {uploadResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                <div className="font-bold text-slate-100 flex items-center justify-between">
                  <span>Batch Ingestion Summary</span>
                  <span className="text-emerald-400">✓ Complete</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Records Added:</span>
                  <strong className="text-slate-100">{uploadResult.ingested}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Anomalies Flagged:</span>
                  <strong className="text-rose-400 font-bold">{uploadResult.anomalies}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Edit Work Item Modal */}
      {editingWork && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Edit Work Item: {editingWork.workCode}
                </h3>
              </div>
              <button 
                onClick={() => setEditingWork(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-medium">Work Title</label>
                  <input
                    type="text"
                    value={editingWork.title}
                    onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Sanctioned Cost (₹)</label>
                  <input
                    type="number"
                    value={editingWork.sanctionedCost}
                    onChange={(e) => setEditingWork({ ...editingWork, sanctionedCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Expenditure Disbursed (₹)</label>
                  <input
                    type="number"
                    value={editingWork.expenditure}
                    onChange={(e) => setEditingWork({ ...editingWork, expenditure: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Physical Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingWork.physicalProgress}
                    onChange={(e) => setEditingWork({ ...editingWork, physicalProgress: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Contractor / Agency Name</label>
                  <input
                    type="text"
                    value={editingWork.contractorName}
                    onChange={(e) => setEditingWork({ ...editingWork, contractorName: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSaving ? 'Saving & Re-scanning...' : 'Save & Re-Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Work Item Modal */}
      {isAddingWork && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Add New MPLADS Sanction Record
                </h3>
              </div>
              <button 
                onClick={() => setIsAddingWork(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-medium">Work Title</label>
                  <input
                    type="text"
                    value={newWorkForm.title}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, title: e.target.value })}
                    placeholder="e.g. Construction of Community Hall, Manchar GP"
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">State</label>
                  <input
                    type="text"
                    value={newWorkForm.state}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, state: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">District</label>
                  <input
                    type="text"
                    value={newWorkForm.district}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, district: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Sanctioned Cost (₹)</label>
                  <input
                    type="number"
                    value={newWorkForm.sanctionedCost}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, sanctionedCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Expenditure (₹)</label>
                  <input
                    type="number"
                    value={newWorkForm.expenditure}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, expenditure: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Physical Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newWorkForm.physicalProgress}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, physicalProgress: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Contractor Entity</label>
                  <input
                    type="text"
                    value={newWorkForm.contractorName}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, contractorName: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingWork(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  {isSaving ? 'Scanning & Adding...' : 'Add Record & Run AI Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
