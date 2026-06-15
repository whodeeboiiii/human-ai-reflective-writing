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
  elementProgress?: ElementProgress; // cumulative completeness BEFORE this turn
}

const ELEMENT_KEYS: ElementKey[] = ['orientation', 'feelings', 'evaluation', 'takeaway'];

const ELEMENT_LABEL_KO: Record<ElementKey, string> = {
  orientation: '외적 사실',
  feelings: '감정·반응',
  evaluation: '평가',
  takeaway: '깨달음·여운',
};

const ELEMENT_DESC_KO: Record<ElementKey, string> = {
  orientation: '책 자체에 대한 사실, 책과의 만남, 책을 선택하게 된 계기',
  feelings: '책을 읽으며 가장 강하게 마음이 움직인 장면이나 구절, 그때의 감정',
  evaluation: '그 반응의 이유와 의미, 책의 핵심 메시지 판단, 책과 자기 삶의 연결',
  takeaway: '지금까지 남아있는 것, 행동이나 생각의 변화, 책을 권하고 싶은 대상',
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
  delta: number; // 0–50, contribution to the active element
  intent: Intent;
  reasoning: string;
}

function validateEval(obj: unknown): EvalResult | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  const intents: Intent[] = ['answer', 'clarify', 'skip', 'terminate'];
  const intent = intents.includes(o.intent as Intent) ? (o.intent as Intent) : 'answer';
  let delta = typeof o.delta === 'number' ? Math.round(o.delta) : 0;
  delta = Math.max(0, Math.min(50, delta));
  return { delta, intent, reasoning: typeof o.reasoning === 'string' ? o.reasoning : '' };
}

async function evaluateAnswer(params: {
  activeElement: ElementKey;
  lastQuestion: string;
  lastAnswer: string;
}): Promise<EvalResult> {
  const { activeElement, lastQuestion, lastAnswer } = params;
  const label = ELEMENT_LABEL_KO[activeElement];
  const desc = ELEMENT_DESC_KO[activeElement];

  const system = [
    '너는 글쓰기 상담에서 학생의 답변을 채점하는 평가자다. JSON 하나로만 응답한다.',
    '',
    `[현재 다루는 요소] ${label} — ${desc}`,
    '',
    '[과제] 학생의 "직전 답변 하나"가 위 요소에 기여한 정도를 0–50 정수(delta)로 매긴다.',
    '이전 대화의 누적은 고려하지 않는다. 오직 이번 답변 하나만 평가한다.',
    '채점 기준:',
    '- 0  = 해당 요소와 무관하거나 회피성 답변',
    '- 10 = "좋았다", "재밌었다" 수준의 진부하고 일반적인 서술 (구체성 없음)',
    '- 20~40 = 구체적 장면·표현·생각이 담긴 답변 (구체적일수록 높게)',
    '- 50 = 매우 구체적이고 글 재료로 바로 쓸 수 있는 수준 (한 답변의 최댓값)',
    '',
    '[의도 분류 intent]',
    '- "answer"   : 질문에 대한 정상적인 답변 (회피·진부해도 답변이면 answer)',
    '- "clarify"  : 답변이 아니라 질문을 이해 못해 되묻거나 재질문을 요청 ("무슨 뜻이야?", "다시 말해줘")',
    '- "skip"     : 이 주제를 건너뛰자는 요청 ("패스", "잘 모르겠어 넘어가자", "다른 질문")',
    '- "terminate": 세션 자체를 끝내자는 요청 ("그만할래", "세션 종료", "끝내자")',
    'clarify·skip·terminate인 경우 delta는 반드시 0.',
    '',
    '[출력 형식]',
    '{ "reasoning": "판단 근거 한 문장", "delta": 0, "intent": "answer|clarify|skip|terminate" }',
  ].join('\n');

  const userMsg = [
    `직전 질문: "${lastQuestion}"`,
    `학생의 답변: "${lastAnswer}"`,
    '',
    '위 답변을 채점하고 의도를 분류해 JSON으로만 답하라.',
  ].join('\n');

  try {
    const { object } = await generateObject({
      model: upstage(SOLAR_MODEL),
      output: 'no-schema',
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const validated = validateEval(object);
    if (validated) return validated;
  } catch (err) {
    console.error('[QA evaluator ERROR]', err instanceof Error ? err.message : err);
  }
  // Fallback: treat as a low-value answer so the session keeps moving.
  return { delta: 10, intent: 'answer', reasoning: '(evaluator fallback)' };
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
  messages: LLMMessage[];
}): Promise<GenQuestion> {
  const { baseSystemPrompt, activeElement, completedElements, qType, messages } = params;
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
    '- elementProgressDelta·currentElement·isDone 같은 상태 필드는 무시해도 된다. 시스템이 직접 관리한다.',
    '---',
    '',
  ].join('\n');

  const system = elementStateBlock + baseSystemPrompt;

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
    elementProgress: clientProgress,
  } = body;

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
  let progress: ElementProgress = clientProgress
    ? { ...clientProgress }
    : { ...ZERO_PROGRESS };
  let active: ElementKey | null = clientElement ?? 'orientation';
  const completed: ElementKey[] = [...(clientCompleted ?? [])];
  const delta: ElementProgress = { ...ZERO_PROGRESS };

  let intent: Intent = 'answer';
  let evalReasoning = '';
  let ending = false;
  let endReason: 'all-done' | 'user-request' | null = null;
  let qType: 'main' | 'followup' | 'clarification' = 'main';

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
      } else {
        // (b) Phase 1 — evaluate the latest answer for the active element.
        const evalResult = await evaluateAnswer({
          activeElement: active,
          lastQuestion: lastAssistantTurn?.content ?? '',
          lastAnswer: lastAnswerText,
        });
        intent = evalResult.intent;
        evalReasoning = evalResult.reasoning;

        if (intent === 'terminate') {
          ending = true;
          endReason = 'user-request';
        } else if (intent === 'clarify') {
          // Stay on the same element; re-ask. No delta, no transition.
          qType = 'clarification';
        } else if (intent === 'skip') {
          // Mark the active element done and move on.
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
          // Normal answer → apply delta, then transition deterministically.
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
    let questionType: 'main' | 'followup' | 'clarification' | 'skip' | 'closing';

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
      active = null;
    } else {
      const gen = await generateQuestion({
        baseSystemPrompt,
        activeElement: active as ElementKey,
        completedElements: completed,
        qType,
        messages: llmMessages,
      });
      acknowledgment = gen.acknowledgment;
      questionField = gen.question;
      genReasoning = gen.reasoning;
      content = acknowledgment ? `${acknowledgment}\n\n${gen.question}` : gen.question;
      type = 'llm-generated';
      questionType = intent === 'skip' ? 'skip' : qType;
    }

    const progressStr = `O:${progress.orientation} F:${progress.feelings} E:${progress.evaluation} T:${progress.takeaway}`;
    console.log(
      `[QA turn] intent=${intent} | active=${active ?? '(end)'} | qType=${questionType} | delta=${JSON.stringify(delta)} | 누적=[${progressStr}] | 완료=[${completed.join(', ')}] | ending=${ending}${endReason ? `(${endReason})` : ''}`,
    );
    if (evalReasoning) console.log(`[QA eval] ${evalReasoning}`);
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
        evalReasoning: evalReasoning || null,
        // ── Server decision ──
        progressAfter: progress,
        progressSummary: progressStr,
        threshold,
        completedElements: completed,
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
      isDone: ending,
      // Authoritative server-owned state — the client just stores these.
      currentElement: active,
      completedElements: completed,
      elementProgress: progress,
      elementProgressDelta: delta,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[QA ERROR] turn failed:', errorMsg);
    return NextResponse.json({ error: 'LLM call failed', detail: errorMsg }, { status: 500 });
  }
}
