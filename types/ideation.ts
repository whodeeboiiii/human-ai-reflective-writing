export type QATurnType = 'intro' | 'predefined' | 'llm-generated' | 'closing';

export interface ElementProgress {
  orientation: number;  // 0–100
  feelings: number;
  evaluation: number;
  takeaway: number;
}

export type ElementKey = keyof ElementProgress;

export interface BookContext {
  title: string;
  author: string;
  publisher: string;
  description: string;
}
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

export type SourceElement = 'orientation' | 'feelings' | 'evaluation' | 'takeaway';

export interface MaterialCard {
  id: string;
  content: string;
  sourceElement: SourceElement;
  isEdited: boolean;
}

export interface FlowSuggestion {
  id: string;
  label: string;
  cardOrder: string[];
  transitions: (string | null)[];
  rationale: string;
}

export interface Outline {
  cards: MaterialCard[];
  userArrangedOrder: string[] | null;
  flowSuggestions: FlowSuggestion[] | null;
  selectedFlowId: string | null;
  generatedAt: string;
  userEdited: boolean;
}
