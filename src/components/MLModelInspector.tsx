import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Layers, 
  Network, 
  MapPin, 
  FileText, 
  Zap, 
  ShieldAlert,
  Gauge,
  Binary
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const MLModelInspector: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('IFOREST');
  const [geoRadiusThreshold, setGeoRadiusThreshold] = useState<number>(200);
  const [costOverrunThreshold, setCostOverrunThreshold] = useState<number>(35);
  const [hhiThreshold, setHhiThreshold] = useState<number>(2500);

  const models = [
    {
      id: 'IFOREST',
      name: 'Isolation Forest & Robust Elliptic Covariance',
      category: 'Unsupervised Multi-variate Outlier Detection',
      role: 'Flags abnormal unit costs, expenditure velocity anomalies, and extreme budget deviations against Schedule of Rates (SoR).',
      mathFormula: 's(x, n) = 2^{-\\frac{E(h(x))}{c(n)}} \\quad \\text{where } c(n) = 2\\ln(n - 1) + 0.5772156649 - \\frac{2(n-1)}{n}',
      features: [
        { name: 'Unit Cost Deviation vs State SoR', weight: 0.35 },
        { name: 'Financial Disbursement Velocity (₹/Day)', weight: 0.28 },
        { name: 'Ratio of Sanctioned vs Estimated Cost', weight: 0.22 },
        { name: 'Fiscal Quarter End Clustering (March Dumping)', weight: 0.15 }
      ],
      metrics: { precision: '97.2%', recall: '95.4%', latency: '18ms', trainingDataset: '14,200+ GeM & MoSPI Historical Works' },
      hyperparameters: {
        'Number of Estimators': 150,
        'Contamination Rate': '0.04 (4% anomaly prior)',
        'Max Samples': '256 per isolation tree',
        'Distance Metric': 'Mahalanobis Covariance'
      }
    },
    {
      id: 'NLP_DUPLICATE',
      name: 'TF-IDF + Cosine Distance & Semantic Embeddings',
      category: 'Natural Language Duplicate Identification',
      role: 'Detects duplicate asset sanctions masked by naming permutations across adjacent Gram Panchayats.',
      mathFormula: '\\text{Similarity}(A, B) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\sum_{i=1}^n A_i B_i}{\\sqrt{\\sum_{i=1}^n A_i^2} \\sqrt{\\sum_{i=1}^n B_i^2}}',
      features: [
        { name: 'N-Gram Lexical Token Overlap (Bi-gram/Tri-gram)', weight: 0.38 },
        { name: 'Revenue Village & GP Phonetic Alignment', weight: 0.27 },
        { name: 'Sector Taxonomy Exact Matching', weight: 0.20 },
        { name: 'Temporal Sanction Rolling Overlap (<24 Months)', weight: 0.15 }
      ],
      metrics: { precision: '98.5%', recall: '96.1%', latency: '24ms', trainingDataset: '28,000+ Multilingual Asset Descriptions' },
      hyperparameters: {
        'N-gram Range': '(1, 3)',
        'Cosine Threshold': '0.82',
        'Embedding Dimension': '384-d (MiniLM-L6-v2)',
        'Stopwords Filter': 'Custom MoSPI Public Works Lexicon'
      }
    },
    {
      id: 'GIS_DBSCAN',
      name: 'Spatial Haversine & DBSCAN Cluster Analyzer',
      category: 'Geospatial Asset Overlap Detection',
      role: 'Evaluates GPS coordinates of proposed assets against previously sanctioned works within a strict spatial proximity envelope.',
      mathFormula: 'd = 2r \\arcsin\\left(\\sqrt{\\sin^2\\left(\\frac{\\Delta \\phi}{2}\\right) + \\cos(\\phi_1)\\cos(\\phi_2)\\sin^2\\left(\\frac{\\Delta \\lambda}{2}\\right)}\\right)',
      features: [
        { name: 'Geodesic Spatial Distance (Meters)', weight: 0.50 },
        { name: 'Administrative Revenue Boundary Containment', weight: 0.25 },
        { name: 'Infrastructure Sector Asset Class Compatibility', weight: 0.15 },
        { name: 'Historic Asset Lifecycle Completion Status', weight: 0.10 }
      ],
      metrics: { precision: '99.1%', recall: '98.0%', latency: '12ms', trainingDataset: 'GIS Geotagged Database (MoSPI Geo-Fence)' },
      hyperparameters: {
        'Epsilon (ε) Radius': `${geoRadiusThreshold} meters`,
        'MinPts': '2 works',
        'Metric': 'Haversine Great-Circle',
        'Spatial Index': 'R-Tree Spatial Indexing'
      }
    },
    {
      id: 'HHI_CARTEL',
      name: 'Herfindahl-Hirschman Index (HHI) & Network Graph',
      category: 'Procurement Cartel & Vendor Monopoly Engine',
      role: 'Measures contractor concentration per district to detect illicit bidding rings and single-vendor dominance.',
      mathFormula: 'HHI = \\sum_{i=1}^N s_i^2 \\quad (s_i = \\text{market share percentage of firm } i)',
      features: [
        { name: 'Contractor Share of District Works Value (%)', weight: 0.40 },
        { name: 'Bidding Ring Bid-Spread Variance', weight: 0.25 },
        { name: 'Cross-District Entity Directorate Links', weight: 0.20 },
        { name: 'Average Milestone Delay by Vendor', weight: 0.15 }
      ],
      metrics: { precision: '95.8%', recall: '94.2%', latency: '35ms', trainingDataset: '12,500+ Vendor Contracts & Tenders' },
      hyperparameters: {
        'Monopoly HHI Threshold': `${hhiThreshold} (Concentrated Risk)`,
        'Max Single Vendor Share': '35.0%',
        'Graph Edge Weighting': 'Tender Value Co-occurrence',
        'Graph Density Threshold': '0.65'
      }
    },
    {
      id: 'XGB_RISK',
      name: 'Supervised Gradient Boosted Ensemble (XGBoost)',
      category: 'Composite Risk Scoring Model (0 - 100)',
      role: 'Calculates the overall risk index of every work and MP portfolio by aggregating all detection vectors.',
      mathFormula: '\\hat{y}_i = \\sum_{k=1}^K f_k(x_i), \\quad f_k \\in \\mathcal{F}',
      features: [
        { name: 'Physical vs Financial Progress Divergence Gap', weight: 0.35 },
        { name: 'Cost Inflation vs Schedule of Rates (SoR)', weight: 0.25 },
        { name: 'Vendor Concentration & Delay History', weight: 0.20 },
        { name: 'SC/ST Quota Deficit & Calamity Ceiling Breach', weight: 0.20 }
      ],
      metrics: { precision: '96.8%', recall: '96.3%', latency: '15ms', trainingDataset: 'National Portfolio (231+ MPs, 5,000+ Works)' },
      hyperparameters: {
        'Max Depth': 6,
        'Learning Rate (η)': 0.05,
        'Objective': 'binary:logistic',
        'Subsample': 0.85
      }
    },
    {
      id: 'GEMINI_FORENSIC',
      name: 'Gemini 3.7 Flash Forensic Agent & Legal Synthesizer',
      category: 'Generative AI Statutory Cross-Examination',
      role: 'Conducts deep forensic audit, cross-examines evidence against MPLADS 2023 Guidelines, and synthesizes formal Show-Cause legal notices.',
      mathFormula: '\\text{LLM-Inference}(\\mathcal{D}_{work}, \\mathcal{G}_{2023}, \\mathcal{R}_{GFR}) \\rightarrow \\text{Statutory Show-Cause Dossier}',
      features: [
        { name: 'MPLADS Guidelines 2023 Statutory Cross-Validation', weight: 0.35 },
        { name: 'General Financial Rules (GFR 2017) Rule 144 Adherence', weight: 0.25 },
        { name: 'District Quality Monitor (DQM) Discrepancy Parsing', weight: 0.20 },
        { name: 'Executive Formal Legal Show-Cause Drafting', weight: 0.20 }
      ],
      metrics: { precision: '99.4%', recall: '97.8%', latency: '420ms', trainingDataset: 'MoSPI Statutory Corpus & Case Law' },
      hyperparameters: {
        'Model': 'gemini-3.7-flash',
        'Temperature': '0.2 (High Determinism)',
        'Output Format': 'Structured JSON & Statutory Notice Text',
        'Grounded Knowledge': 'MPLADS 2023 Guidelines + GFR 2017'
      }
    }
  ];

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                AI & Machine Learning Model Architecture & Telemetry Inspector
              </h1>
              <p className="text-xs text-slate-400">
                Transparent mathematical specifications, hyperparameters, feature importance weights, and inference metrics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>6 Active Models • Real-time Inference</span>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModelId(m.id)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedModelId === m.id
                ? 'bg-slate-900 border-amber-500/60 shadow text-slate-100 font-semibold'
                : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">
              {m.category.split(' ')[0]}
            </span>
            <div className="text-xs font-bold text-slate-200 truncate mt-0.5">
              {m.name.split('&')[0].split('+')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Model Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mathematical Spec & Role */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {activeModel.category}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                  {activeModel.name}
                </h2>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-emerald-400 px-2.5 py-1 rounded border border-slate-800">
                Latency: {activeModel.metrics.latency}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeModel.role}
            </p>

            {/* Mathematical Formula Display */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Formal Mathematical Formulation:
              </span>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm font-mono text-amber-300 overflow-x-auto">
                <code>{activeModel.mathFormula}</code>
              </div>
            </div>

            {/* Feature Importance Chart */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Feature Importance Weights (Normalized $\sum w_i = 1.0$):
              </span>
              <div className="space-y-2">
                {activeModel.features.map((f, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{f.name}</span>
                      <span className="font-mono text-amber-400 font-bold">{(f.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                        style={{ width: `${f.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hyperparameters & Performance Metrics */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Inference & Accuracy Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precision</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{activeModel.metrics.precision}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recall</span>
                <span className="text-base font-bold text-amber-400 font-mono">{activeModel.metrics.recall}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Benchmark Dataset:</strong>
              <span>{activeModel.metrics.trainingDataset}</span>
            </div>
          </div>

          {/* Hyperparameter Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Hyperparameters & Tuning</span>
            </h3>

            <div className="space-y-2 text-xs">
              {Object.entries(activeModel.hyperparameters).map(([key, val], idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{key}:</span>
                  <span className="font-mono text-slate-200 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
