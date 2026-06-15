import type {
  WritingFrequency,
  UserInterventionWant,
  InterventionLevel,
  InterventionParams,
} from '@/types/intervention';
import type { IdeaReadiness } from '@/types/structured-input';

// ── Step 1: 척도 → 숫자 매핑 ──────────────────────────────
// 숫자가 클수록 "도움이 더 필요한" 방향

const EXPERTISE_SCORE: Record<WritingFrequency, number> = {
  daily: 1, // 전문가 → 도움 덜 필요
  few_per_week: 2,
  once_per_week: 3,
  few_per_month: 4,
  rarely: 5, // 초보 → 도움 더 필요
};

const READINESS_SCORE: Record<IdeaReadiness, number> = {
  almost_complete: 1, // 준비됨 → 도움 덜 필요
  much: 2,
  some: 3,
  little: 4,
  none: 5, // 아무것도 없음 → 도움 더 필요
};

// ── Step 2: baseline_need 계산 ────────────────────────────
// raw = (expertise + readiness) / 2  → 범위: 1.0 – 5.0

export function computeBaselineNeed(
  frequency: WritingFrequency,
  readiness: IdeaReadiness
): InterventionLevel {
  const raw = (EXPERTISE_SCORE[frequency] + READINESS_SCORE[readiness]) / 2;
  if (raw <= 1.5) return 1;
  if (raw <= 2.5) return 2;
  if (raw <= 3.5) return 3;
  if (raw <= 4.5) return 4;
  return 5;
}

// ── Step 3: calibration 매핑 ──────────────────────────────
const CALIBRATION: Record<UserInterventionWant, number> = {
  very_low: -2,
  low: -1,
  neutral: 0,
  high: +1,
  very_high: +2,
};

// ── Step 4: final_intervention 계산 ──────────────────────
// clamp(baseline + calibration, 1, 5)

export function computeFinalIntervention(
  baseline: InterventionLevel,
  want: UserInterventionWant
): InterventionLevel {
  const raw = baseline + CALIBRATION[want];
  return Math.max(1, Math.min(5, raw)) as InterventionLevel;
}

// ── Step 5: InterventionLevel → LLM 파라미터 매핑 ────────

// completionThreshold: 각 요소에 누적된 elementProgressDelta 합계가
// 이 값 이상이 되면 해당 요소를 완료로 판단.
// 답변 하나의 최대 기여량이 50이므로, 예)
//   Lv1(50)  = 우수 답변 1개 또는 평범 5개
//   Lv3(100) = 우수 답변 2개 또는 평범 10개
//   Lv5(160) = 우수 답변 3~4개, 또는 구체적 답변 5~6개
export const INTERVENTION_PARAMS: Record<InterventionLevel, InterventionParams> =
{
  1: { followupThreshold: 'off', completionThreshold: 40 },
  2: { followupThreshold: 'low', completionThreshold: 50 },
  3: { followupThreshold: 'medium', completionThreshold: 65 },
  4: { followupThreshold: 'high', completionThreshold: 80 },
  5: { followupThreshold: 'very_high', completionThreshold: 100 },
};

export const INTERVENTION_LABEL: Record<InterventionLevel, string> = {
  1: '매우 낮음',
  2: '낮음',
  3: '중간',
  4: '높음',
  5: '매우 높음',
};
