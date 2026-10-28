import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NationalOverview } from './components/NationalOverview';
import { AnomalyHub } from './components/AnomalyHub';
import { MPIntelligence } from './components/MPIntelligence';
import { WorksLifecycleTracker } from './components/WorksLifecycleTracker';
import { CalamityMonitoring } from './components/CalamityMonitoring';
import { CSVBatchAuditor } from './components/CSVBatchAuditor';
import { AskMoSPIAssistant } from './components/AskMoSPIAssistant';
import { ForensicAuditModal } from './components/ForensicAuditModal';
import { ExecutiveBriefModal } from './components/ExecutiveBriefModal';
import { ProblemSetArchitecture } from './components/ProblemSetArchitecture';
import { MLModelInspector } from './components/MLModelInspector';
import { DatasetManager } from './components/DatasetManager';
import { ExportDossierModal } from './components/ExportDossierModal';
import { AuditLog } from './components/AuditLog';
import { SpendingTrustLedger } from './components/SpendingTrustLedger';
import { Contractor2DRiskMap } from './components/Contractor2DRiskMap';
import { 
  NationalStats, 
  StateSummary, 
  MPRecord, 
  WorkItem, 
  AnomalyAlert, 
  CalamityRecord, 
  ContractorAnalytics 
} from './types';
import { RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [activeRole, setActiveRole] = useState<string>('NATIONAL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // Sidebar state

  // Core Data States
  const [stats, setStats] = useState<NationalStats | null>(null);
  const [stateSummaries, setStateSummaries] = useState<StateSummary[]>([]);
  const [sectorStats, setSectorStats] = useState<any[]>([]);
  const [mps, setMps] = useState<MPRecord[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [calamities, setCalamities] = useState<CalamityRecord[]>([]);
  const [contractors, setContractors] = useState<ContractorAnalytics[]>([]);

  // Modals & Assistant States
  const [selectedAuditWork, setSelectedAuditWork] = useState<WorkItem | null>(null);
  const [selectedAuditAnomaly, setSelectedAuditAnomaly] = useState<AnomalyAlert | null>(null);
  const [showExecutiveBrief, setShowExecutiveBrief] = useState<boolean>(false);
  const [showExportDossier, setShowExportDossier] = useState<boolean>(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string>('');

  const loadAllData = async () => {
    try {
      const [overviewRes, mpsRes, worksRes, anomaliesRes, calamitiesRes, contractorsRes] = await Promise.all([
        fetch('/api/data/overview').then(r => r.json()),
        fetch('/api/data/mps').then(r => r.json()),
        fetch('/api/data/works').then(r => r.json()),
        fetch('/api/data/anomalies').then(r => r.json()),
        fetch('/api/data/calamities').then(r => r.json()),
        fetch('/api/data/contractors').then(r => r.json())
      ]);

      setStats(overviewRes.stats);
      setStateSummaries(overviewRes.stateSummaries || []);
      setSectorStats(overviewRes.sectorBreakdown || []);
      setMps(mpsRes.data || []);
      setWorks(worksRes.data || []);
      setAnomalies(anomaliesRes.data || []);
      setCalamities(calamitiesRes.data || []);
      setContractors(contractorsRes.data || []);
    } catch (err) {
      console.error('Error fetching initial dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRunBatchScan = async () => {
    setIsScanning(true);
    setScanMessage('Scanning all MPLADS works across India...');
    try {
      const res = await fetch('/api/scan/batch', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScanMessage(`Scan complete: ${data.anomaliesDetectedInBatch} anomalies flagged across national portfolio.`);
        await loadAllData();
      }
    } catch (err) {
      console.error('Batch scan error:', err);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 4000);
    }
  };

  const handleUpdateAnomalyStatus = async (id: string, newStatus: any, notes?: string) => {
    try {
      await fetch(`/api/anomalies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes })
      });
      await loadAllData();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleSelectAnomalyForAudit = (anomaly: AnomalyAlert) => {
    const matchedWork = works.find(w => w.id === anomaly.workId) || null;
    setSelectedAuditAnomaly(anomaly);
    setSelectedAuditWork(matchedWork);
  };

  const handleSelectWorkForAudit = (work: WorkItem) => {
    const matchedAnomaly = anomalies.find(a => a.workId === work.id) || null;
    setSelectedAuditWork(work);
    setSelectedAuditAnomaly(matchedAnomaly);
  };

  const handleAskAIAboutMP = (mpName: string) => {
    setAssistantInitialQuery(`Provide a comprehensive compliance and fund utilization analysis for Hon'ble MP ${mpName}.`);
    setActiveTab('AI_ASSISTANT');
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 space-y-4">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-lg font-bold">Initializing MoSPI MPLADS Intelligence Core...</h2>
          <p className="text-xs text-slate-400 mt-1">Loading ₹33,613 Cr portfolio records & AI fraud detection models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-slate-950 text-slate-100 flex selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* Vertical Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        criticalCount={anomalies.filter(a => a.severity === 'CRITICAL').length}
        onOpenExecutiveBrief={() => setShowExecutiveBrief(true)}
        onOpenExportDossier={() => setShowExportDossier(true)}
        onRunBatchScan={handleRunBatchScan}
        isScanning={isScanning}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      {/* Floating Scan Notification Toast */}
      {scanMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/60 rounded-xl p-4 shadow-2xl flex items-center space-x-3 text-xs text-slate-200 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'OVERVIEW' && (
              <NationalOverview
                stats={stats}
                stateSummaries={stateSummaries}
                sectorStats={sectorStats}
                anomalies={anomalies}
                onSelectAnomaly={handleSelectAnomalyForAudit}
                onNavigateTab={setActiveTab}
                onInspectWork={(workId) => {
                  const w = works.find(item => item.id === workId);
                  if (w) handleSelectWorkForAudit(w);
                }}
              />
            )}

            {activeTab === 'CONTRACTOR_RISK_MAP' && (
              <Contractor2DRiskMap
                contractors={contractors}
                works={works}
                anomalies={anomalies}
                onInspectWork={(workId) => {
                  const w = works.find(item => item.id === workId);
                  if (w) handleSelectWorkForAudit(w);
                }}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'SPENDINGS' && (
              <SpendingTrustLedger
                onInspectWork={(workId) => {
                  const w = works.find(item => item.id === workId);
                  if (w) handleSelectWorkForAudit(w);
                }}
                onNavigateToAnomalies={() => setActiveTab('ANOMALIES')}
              />
            )}

            {activeTab === 'ARCHITECTURE' && (
              <ProblemSetArchitecture
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'ML_MODELS' && (
              <MLModelInspector />
            )}

            {activeTab === 'DATASET_STUDIO' && (
              <DatasetManager
                works={works}
                mps={mps}
                onDataChanged={loadAllData}
                onInspectWork={handleSelectWorkForAudit}
              />
            )}
            
            {activeTab === 'AUDIT_LOG' && (
              <AuditLog />
            )}

            {activeTab === 'ANOMALIES' && (
              <AnomalyHub
                anomalies={anomalies}
                onSelectAnomaly={handleSelectAnomalyForAudit}
                onUpdateStatus={handleUpdateAnomalyStatus}
                onRunBatchScan={handleRunBatchScan}
                isScanning={isScanning}
              />
            )}

            {activeTab === 'MPS' && (
              <MPIntelligence
                mps={mps}
                onSelectMP={(mp) => handleAskAIAboutMP(mp.name)}
                onAskAIAboutMP={handleAskAIAboutMP}
              />
            )}

            {activeTab === 'WORKS' && (
              <WorksLifecycleTracker
                works={works}
                onInspectWork={(workId) => {
                  const w = works.find(item => item.id === workId);
                  if (w) handleSelectWorkForAudit(w);
                }}
                onSelectWorkForAudit={handleSelectWorkForAudit}
              />
            )}

            {activeTab === 'CALAMITY' && (
              <CalamityMonitoring
                calamities={calamities}
                onAskAIAboutCalamity={(calamityName) => {
                  setAssistantInitialQuery(`Analyze the calamity consent disbursements and compliance status for ${calamityName}.`);
                  setActiveTab('AI_ASSISTANT');
                }}
              />
            )}

            {activeTab === 'BATCH_CSV' && (
              <CSVBatchAuditor
                onAnomaliesDetected={loadAllData}
              />
            )}

            {activeTab === 'AI_ASSISTANT' && (
              <AskMoSPIAssistant
                initialQuery={assistantInitialQuery}
              />
            )}
          </div>
        </main>
      </div>

      {/* Deep Forensic Audit Modal */}
      {(selectedAuditWork || selectedAuditAnomaly) && (
        <ForensicAuditModal
          work={selectedAuditWork}
          anomaly={selectedAuditAnomaly}
          onClose={() => {
            setSelectedAuditWork(null);
            setSelectedAuditAnomaly(null);
          }}
        />
      )}

      {/* Executive Brief Modal */}
      {showExecutiveBrief && (
        <ExecutiveBriefModal
          onClose={() => setShowExecutiveBrief(false)}
        />
      )}

      {/* Official Export Audit Dossier Modal */}
      {showExportDossier && (
        <ExportDossierModal
          stats={stats}
          stateSummaries={stateSummaries}
          anomalies={anomalies}
          works={works}
          mps={mps}
          calamities={calamities}
          contractors={contractors}
          onClose={() => setShowExportDossier(false)}
        />
      )}
    </div>
  );
}

export default App;

