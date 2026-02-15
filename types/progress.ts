/**
 * Real-time progress tracking types for AI Consultant Toolkit setup
 */

export type ToolStatus = 'pending' | 'installing' | 'success' | 'error';

export type Phase = 'phase1' | 'phase2';

export interface ToolStatusInfo {
  status: ToolStatus;
  version?: string;
  error?: string;
}

export interface ProgressError {
  tool: string;
  error: string;
  suggestedFix: string;
}

export interface ErrorLogEntry extends ProgressError {
  timestamp: string;
  step: number;
}

export interface ProgressData {
  sessionId: string;
  currentStep: number;
  completedSteps: number[];
  currentAction: string;
  toolStatus: Record<string, ToolStatusInfo>;
  errors: ProgressError[];
  timestamp: string;
  phase: Phase;
  complete: boolean;
}

export interface ProgressResponse {
  success?: boolean;
  sessionId?: string;
  error?: string;
  details?: unknown;
}

export interface ErrorLogResponse {
  success?: boolean;
  sessionId?: string;
  totalErrors?: number;
  errors?: ErrorLogEntry[];
  error?: string;
  details?: unknown;
}
