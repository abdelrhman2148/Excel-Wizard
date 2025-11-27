
export type AppMode = 'generate' | 'debug' | 'template' | 'analyze' | 'chat' | 'automate';
export type Platform = 'Excel' | 'Google Sheets';
export type PlanType = 'free' | 'pro' | 'team' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  usageToday: number;
  lastUsageDate: string; // ISO date string YYYY-MM-DD
  organizationId?: string;
  isAdmin?: boolean;
  hasOnboarded?: boolean;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  created: number;
  lastUsed: number;
}

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  price: number; // 0 for free
  category: string;
  purchased: boolean;
  steps: WizardStep[];
}

export interface SheetMetadata {
  name: string;
  columns: string[];
  rowCount: number;
}

export interface FileContextData {
  fileName: string;
  sheets: SheetMetadata[];
  activeSheetName: string;
  sampleRows: any[][]; // Sample of active sheet
  fullData?: any[][]; // Kept for legacy demo support
}

export type ActionType = 'formula' | 'create_sheet' | 'header' | 'format' | 'validation' | 'insight' | 'clean_data' | 'filter';

export interface WizardStep {
  action: ActionType;
  location: string;
  value: string;
  explanation: string;
}

export interface AnalysisIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  suggestion: string;
}

export interface AnalysisReport {
  healthScore: number;
  summary: string;
  issues: AnalysisIssue[];
}

export interface QAResponse {
  answerText: string;
  supportingFormula?: string;
}

export interface WizardResponse {
  responseType: 'steps' | 'analysis' | 'answer';
  steps?: WizardStep[];
  analysis?: AnalysisReport;
  qa?: QAResponse;
  previewValue?: string;
  requiresMoreInfo: boolean;
  errorDebug?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WizardStep[];
  platform: Platform;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  type: AppMode;
  platform: Platform;
  prompt: string;
  result: WizardResponse;
  timestamp: number;
}

export interface AnalyticsData {
  requestCount: number;
  successfulGens: number;
  helpfulCount: number;
  totalFeedback: number;
  creditsUsed: number;
}

export interface TeamSettingsData {
  preferredFunctions: string;
  formattingRules: string;
  language: string;
}

export interface FeedbackLog {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  isHelpful: boolean;
  timestamp: number;
}
