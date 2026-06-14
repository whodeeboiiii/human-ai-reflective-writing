export interface Note {
  id: string;
  title: string;
  preview: string;
  modified: string;
  tag: string;
}

// ── Writing Phase — AI Suggest & Fix interaction logging ──

export type AIInteractionType = 'suggest' | 'fix';
export type AIDecision = 'accepted' | 'rejected';

export interface AIWritingInteraction {
  id: string;
  type: AIInteractionType;
  triggeredAt: number;
  inputContext: string; // 커서 앞 텍스트 또는 선택 텍스트
  suggestions: string[]; // LLM이 반환한 제안 목록
  decision: AIDecision;
  acceptedIndex?: number; // 'suggest' 시 몇 번째 제안을 선택했는지
  finalText?: string; // 'fix' 시 실제 적용된 텍스트
}
