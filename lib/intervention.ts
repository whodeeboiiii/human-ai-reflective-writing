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
// 답변 하나의 최대 기여량(delta 상한)은 80이고, 80은 좀처럼 나오지 않는다.
// threshold는 아무리 높아도 100을 넘지 않게 설계한다:
//   Lv1~Lv4 (≤80) = 매우 강한 답변 하나(≈80)로도 한 번에 통과 가능
//   Lv5    (100)  = 한 번의 강한 답변(80)으로는 못 넘으므로 답변이 최소 2개 필요
export const INTERVENTION_PARAMS: Record<InterventionLevel, InterventionParams> =
{
  1: { followupThreshold: 'off', completionThreshold: 50 },
  2: { followupThreshold: 'low', completionThreshold: 60 },
  3: { followupThreshold: 'medium', completionThreshold: 70 },
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
