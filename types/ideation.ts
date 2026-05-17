export type QATurnType = 'intro' | 'predefined' | 'llm-generated' | 'closing';
export type QARole = 'assistant' | 'user';

export interface QATurn {
  id: string;
  role: QARole;
  content: string;
  type: QATurnType;
  skipped?: boolean;
  isCont?: boolean;
  timestamp: string;
}
