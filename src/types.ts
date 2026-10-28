export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkStatus = 
  | 'RECOMMENDED' 
  | 'ADMIN_SANCTIONED' 
  | 'TECHNICAL_SANCTION' 
  | 'TENDER_ISSUED' 
  | 'WORK_ORDERED' 
  | 'UNDER_EXECUTION' 
  | 'MILESTONE_PAID' 
  | 'PHYSICAL_COMPLETED' 
  | 'UC_SUBMITTED' 
  | 'STALLED' 
  | 'REJECTED';

export type SectorCategory = 
  | 'Drinking Water' 
  | 'Education' 
  | 'Sanitation & Health' 
  | 'Roads & Bridges' 
  | 'Rural Infrastructure' 
  | 'Electricity & Renewable Energy' 
  | 'Community Assets' 
  | 'Sports & Culture' 
  | 'Calamity Relief' 
  | 'Irrigation';

export type AnomalyCategory = 
  | 'DUPLICATE_WORK' 
  | 'COST_OVERRUN' 
  | 'PHYSICAL_FINANCIAL_DIVERGENCE' 
  | 'VENDOR_MONOPOLY' 
  | 'YEAR_END_DUMPING' 
  | 'SANCTION_LATENCY' 
  | 'SC_ST_QUOTA_DEFICIT' 
  | 'CALAMITY_CEILING_BREACH';

export interface MPRecord {
  srNo: number;
  state: string;
  name: string;
  tenure: string;
  type: 'Elected MP' | 'Nominated MP';
  allocatedAmount: number;
  sanctionedAmount: number;
  expenditureAmount: number;
  unspentBalance: number;
  utilizationRate: number; // percentage
  worksRecommended: number;
  worksSanctioned: number;
  worksCompleted: number;
  riskScore: number; // 0 - 100
  anomalyCount: number;
  scPercentage: number;
  stPercentage: number;
}

export interface CalamityRecord {
  srNo: number;
  calamityType: 'National Calamity' | 'State Calamity';
  calamityName: string;
  mpName: string;
  dateOfConsent: string;
  consentAmount: number;
  stateAffected: string;
  status: 'Disbursed' | 'Under Transfer' | 'Utilization Pending' | 'Utilized';
  utilizationPercent: number;
}

export interface WorkItem {
  id: string;
  workCode: string;
  title: string;
  description: string;
  mpName: string;
  state: string;
  district: string;
  blockPanchayat: string;
  sector: SectorCategory;
  estimatedCost: number;
  sanctionedCost: number;
  expenditure: number;
  physicalProgress: number; // 0 to 100
  financialProgress: number; // 0 to 100
  status: WorkStatus;
  implementingAgency: string;
  contractorName: string;
  recommendationDate: string;
  sanctionDate: string;
  workOrderDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  geoLatitude: number;
  geoLongitude: number;
  isScStArea: boolean;
  scStType?: 'SC' | 'ST' | 'General';
  hasAnomalies: boolean;
  anomalyIds: string[];
  photoProofUrl?: string;
  inspectionStatus: 'Pending' | 'Verified' | 'Discrepancy Found' | 'Not Required';
}

export interface AnomalyAlert {
  id: string;
  workId: string;
  workCode: string;
  workTitle: string;
  mpName: string;
  state: string;
  district: string;
  category: AnomalyCategory;
  severity: RiskLevel;
  riskScore: number; // 0-100
  title: string;
  detectedOn: string;
  summary: string;
  evidence: {
    expectedValue?: string | number;
    actualValue?: string | number;
    deviationPercentage?: number;
    relatedWorkId?: string;
    relatedWorkTitle?: string;
    contractorShare?: number;
    daysDelayed?: number;
    statutoryRuleClause: string;
  };
  status: 'ACTIVE_RED_FLAG' | 'UNDER_INVESTIGATION' | 'FIELD_INSPECTION_ORDERED' | 'DISBURSEMENT_FROZEN' | 'RESOLVED_JUSTIFIED' | 'RECOVERY_INITIATED';
  actionTakenNotes?: string;
  aiSuggestedAction: string;
}

export interface ContractorAnalytics {
  name: string;
  district: string;
  state: string;
  totalWorksAllocated: number; // Frequency of work
  totalValue: number;
  districtWorkSharePercent: number;
  averageDelayDays: number;
  anomalyCount: number;
  averageAnomalySeverity?: number; // 0 to 100 average anomaly severity score
  computedSeverity?: number;
  quadrant?: 'Q1_DANGER' | 'Q2_ISOLATED' | 'Q3_CONCENTRATION' | 'Q4_COMPLIANT' | string;
  riskRating: RiskLevel;
  isBlacklistedFlag: boolean;
  category?: string;
  panNumber?: string;
  gstin?: string;
  activeSanctionFreeze?: boolean;
  statutoryViolations?: string[];
  recentWorks?: string[];
  lastAuditDate?: string;
}

export interface DistrictMetric {
  districtName: string;
  stateName: string;
  totalAllocated: number;
  totalExpenditure: number;
  utilizationRate: number;
  totalWorks: number;
  completedWorks: number;
  stalledWorks: number;
  activeAnomalies: number;
  highRiskWorksValue: number;
  hhiIndex: number; // Herfindahl-Hirschman Index for contractor monopoly
}

export interface StateSummary {
  state: string;
  mpCount: number;
  totalAllocated: number;
  totalExpenditure: number;
  utilizationRate: number;
  totalWorks: number;
  activeAnomalies: number;
  riskLevel: RiskLevel;
}

export interface NationalStats {
  totalAllocatedLimit: number;
  totalExpenditure: number;
  averageUtilizationRate: number;
  totalMPs: number;
  totalWorks: number;
  completedWorks: number;
  underExecutionWorks: number;
  stalledWorks: number;
  totalAnomaliesDetected: number;
  criticalRedFlags: number;
  highRiskExposureAmount: number;
  potentialSavingsPrevented: number;
  duplicateWorksCaught: number;
  calamityFundsApproved: number;
}

export interface SpendingRecord {
  id: string;
  sno: number;
  workId: string;
  workRecommendationId: string | number;
  activityName: string;
  workDescription: string;
  mpName: string;
  state: string;
  constituency: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  tenure: string;
  vendorName: string;
  vendorId: string | number;
  implementingAgency: string;
  districtAuthority: string;
  letterNo: string;
  expenditureDate: string;
  disbursedAmount: number;
  sanctionAmount?: number;
  actualAmount?: number;
  workStatus: 'Payment Success' | 'Payment In-Progress' | 'Payment Withheld' | 'Audit Flagged';
  fileStatus: boolean;
  attachId?: string | number | null;
  workCategory: string;
  trustScore: number; // 0 to 100
  trustRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'FLAGGED';
  trustFactors: {
    vendorIntegrity: number; // 0-25
    documentationCompleteness: number; // 0-25
    milestoneAlignment: number; // 0-25
    statutoryCompliance: number; // 0-25
  };
  riskFlags: string[];
  aiAuditSummary: string;
  geoLatitude?: number;
  geoLongitude?: number;
}

export interface SpendingTrustSummary {
  totalSpendingsCount: number;
  totalDisbursedValue: number;
  averageTrustScore: number;
  highTrustCount: number;
  moderateTrustCount: number;
  flaggedCount: number;
  verifiedDocumentPercentage: number;
  activeVendorsCount: number;
}

export interface DeepAuditResponse {
  workId: string;
  riskScore: number;
  verdict: 'HIGH_RISK_FRAUD' | 'PROCEDURAL_IRREGULARITY' | 'OPERATIONAL_DELAY' | 'COMPLIANT_NORMAL';
  executiveSummary: string;
  keyFindings: string[];
  guidelineViolations: Array<{
    clause: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }>;
  financialDiscrepancyAnalysis: string;
  contractorRiskAssessment: string;
  recommendedActions: string[];
  draftNoticeText: string;
}
