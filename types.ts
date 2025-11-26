
export enum QuestionType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICE = 'MULTI_CHOICE',
  RATING = 'RATING',
  DATE = 'DATE',
  IMAGE = 'IMAGE'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  options?: string[]; // For choice questions
  required: boolean;
}

export interface SurveyTheme {
  primaryColor: string;
  font: string;
}

export interface NotificationConfig {
  enabled: boolean;
  recipients: string;
  notifyOnCritical: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questions: Question[];
  active: boolean;
  theme?: SurveyTheme;
  notifications?: NotificationConfig;
}

export type ReportStatus = 'new' | 'in_progress' | 'completed' | 'archived';
export type ReportPriority = 'normal' | 'high' | 'critical';

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, string | number | string[] | File | null>; // questionId -> answer
  timestamp: string;
  // New Workflow Fields
  status?: ReportStatus;
  priority?: ReportPriority;
  internal_notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  targetId: string;
  timestamp: string;
}

export type ViewState = 'DASHBOARD' | 'BUILDER' | 'VIEWER' | 'ANALYTICS';
