/** Q4 — 글쓰기 전문성 척도 */
export type WritingFrequency =
  | 'daily'          // 거의 매일
  | 'few_per_week'   // 주에 두세 번
  | 'once_per_week'  // 주에 한 번
  | 'few_per_month'  // 한 달에 한두 번
  | 'rarely';        // 거의 안 씀

/** Q5 — 주관적 AI 개입 희망도 척도 (5단계 슬라이더) */
export type UserInterventionWant =
  | 'very_low'   // 매우 낮음  → calibration -2
  | 'low'        // 낮음       → calibration -1
  | 'neutral'    // 보통       → calibration  0  (중앙: baseline 그대로)
  | 'high'       // 높음       → calibration +1
  | 'very_high'; // 매우 높음  → calibration +2

/** 최종 개입 필요도 (1=매우낮음, 5=매우높음) */
export type InterventionLevel = 1 | 2 | 3 | 4 | 5;

/** `questions/route.ts`에서 LLM에게 전달되는 파라미터 세트 */
export interface InterventionParams {
  followupThreshold: 'off' | 'low' | 'medium' | 'high' | 'very_high'; // 즉각 구체화 발동 빈도
  completionThreshold: number;                    // 4요소 elementProgress 종료 임계값 (0–100)
}
