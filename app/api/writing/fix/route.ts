import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';

interface FixRequest {
  genreLabel: string;
  audienceLabel: string;
  selectedText: string;
  surroundingContext: string;
}

const SYSTEM_TEMPLATE = `[ROLE]
너는 한국어 글쓰기 교정 전문가다.
선택된 텍스트의 문법과 표현을 교정한다.
내용(사실, 의견, 감정)은 절대 바꾸지 않는다.

[INPUT]
- 글의 장르: {genreLabel}
- 예상 독자: {audienceLabel}
- 앞뒤 맥락:
{surroundingContext}
- 교정 대상:
{selectedText}

[TASK]
교정 대상 텍스트의 문법 오류, 맞춤법, 어색한 표현을 교정한 버전을 반환한다.

[규칙]
- 내용(사실, 의견, 감정, 논지)은 절대 바꾸지 않는다. 표현 방식만 교정한다.
- 사용자의 문체와 어조를 최대한 유지한다.
- 불필요하게 문장을 길게 늘리거나 내용을 추가하지 않는다.
- 원문이 이미 올바른 경우 원문 그대로 반환한다.
- 수정 이유나 설명을 붙이지 않는다.

[출력 형식]
교정된 텍스트만 출력한다. JSON이나 마크다운 없이 순수 텍스트만.`;

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: FixRequest;
  try {
    body = (await req.json()) as FixRequest;
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  if (!body.selectedText || body.selectedText.trim().length === 0) {
    return NextResponse.json({ error: 'no text to fix' }, { status: 400 });
  }

  const systemPrompt = fill(SYSTEM_TEMPLATE, {
    genreLabel: body.genreLabel || '글',
    audienceLabel: body.audienceLabel || '일반 독자',
    surroundingContext: body.surroundingContext || body.selectedText,
    selectedText: body.selectedText,
  });

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: systemPrompt,
      messages: [{ role: 'user', content: '위 교정 대상을 교정해 주세요.' }],
    });

    const correctedText = text
      .trim()
      .replace(/^```(?:[a-z]*)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    if (!correctedText) {
      return NextResponse.json({ error: 'fix generation failed' }, { status: 500 });
    }

    return NextResponse.json({ correctedText });
  } catch (err) {
    console.error('[writing/fix] LLM error:', err);
    return NextResponse.json({ error: 'fix generation failed' }, { status: 500 });
  }
}
