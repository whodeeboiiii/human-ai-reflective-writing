import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { generateObject, generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';
import type { QATurn, QATurnType, BookContext, ElementProgress, ElementKey } from '@/types/ideation';
import type { InterventionLevel } from '@/types/intervention';
import { INTERVENTION_PARAMS, INTERVENTION_LABEL } from '@/lib/intervention';

const WRITING_FREQUENCY_MAP: Record<string, string> = {
  daily: '거의 매일 씀',
  few_per_week: '주에 두세 번 씀',
  once_per_week: '주에 한 번 씀',
  few_per_month: '한 달에 한두 번 씀',
  rarely: '거의 안 씀',
};

const GENRE_MAP: Record<string, string> = {
  'book-review': '독후감',
  'place-review': '장소 리뷰',
  'movie-review': '영화·공연 리뷰',
  'product-review': '제품 리뷰',
  travelogue: '여행기',
  reflection: '성찰 일지',
};

const IDEA_READINESS_MAP: Record<string, string> = {
  none: '거의 없음, 또는 막연함',
  little: '조금 있음',
  some: '어느 정도 있음',
  much: '꽤 많이 있음',
  almost_complete: '거의 다 있음',
};

interface RequestBody {
  structuredInput: {
    genre?: string;
    topicSentence?: string;
    ideaReadiness?: string;
    writingFrequency?: string;
    userInterventionWant?: string;
  };
  turns: QATurn[];
  bookContext?: BookContext | null;
  interventionLevel?: InterventionLevel;
  // Server-owned element state machine. The client echoes back what the server
  // returned last turn; the server is the single source of truth.
  // currentElement is the element the user's latest answer addressed.
  currentElement?: ElementKey | null;
  completedElements?: ElementKey[];
  skippedElements?: ElementKey[]; // elements frozen via skip / clarify-loop escape
  clarifyStreak?: number; // consecutive clarify turns on the current element
  elementProgress?: ElementProgress; // cumulative completeness BEFORE this turn
  // ── Quick Mode (SWAI 배포) ──────────────────────────────────────────────
  // When mode === 'quick', element transitions are gated by a question budget
  // (4 mains + 4 followups = cap 8) instead of completionThreshold. See
  // CLAUDE_QuickMode.md §4.7. These three are echoed back like the state above.
  mode?: 'quick' | 'full';
  mainAsked?: number; // main questions asked so far (0–4)
  followupBudget?: number; // remaining followup budget (starts at 4)
  lastQType?: 'main' | 'followup' | 'clarification' | 'skip' | 'closing'; // type of the question just answered
  forceSkip?: boolean; // explicit skip button (Quick Mode) → deterministic skip, bypass evaluator
}

// ── Quick Mode budget constants (CLAUDE_QuickMode.md §4.1, §4.7) ──
const QUICK_FOLLOWUP_BUDGET = 4; // global pool of followups across all elements
// Per-element progress at/above which an answer is "good enough" → advance
// instead of following up (belt-and-suspenders alongside the evaluator's gap).
const QUICK_BAR = 60;

const ELEMENT_KEYS: ElementKey[] = ['orientation', 'feelings', 'evaluation', 'takeaway'];

const ELEMENT_LABEL_KO: Record<ElementKey, string> = {
  orientation: '외적 사실',
  feelings: '감정·반응',
  evaluation: '평가',
  takeaway: '깨달음·여운',
};

// Genre-agnostic element descriptions. "대상"은 책·장소·영화·제품·여행·경험 등
// 글의 종류에 따라 달라지는 글감을 가리킨다.
const ELEMENT_DESC_KO: Record<ElementKey, string> = {
  orientation: '대상에 대한 기본 사실, 그 대상과의 만남이나 선택하게 된 계기',
  feelings: '경험하면서 가장 강하게 마음이 움직인 순간이나 장면, 그때의 감정',
  evaluation: '그 반응의 이유와 의미, 핵심에 대한 판단, 자기 삶과의 연결',
  takeaway: '지금까지 남아있는 것, 행동이나 생각의 변화, 추천하고 싶은 대상',
};

// Few-shot scoring anchors. Examples deliberately span genres (독후감/영화/여행/
// 성찰 등) so the evaluator learns the 0–80 *scale*, not a single genre.
const ELEMENT_FEWSHOT: Record<ElementKey, string> = {
  orientation: [
    '"그냥 유명해서 골랐어요." → delta 15 (계기는 있으나 평면적)',
    '"회사를 그만두고 진로를 고민하던 시기에, 우연히 본 한 문장에 멈칫해서 선택하게 됐어요." → delta 75 (구체적 상황+계기+장면)',
  ].join('\n'),
  feelings: [
    '"재밌었어요." → delta 10 (진부, 구체성 없음)',
    '"주인공이 떠나는 장면이요." → delta 35 (장면은 특정했으나 감정·이유 없음)',
    '"아무 말 없이 짐을 싸는 그 장면에서, 예전에 가족과 말없이 헤어졌던 기억이 떠올라 코끝이 시큰했어요." → delta 78 (구체적 장면+신체 반응+개인 연결)',
  ].join('\n'),
  evaluation: [
    '"좋았다고 생각해요." → delta 10 (판단만 있고 근거 없음)',
    '"\'상실도 결국 관계의 일부\'라고 말하는 것 같았는데, 끝을 실패로만 봤던 제 시선을 돌아보게 했어요." → delta 75 (의미 해석+삶과의 연결)',
  ].join('\n'),
  takeaway: [
    '"여운이 남았어요." → delta 10 (막연함)',
    '"그러고 나서 미뤄두었던 친구에게 먼저 연락했어요. 미루지 말자는 마음이 행동으로 옮겨졌어요." → delta 78 (남은 것+구체적 행동 변화)',
  ].join('\n'),
};

const ZERO_PROGRESS: ElementProgress = { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 };

type LLMMessage = { role: 'user' | 'assistant'; content: string };

function fillPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, v), template);
}

function nextUncompleted(completed: ElementKey[]): ElementKey | null {
  return ELEMENT_KEYS.find((e) => !completed.includes(e)) ?? null;
}

// Deterministic detection of an explicit session-termination request.
// This must never depend on the LLM — it is the user's hard escape hatch.
function isTerminationRequest(text: string): boolean {
  const t = text.replace(/\s+/g, ' ').trim();
  const patterns = [
    /세션\s*종료/, /세션\s*끝/, /그만\s*(할래|하자|할게|할께|해|하고\s*싶)/,
    /끝낼래/, /끝내(자|줘|고\s*싶|주세요)/, /종료\s*(해|해줘|하자|할래|해주세요)/,
    /이제\s*그만/, /대화\s*끝/, /끝!?$/,
  ];
  return patterns.some((p) => p.test(t));
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 1 — Evaluator. Scores how much the user's latest answer contributed to
// the currently active element, and classifies the user's intent. Sees only the
// last Q&A pair (small context → more reliable scoring).
// ─────────────────────────────────────────────────────────────────────────
type Intent = 'answer' | 'clarify' | 'skip' | 'terminate';

interface EvalResult {
  delta: number; // 0–80, contribution to the active element
  intent: Intent;
  gap: string; // what is still under-developed for this element (drives the next followup)
  reasoning: string;
  isFallback: boolean; // true when both the call and its retry failed → neutral default
}

function validateEval(obj: unknown): EvalResult | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  const intents: Intent[] = ['answer', 'clarify', 'skip', 'terminate'];
  const intent = intents.includes(o.intent as Intent) ? (o.intent as Intent) : 'answer';
  let delta = typeof o.delta === 'number' ? Math.round(o.delta) : 0;
  delta = Math.max(0, Math.min(80, delta)); // hard cap 80 (single-answer ceiling)
  // clarify/skip/terminate never contribute progress.
  if (intent !== 'answer') delta = 0;
  return {
    delta,
    intent,
    gap: typeof o.gap === 'string' ? o.gap : '',
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : '',
    isFallback: false,
  };
}

async function evaluateAnswer(params: {
  activeElement: ElementKey;
  genreLabel: string;
  topic: string;
  lastQuestion: string;
  lastAnswer: string;
}): Promise<EvalResult> {
  const { activeElement, genreLabel, topic, lastQuestion, lastAnswer } = params;
  const label = ELEMENT_LABEL_KO[activeElement];
  const desc = ELEMENT_DESC_KO[activeElement];

  const system = [
    '너는 글쓰기 상담에서 학생의 답변을 채점하고 의도를 분류하는 평가자다. JSON 하나로만 응답한다.',
    '',
    `[글의 맥락] ${genreLabel} — 주제: "${topic}"`,
    `[현재 다루는 요소] ${label} — ${desc}`,
    '',
    '[과제] 학생의 "직전 답변 하나"가 위 요소에 기여한 정도를 0–80 정수(delta)로 매긴다.',
    '이전 대화의 누적은 고려하지 않는다. 오직 이번 답변 하나만 평가한다.',
    '',
    '[채점 기준]',
    '- 0  = 해당 요소와 무관하거나 회피성 답변',
    '- 10 = "좋았다", "재밌었다" 수준의 진부하고 일반적인 서술 (구체성 없음)',
    '- 30~50 = 구체적 장면·표현·생각이 담긴 답변 (구체적일수록 높게)',
    '- 80 = 매우 구체적이고 글 재료로 바로 쓸 수 있는 수준 (한 답변의 최댓값, 드물게 나옴)',
    '',
    '[채점 예시 — 현재 요소 기준]',
    ELEMENT_FEWSHOT[activeElement],
    '',
    '[의도 분류 intent]',
    '- "answer"   : 질문에 대한 정상적인 답변. 회피적이거나 진부해도, 조금이라도 내용을 담으면 answer.',
    '- "clarify"  : 답변이 아니라 질문을 이해하지 못해 되묻거나 재질문을 요청 ("무슨 뜻이야?", "다시 말해줘", "질문이 이해 안 돼")',
    '- "skip"     : 이 주제를 건너뛰자는 요청. 명시적("패스", "넘어가자", "다른 질문 줘") 또는 암시적("이미 아까 말했는데", "아까 말했잖아", "그건 방금 얘기했어")',
    '- "terminate": 세션 자체를 끝내자는 요청 ("그만할래", "세션 종료", "끝내자")',
    '',
    '[의도 분류 가드 — 반드시 준수]',
    '- 답변에 조금이라도 내용·정보가 담겨 있으면 skip이 아니라 answer다. "음 잘 모르겠지만 굳이 말하자면 ~"처럼 뒤에 내용이 이어지면 answer.',
    '- 짧다고 무조건 skip이 아니다. 짧아도 질문에 대한 답이면 answer(낮은 delta).',
    '- "이미 말했다"류는 새 내용 없이 회피할 때만 skip. 이전에 안 한 새 내용을 덧붙이면 answer.',
    '- clarify·skip·terminate인 경우 delta는 반드시 0.',
    '',
    '[gap 산출]',
    'intent가 answer이고 delta가 높지 않다면, 이 요소에서 아직 안 나왔거나 약한 부분을 한 줄로 적는다 (다음 꼬리 질문의 단서).',
    '고득점(글 재료로 충분)이거나 skip·clarify·terminate인 경우 빈 문자열 "".',
    '',
    '[출력 형식]',
    '{ "reasoning": "판단 근거 한 문장", "delta": 0, "intent": "answer|clarify|skip|terminate", "gap": "" }',
  ].join('\n');

  const userMsg = [
    `직전 질문: "${lastQuestion}"`,
    `학생의 답변: "${lastAnswer}"`,
    '',
    '위 답변을 채점하고 의도를 분류해 JSON으로만 답하라.',
  ].join('\n');

  // Up to 2 attempts (initial + 1 retry). Each attempt is a fresh, awaited LLM
  // call — it adds latency but never blocks the event loop. Only after both
  // attempts fail do we fall back to a neutral default.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { object } = await generateObject({
        model: upstage(SOLAR_MODEL),
        output: 'no-schema',
        system,
        messages: [{ role: 'user', content: userMsg }],
      });
      const validated = validateEval(object);
      if (validated) return validated;
      console.warn(`[QA eval] validate failed (attempt ${attempt}/2):`, JSON.stringify(object));
    } catch (err) {
      console.warn(`[QA eval] call failed (attempt ${attempt}/2):`, err instanceof Error ? err.message : err);
    }
  }
  // Fallback: treat as a low-value answer so the session keeps moving.
  console.warn('[QA eval FALLBACK] both attempts failed → delta=10, intent=answer');
  return { delta: 10, intent: 'answer', gap: '', reasoning: '(evaluator fallback)', isFallback: true };
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2b — Closing. Generates a warm closing line. Never asks a new question.
// ─────────────────────────────────────────────────────────────────────────
async function generateClosing(params: {
  genreLabel: string;
  topic: string;
  lastAnswer: string | null;
  reason: 'all-done' | 'user-request';
}): Promise<string> {
  const { genreLabel, topic, lastAnswer, reason } = params;
  const system = [
    '너는 글쓰기 상담을 마무리하는 따뜻한 강사다.',
    `방금 "${topic}"에 관한 ${genreLabel} 상담을 마쳤다.`,
    reason === 'user-request'
      ? '학생이 세션 종료를 요청했다. 더 캐묻지 말고 자연스럽게 마무리한다.'
      : '필요한 이야기를 충분히 나눴다. 수고를 다독이며 마무리한다.',
    '',
    '규칙: 새로운 질문을 절대 하지 않는다. 마크다운·이모지 금지.',
    '구어체로 따뜻한 마무리 인사 한두 문장만 출력한다. JSON 없이 평문으로만.',
  ].join('\n');

  const userMsg = lastAnswer
    ? `학생의 마지막 답변: "${lastAnswer}"\n이제 대화를 마무리하는 인사 한두 문장을 해줘.`
    : '이제 대화를 마무리하는 인사 한두 문장을 해줘.';

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const cleaned = text.trim().replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    if (cleaned) return cleaned;
  } catch (err) {
    console.error('[QA closing ERROR]', err instanceof Error ? err.message : err);
  }
  return '오늘 이야기 나눠주셔서 고마워요. 충분히 좋은 재료가 모였으니, 이제 글로 옮겨볼 차례예요.';
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2a — Question generator. Reuses the rich Socratic prompt, but the server
// pins the target element and the question type (main/followup/clarification).
// Only acknowledgment + question are consumed; all state decisions are the
// server's, not the LLM's.
// ─────────────────────────────────────────────────────────────────────────
interface GenQuestion {
  acknowledgment: string;
  question: string;
  reasoning: string;
}

function validateGenQuestion(obj: unknown): GenQuestion | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.question !== 'string' || !o.question.trim()) return null;
  return {
    acknowledgment: typeof o.acknowledgment === 'string' ? o.acknowledgment : '',
    question: o.question,
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : '',
  };
}

async function generateQuestion(params: {
  baseSystemPrompt: string;
  activeElement: ElementKey;
  completedElements: ElementKey[];
  qType: 'main' | 'followup' | 'clarification';
  gap: string; // evaluator's hint (only meaningful for followups)
  lastDelta: number; // evaluator's score of the just-answered turn (followups)
  messages: LLMMessage[];
}): Promise<GenQuestion> {
  const { baseSystemPrompt, activeElement, completedElements, qType, gap, lastDelta, messages } = params;
  const curLabel = ELEMENT_LABEL_KO[activeElement];
  const compLabels = completedElements.map((e) => ELEMENT_LABEL_KO[e]);

  const typeInstruction =
    qType === 'main'
      ? `- 이번 질문은 "${curLabel}" 요소를 *처음* 여는 메인 질문이다. 이 요소의 핵심을 여는 큰 질문을 던진다.`
      : qType === 'clarification'
        ? `- 학생이 직전 질문을 이해하지 못했다. "${curLabel}" 요소에 머무르며, 같은 의도를 다른 표현으로 쉽게 재질문한다.`
        : `- 이번 질문은 "${curLabel}" 요소를 *이어서* 파고드는 꼬리 질문이다. 직전 답변에 등장한 구체적 단서 하나를 잡아 한 단계 더 들어간다.`;

  const elementStateBlock = [
    '[현재 세션 상태 — 반드시 준수]',
    `이번 턴에 다룰 요소: ${curLabel}`,
    `이미 완료된 요소: ${compLabels.length > 0 ? compLabels.join(', ') : '없음'}`,
    '',
    typeInstruction,
    `- 질문은 반드시 "${curLabel}" 요소만 겨냥한다. 완료된 요소로 되돌아가지 않는다.`,
    '- 요소 전환·완료·세션 종료는 시스템이 결정한다. 너는 지금 지정된 요소의 질문 한 개만 생성한다.',
    '---',
    '',
  ].join('\n');

  // For followups, hand the evaluator's verdict to the generator so the two
  // calls agree: the question targets exactly the gap the evaluator flagged.
  const evalBlock =
    qType === 'followup' && gap
      ? [
          '[직전 답변 평가 — 참고]',
          `방금 답변의 이 요소 기여도: ${lastDelta}/80.`,
          `아직 약하거나 안 나온 부분: ${gap}`,
          "→ 이번 꼬리 질문은 위 '약하거나 안 나온 부분'을 정확히 겨냥한다.",
          '---',
          '',
        ].join('\n')
      : '';

  const system = elementStateBlock + evalBlock + baseSystemPrompt;

  try {
    const { object } = await generateObject({
      model: upstage(SOLAR_MODEL),
      output: 'no-schema',
      system,
      messages,
    });
    const validated = validateGenQuestion(object);
    if (validated) return validated;
    console.error('[QA generator validate FAILED]', JSON.stringify(object));
  } catch (err) {
    console.error('[QA generator ERROR]', err instanceof Error ? err.message : err);
  }
  // Fallback question keeps the session alive.
  return {
    acknowledgment: '',
    question: `${curLabel}에 대해 조금 더 이야기해 주실 수 있을까요?`,
    reasoning: '(generator fallback)',
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    structuredInput,
    turns,
    bookContext,
    interventionLevel,
    currentElement: clientElement,
    completedElements: clientCompleted,
    skippedElements: clientSkipped,
    clarifyStreak: clientClarifyStreak,
    elementProgress: clientProgress,
    mode,
    mainAsked: clientMainAsked,
    followupBudget: clientFollowupBudget,
    lastQType,
    forceSkip,
  } = body;

  const isQuick = mode === 'quick';

  const genre = structuredInput.genre ?? 'book-review';
  const genreLabel = GENRE_MAP[genre] ?? genre;
  const topicSentence = structuredInput.topicSentence ?? '교토에서의 사흘';
  const ideaReadiness = structuredInput.ideaReadiness ?? 'some';
  const writingFrequency = structuredInput.writingFrequency ?? 'few_per_month';
  const level: InterventionLevel = interventionLevel ?? 2;
  const threshold = INTERVENTION_PARAMS[level].completionThreshold;

  // ── Build the base question-generation system prompt (Socratic template) ──
  const promptTemplate = readFileSync(join(process.cwd(), 'QnA_PROMPT.md'), 'utf-8');
  let baseSystemPrompt = fillPrompt(promptTemplate, {
    writing_ability: WRITING_FREQUENCY_MAP[writingFrequency] ?? writingFrequency,
    genre: genreLabel,
    topic: topicSentence,
    idea_readiness: IDEA_READINESS_MAP[ideaReadiness] ?? ideaReadiness,
  });

  if (interventionLevel) {
    const params = INTERVENTION_PARAMS[interventionLevel];
    const label = INTERVENTION_LABEL[interventionLevel];
    const interventionBlock = [
      '[개입 수준 — 반드시 준수]',
      `이 세션의 개입 수준은 ${label}(${interventionLevel}단계)이다.`,
      `- 즉각 구체화(꼬리 질문) 적극성: ${params.followupThreshold}.`,
      '  off=거의 발동 안 함 / low=한 문장 이하일 때만 / medium=짧거나 진부할 때 / high=일반적 서술에도 / very_high=정보가 덜 차면 항상.',
      '---',
      '',
    ].join('\n');
    baseSystemPrompt = interventionBlock + baseSystemPrompt;
  }

  if (bookContext) {
    const bookBlock = [
      '[참고: 학생이 쓰려는 책 정보]',
      `제목: ${bookContext.title}`,
      `저자: ${bookContext.author}`,
      `출판사: ${bookContext.publisher}`,
      `소개: ${bookContext.description}`,
      '',
      '이 정보는 질문 생성의 맥락으로만 활용한다. 책의 줄거리나 내용을 학생에게 직접 설명하지 않는다.',
      '---',
      '',
    ].join('\n');
    baseSystemPrompt = bookBlock + baseSystemPrompt;
  }

  // ── Conversation history → LLM messages ──
  const nonIntroTurns = turns.filter((t) => t.type !== 'intro');
  const mapped: LLMMessage[] = nonIntroTurns.map((t) => ({
    role: t.role === 'user' ? 'user' : 'assistant',
    content: t.content,
  }));
  const llmMessages: LLMMessage[] =
    mapped.length === 0 || mapped[0].role === 'assistant'
      ? [{ role: 'user', content: '시작해요.' }, ...mapped]
      : mapped;

  const lastUserTurn = [...nonIntroTurns].reverse().find((t) => t.role === 'user');
  const lastAssistantTurn = [...nonIntroTurns].reverse().find((t) => t.role === 'assistant');
  const userTurnCount = nonIntroTurns.filter((t) => t.role === 'user').length;
  const isFirstQuestion = userTurnCount === 0;

  // ── Server-owned state machine ──
  const progress: ElementProgress = clientProgress
    ? { ...clientProgress }
    : { ...ZERO_PROGRESS };
  let active: ElementKey | null = clientElement ?? 'orientation';
  const completed: ElementKey[] = [...(clientCompleted ?? [])];
  const skipped: ElementKey[] = [...(clientSkipped ?? [])];
  const delta: ElementProgress = { ...ZERO_PROGRESS };
  // Quick Mode budget state (ignored unless isQuick). Echoed back to the client.
  let mainAsked = clientMainAsked ?? 0;
  let followupBudget = clientFollowupBudget ?? QUICK_FOLLOWUP_BUDGET;

  let intent: Intent = 'answer';
  let evalReasoning = '';
  let evalGap = '';
  let evalFallback = false;
  let ending = false;
  let endReason: 'all-done' | 'user-request' | null = null;
  let qType: 'main' | 'followup' | 'clarification' = 'main';
  const prevClarify = clientClarifyStreak ?? 0;
  let newClarify = 0; // consecutive clarify count carried to the next turn

  try {
    if (isFirstQuestion) {
      // No prior answer to evaluate. Open the first element with a main question.
      active = active ?? 'orientation';
      qType = 'main';
    } else if (!active) {
      // Defensive: client says all-done but is still calling → close.
      ending = true;
      endReason = 'all-done';
    } else {
      const lastAnswerText = lastUserTurn?.content ?? '';

      // (a) Deterministic termination — the user's hard escape hatch.
      if (isTerminationRequest(lastAnswerText)) {
        intent = 'terminate';
        ending = true;
        endReason = 'user-request';
        evalReasoning = '사용자가 명시적으로 세션 종료를 요청함 (결정론적 감지).';
      } else if (isQuick && forceSkip) {
        // (a') Deterministic skip — explicit skip button (Quick Mode). Bypass the
        // evaluator entirely. Mirrors the skip transition: a skipped followup is
        // refunded (§4.3), the element is closed, advance to the next element's main.
        intent = 'skip';
        evalReasoning = '명시적 skip 버튼 (결정론적 감지).';
        if (lastQType === 'followup') {
          followupBudget = Math.min(QUICK_FOLLOWUP_BUDGET, followupBudget + 1);
        }
        if (!skipped.includes(active)) skipped.push(active);
        completed.push(active);
        const next = nextUncompleted(completed);
        if (!next) {
          ending = true;
          endReason = 'all-done';
        } else {
          active = next;
          qType = 'main';
        }
      } else {
        // (b) Phase 1 — evaluate the latest answer for the active element.
        const evalResult = await evaluateAnswer({
          activeElement: active,
          genreLabel,
          topic: topicSentence,
          lastQuestion: lastAssistantTurn?.content ?? '',
          lastAnswer: lastAnswerText,
        });
        intent = evalResult.intent;
        evalReasoning = evalResult.reasoning;
        evalGap = evalResult.gap;
        evalFallback = evalResult.isFallback;

        if (intent === 'terminate') {
          ending = true;
          endReason = 'user-request';
        } else if (intent === 'clarify') {
          // Clarify never advances progress. Cap the loop so a confused user
          // can't get stuck on one element forever.
          const streak = prevClarify + 1;
          if (streak >= 3) {
            // Third confused turn in a row → freeze this element and move on.
            if (!skipped.includes(active)) skipped.push(active);
            if (!completed.includes(active)) completed.push(active);
            const next = nextUncompleted(completed);
            if (!next) {
              ending = true;
              endReason = 'all-done';
            } else {
              active = next;
              qType = 'main';
            }
            newClarify = 0;
          } else if (streak >= 2) {
            // Second confused turn → re-open the SAME element from a fresh angle.
            qType = 'main';
            newClarify = streak;
          } else {
            qType = 'clarification';
            newClarify = streak;
          }
        } else if (intent === 'skip') {
          // Freeze, don't fabricate: keep progress exactly as-is (neither zeroed
          // nor inflated to threshold), record the skip, then transition. The
          // element is closed because the user asked to move on — but its real
          // (partial) progress is preserved rather than misrepresented as full.
          // Quick Mode: skip is only offered on followups (UI disables it on
          // mains). A skipped followup is excluded from the budget (§4.3) → refund.
          // A skip that arrives on a main (user typed "패스") gets no refund (§4.7).
          if (isQuick && lastQType === 'followup') {
            followupBudget = Math.min(QUICK_FOLLOWUP_BUDGET, followupBudget + 1);
          }
          if (!skipped.includes(active)) skipped.push(active);
          completed.push(active);
          const next = nextUncompleted(completed);
          if (!next) {
            ending = true;
            endReason = 'all-done';
          } else {
            active = next;
            qType = 'main';
          }
        } else if (isQuick) {
          // ── Quick Mode: budget-gated transition (not threshold). §4.7 ──
          // progress still accumulates (for the progress circles), but it does
          // NOT decide transitions — the followup budget does.
          delta[active] = evalResult.delta;
          progress[active] = progress[active] + evalResult.delta;

          // Weak answer → worth digging deeper, if budget remains. The evaluator
          // flags weakness via a non-empty gap; QUICK_BAR is the fallback when the
          // gap is empty but the score is still low. Budget is a global pool spent
          // greedily on whichever element is currently weak (front-to-back).
          const weak = evalGap !== '' || progress[active] < QUICK_BAR;
          if (weak && followupBudget > 0) {
            qType = 'followup'; // stay on the same element; budget decremented at send time
          } else {
            completed.push(active);
            const next = nextUncompleted(completed);
            if (!next) {
              ending = true;
              endReason = 'all-done';
            } else {
              active = next;
              qType = 'main';
            }
          }
        } else {
          // ── Full pipeline: threshold-gated transition. ──
          delta[active] = evalResult.delta;
          progress[active] = progress[active] + evalResult.delta;

          const prevActive = active;
          while (active && progress[active] >= threshold) {
            completed.push(active);
            active = nextUncompleted(completed);
          }
          if (!active) {
            ending = true;
            endReason = 'all-done';
          } else {
            qType = active !== prevActive ? 'main' : 'followup';
          }
        }
      }
    }

    // ── Phase 2 — generate output text ──
    let content: string;
    let questionField: string;
    let acknowledgment = '';
    let genReasoning = '';
    let type: QATurnType;
    // questionType: 라벨링 of the *answered turn's intent* (full pipeline의 사이드패널
    // 요약 판단용). skip/clarify면 그 intent로 라벨됨 — 생성된 질문의 타입이 아님.
    let questionType: 'main' | 'followup' | 'clarification' | 'skip' | 'closing';
    // nextQuestionType: questioner가 *실제 생성한 질문*의 타입 (= 지금 content에 담긴 질문).
    // 직전 답변의 intent와 분리해야 한다 (intent=skip이어도 다음 질문은 main일 수 있음).
    // Quick 클라이언트의 skip 버튼 활성화·예산 echo·floor 판단은 반드시 이 필드를 쓴다.
    let nextQuestionType: 'main' | 'followup' | 'clarification' | 'closing';

    if (ending) {
      const closing = await generateClosing({
        genreLabel,
        topic: topicSentence,
        lastAnswer: lastUserTurn?.content ?? null,
        reason: endReason ?? 'all-done',
      });
      content = closing;
      questionField = closing;
      type = 'closing';
      questionType = 'closing';
      nextQuestionType = 'closing';
      active = null;
    } else {
      const activeKey = active as ElementKey;
      // Quick Mode: account for the question we're about to send. Mains and
      // followups consume their respective budgets; clarifications are free.
      if (isQuick) {
        if (qType === 'main') mainAsked++;
        else if (qType === 'followup') followupBudget--;
      }
      const gen = await generateQuestion({
        baseSystemPrompt,
        activeElement: activeKey,
        completedElements: completed,
        qType,
        // gap/lastDelta only matter for followups (same element, no transition).
        gap: qType === 'followup' ? evalGap : '',
        lastDelta: qType === 'followup' ? delta[activeKey] : 0,
        messages: llmMessages,
      });
      acknowledgment = gen.acknowledgment;
      questionField = gen.question;
      genReasoning = gen.reasoning;
      content = acknowledgment ? `${acknowledgment}\n\n${gen.question}` : gen.question;
      type = 'llm-generated';
      // Client-facing label: drives side-panel summary eligibility. A confused
      // (clarify) turn is never summarized even when we force a fresh main angle.
      questionType =
        intent === 'skip' ? 'skip' : intent === 'clarify' ? 'clarification' : qType;
      // The actual type of the question we just generated (questioner output),
      // independent of the previous answer's intent.
      nextQuestionType = qType;
    }

    const progressStr = `O:${progress.orientation} F:${progress.feelings} E:${progress.evaluation} T:${progress.takeaway}`;
    const quickStr = isQuick ? ` | [QUICK] mainAsked=${mainAsked} followupBudget=${followupBudget}` : '';
    console.log(
      `[QA turn] intent=${intent}${evalFallback ? '(FALLBACK)' : ''} | active=${active ?? '(end)'} | qType=${questionType} | delta=${JSON.stringify(delta)} | 누적=[${progressStr}] | 완료=[${completed.join(', ')}] | 스킵=[${skipped.join(', ')}] | clarify=${newClarify} | ending=${ending}${endReason ? `(${endReason})` : ''}${quickStr}`,
    );
    if (evalReasoning) console.log(`[QA eval] ${evalReasoning}`);
    if (evalGap) console.log(`[QA gap] ${evalGap}`);
    if (genReasoning) console.log(`[QA gen] ${genReasoning}`);

    // ── Session log ──
    try {
      const logsDir = join(process.cwd(), 'logs');
      mkdirSync(logsDir, { recursive: true });
      const sessionKey = turns[0]?.id?.slice(0, 8) ?? `new-${Date.now()}`;
      const logPath = join(logsDir, `qa-session-${sessionKey}.json`);

      let debugLog: Array<Record<string, unknown>> = [];
      try {
        const prev = JSON.parse(readFileSync(logPath, 'utf-8')) as { debugLog?: Array<Record<string, unknown>> };
        if (Array.isArray(prev.debugLog)) debugLog = prev.debugLog;
      } catch { /* first write */ }

      debugLog.push({
        at: new Date().toISOString(),
        exchangeIdx: userTurnCount,
        // ── Input ──
        userInput: isFirstQuestion ? null : (lastUserTurn?.content ?? null),
        activeElementBefore: clientElement ?? null,
        // ── Phase 1: evaluation ──
        intent,
        evalDelta: delta,
        evalGap: evalGap || null,
        evalFallback,
        evalReasoning: evalReasoning || null,
        // ── Server decision ──
        progressAfter: progress,
        progressSummary: progressStr,
        threshold,
        completedElements: completed,
        skippedElements: skipped,
        clarifyStreak: newClarify,
        transitionedTo: active ?? null,
        ending,
        endReason,
        // ── Phase 2: generation ──
        questionType,
        genReasoning: genReasoning || null,
        acknowledgment: acknowledgment || null,
        question: questionField,
      });

      const transcript = [
        ...nonIntroTurns,
        {
          role: 'assistant' as const,
          type,
          content: acknowledgment || undefined,
          question: questionField,
          intent,
          questionType,
          evalDelta: delta,
          progressAfter: progress,
          completedElements: completed,
          skippedElements: skipped,
          currentElement: active,
          ending,
          endReason,
        },
      ];

      writeFileSync(
        logPath,
        JSON.stringify(
          {
            meta: {
              genre: genreLabel,
              topic: topicSentence,
              writingFrequency: WRITING_FREQUENCY_MAP[writingFrequency] ?? writingFrequency,
              interventionLevel: interventionLevel ?? null,
              interventionLabel: interventionLevel ? INTERVENTION_LABEL[interventionLevel] : null,
              completionThreshold: threshold,
              followupThreshold: INTERVENTION_PARAMS[level].followupThreshold,
              updatedAt: new Date().toISOString(),
            },
            debugLog,
            transcript,
          },
          null,
          2,
        ),
        'utf-8',
      );
    } catch {
      // logging failure must not break the response
    }

    return NextResponse.json({
      content,
      type,
      questionType,
      // Actual type of the generated question (≠ questionType when prev intent was
      // skip/clarify). Quick client uses THIS for skip-enable / budget echo / floor.
      nextQuestionType,
      isDone: ending,
      // Authoritative server-owned state — the client just stores these.
      currentElement: active,
      completedElements: completed,
      skippedElements: skipped,
      clarifyStreak: newClarify,
      elementProgress: progress,
      elementProgressDelta: delta,
      // Quick Mode budget (echoed back next turn). Harmless in full mode.
      mainAsked,
      followupBudget,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[QA ERROR] turn failed:', errorMsg);
    return NextResponse.json({ error: 'LLM call failed', detail: errorMsg }, { status: 500 });
  }
}
