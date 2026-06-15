import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
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
  // Client-owned element state machine. currentElement === null means all elements done.
  currentElement?: ElementKey | null;
  completedElements?: ElementKey[];
}

const ELEMENT_LABEL_KO: Record<ElementKey, string> = {
  orientation: '외적 사실',
  feelings: '감정·반응',
  evaluation: '평가',
  takeaway: '깨달음·여운',
};

type LLMMessage = { role: 'user' | 'assistant'; content: string };

interface LLMOutput {
  reasoning: string;
  acknowledgment: string;
  question: string;
  questionType: 'main' | 'followup' | 'supplementary' | 'clarification' | 'skip' | 'closing';
  isDone: boolean;
  elementProgress?: ElementProgress;
  currentElement: ElementKey | null;
}

const ELEMENT_KEYS: ElementKey[] = ['orientation', 'feelings', 'evaluation', 'takeaway'];

function fillPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template
  );
}

function validateOutput(obj: unknown): LLMOutput | null {
  const validTypes = ['main', 'followup', 'supplementary', 'clarification', 'skip', 'closing'] as const;
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.question !== 'string' || !o.question) return null;

  const result: LLMOutput = {
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : '',
    acknowledgment: typeof o.acknowledgment === 'string' ? o.acknowledgment : '',
    question: o.question,
    questionType: validTypes.includes(o.questionType as LLMOutput['questionType'])
      ? (o.questionType as LLMOutput['questionType'])
      : 'main',
    isDone: o.isDone === true,
    currentElement: ELEMENT_KEYS.includes(o.currentElement as ElementKey)
      ? (o.currentElement as ElementKey)
      : null,
  };

  // Optional elementProgress
  if (
    o.elementProgress &&
    typeof o.elementProgress === 'object' &&
    !Array.isArray(o.elementProgress)
  ) {
    const ep = o.elementProgress as Record<string, unknown>;
    if (
      typeof ep.orientation === 'number' &&
      typeof ep.feelings === 'number' &&
      typeof ep.evaluation === 'number' &&
      typeof ep.takeaway === 'number'
    ) {
      result.elementProgress = {
        orientation: ep.orientation,
        feelings: ep.feelings,
        evaluation: ep.evaluation,
        takeaway: ep.takeaway,
      };
    }
  }

  return result;
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { structuredInput, turns, bookContext, interventionLevel, currentElement: clientElement, completedElements } = body;

  const genre = structuredInput.genre ?? 'book-review';
  const topicSentence = structuredInput.topicSentence ?? '교토에서의 사흘';
  const ideaReadiness = structuredInput.ideaReadiness ?? 'some';
  const writingFrequency = structuredInput.writingFrequency ?? 'few_per_month';

  const promptTemplate = readFileSync(join(process.cwd(), 'QnA_PROMPT.md'), 'utf-8');
  const systemPrompt = fillPrompt(promptTemplate, {
    writing_ability: WRITING_FREQUENCY_MAP[writingFrequency] ?? writingFrequency,
    genre: GENRE_MAP[genre] ?? genre,
    topic: topicSentence,
    idea_readiness: IDEA_READINESS_MAP[ideaReadiness] ?? ideaReadiness,
  });

  let finalSystemPrompt = systemPrompt;

  // Add intervention level block
  if (interventionLevel) {
    const params = INTERVENTION_PARAMS[interventionLevel];
    const label = INTERVENTION_LABEL[interventionLevel];
    const interventionBlock = [
      '[개입 수준 — 반드시 준수]',
      `이 세션의 개입 수준은 ${label}(${interventionLevel}단계)이다.`,
      '',
      `- 즉각 구체화 발동 기준 (${params.followupThreshold}):`,
      '  - off: 즉각 구체화 프롬프트를 발동하지 않는다. 답변 깊이와 무관하게 다음 메인 질문으로 넘어간다.',
      '  - low: 답변이 한 문장 이하이거나 단순 감정어("좋았다" 등)일 때만 발동한다.',
      '  - medium: 답변이 짧거나 진부할 때 발동한다 (표준 동작).',
      '  - high: 답변이 구체적이지 않거나 일반적인 서술일 때도 발동한다.',
      '  - very_high: 답변에 원하는 정보가 다 없다면 발동한다.',
      `- 4요소별 종료 임계값: elementProgress의 모든 요소가 ${params.completionThreshold} 이상일 때만 세션 종료를 고려한다.`,
      '  임계값 미달 요소가 있으면 해당 요소에 대한 서브 질문을 추가로 던진다.',
      '---',
      '',
    ].join('\n');
    finalSystemPrompt = interventionBlock + finalSystemPrompt;
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
    finalSystemPrompt = bookBlock + finalSystemPrompt;
  }

  // Client-owned element state — prepended LAST so it sits at the very top of the
  // system prompt. This pins which element to ask now and which are already done,
  // so the model can't re-infer (and drift back to) an earlier element.
  if (clientElement) {
    const curLabel = ELEMENT_LABEL_KO[clientElement];
    const compLabels = (completedElements ?? []).map((e) => ELEMENT_LABEL_KO[e]);
    const elementStateBlock = [
      '[현재 세션 상태 — 반드시 준수]',
      `현재 다루고 있는 요소: ${curLabel}`,
      `이미 완료된 요소: ${compLabels.length > 0 ? compLabels.join(', ') : '없음'}`,
      '',
      `- 이번 턴의 질문은 반드시 "${curLabel}" 요소를 겨냥한다. currentElement 필드도 이 요소로 반환한다.`,
      `- "${curLabel}" 요소가 완성도 임계값에 도달할 때까지 이 요소를 벗어나지 않는다. 다른 요소로 화제를 옮기지 않는다.`,
      '- 이미 완료된 요소로 절대 되돌아가지 않는다. 완료된 요소를 다시 캐묻지 않는다.',
      '- 단, 사용자가 명시적으로 건너뛰기를 요청하면 questionType "skip"으로 표시하고, 아직 완료되지 않은 다음 순서의 요소로 넘어가 그 요소의 메인 질문을 던진다.',
      '---',
      '',
    ].join('\n');
    finalSystemPrompt = elementStateBlock + finalSystemPrompt;
  } else if (clientElement === null) {
    // All four elements complete → wrap up.
    const elementStateBlock = [
      '[현재 세션 상태 — 반드시 준수]',
      '네 요소(외적 사실 · 감정·반응 · 평가 · 깨달음·여운)가 모두 완료되었다.',
      '추가 질문 없이 세션을 마무리한다. (isDone: true, questionType: "closing")',
      '---',
      '',
    ].join('\n');
    finalSystemPrompt = elementStateBlock + finalSystemPrompt;
  }

  const nonIntroTurns = turns.filter((t) => t.type !== 'intro');
  const mapped: LLMMessage[] = nonIntroTurns.map((t) => ({
    role: t.role === 'user' ? 'user' : 'assistant',
    content: t.content,
  }));
  // LLM APIs require messages to start with a user role.
  // Prepend the session-start sentinel if the first stored turn is an assistant turn.
  const llmMessages: LLMMessage[] =
    mapped.length === 0 || mapped[0].role === 'assistant'
      ? [{ role: 'user', content: '시작해요.' }, ...mapped]
      : mapped;

  try {
    const { object } = await generateObject({
      model: upstage(SOLAR_MODEL),
      output: 'no-schema',
      system: finalSystemPrompt,
      messages: llmMessages,
    });

    const validated = validateOutput(object);
    if (!validated) {
      console.error('[QA validate FAILED] object was:', JSON.stringify(object));
      return NextResponse.json({ error: 'LLM output validation failed' }, { status: 500 });
    }

    const { reasoning, acknowledgment, question, questionType, isDone, elementProgress, currentElement } = validated;

    // Log elementProgress for each turn
    const progressStr = elementProgress
      ? `O:${elementProgress.orientation} F:${elementProgress.feelings} E:${elementProgress.evaluation} T:${elementProgress.takeaway}`
      : 'N/A';

    console.log(
      `[QA turn] type=${questionType} | 주입element=${clientElement ?? '(all done)'} | LLM반환element=${currentElement ?? '-'} | 진행도=[${progressStr}] | 완료=[${(completedElements ?? []).join(', ')}]`
    );
    console.log(`[QA reasoning] ${reasoning}`);
    const content = acknowledgment ? `${acknowledgment}\n\n${question}` : question;
    const type: QATurnType = isDone ? 'closing' : 'llm-generated';

    // Session log — one file per session, overwritten on each turn (always shows latest full state)
    try {
      const logsDir = join(process.cwd(), 'logs');
      mkdirSync(logsDir, { recursive: true });
      const sessionKey = turns[0]?.id?.slice(0, 8) ?? `new-${Date.now()}`;
      const logPath = join(logsDir, `qa-session-${sessionKey}.json`);
      const transcript = [
        ...nonIntroTurns,
        {
          role: 'assistant' as const,
          type,
          content: acknowledgment || undefined,
          question,
          reasoning,
          questionType,
          isDone,
          elementProgress,
          currentElement,
        },
      ];
      writeFileSync(logPath, JSON.stringify({
        meta: {
          genre: GENRE_MAP[genre] ?? genre,
          topic: topicSentence,
          writingFrequency: WRITING_FREQUENCY_MAP[writingFrequency] ?? writingFrequency,
          interventionLevel: interventionLevel ?? null,
          interventionLabel: interventionLevel ? INTERVENTION_LABEL[interventionLevel] : null,
          completionThreshold: interventionLevel ? INTERVENTION_PARAMS[interventionLevel].completionThreshold : null,
          updatedAt: new Date().toISOString(),
        },
        transcript,
      }, null, 2), 'utf-8');
    } catch {
      // logging failure must not break the response
    }

    return NextResponse.json({ content, type, questionType, isDone, elementProgress, currentElement });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    console.error('[QA ERROR] LLM call failed');
    console.error('[QA ERROR] Message:', errorMsg);
    console.error('[QA ERROR] Stack:', errorStack);
    if (err && typeof err === 'object' && 'response' in err) {
      console.error('[QA ERROR] Response:', (err as any).response);
    }
    return NextResponse.json({ error: 'LLM call failed', detail: errorMsg }, { status: 500 });
  }
}
