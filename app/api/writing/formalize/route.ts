import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';

interface FormalizeRequest {
  genreLabel: string;
  audienceLabel: string;
  venueLabel: string;
  selectedText: string;
  surroundingContext: string;
}

const SYSTEM_TEMPLATE = `[ROLE]
너는 한국어 글쓰기 스타일 전문가다.
선택된 텍스트의 격식 수준과 어휘를 독자와 게시 장소에 맞게 조정한다.
문법 교정이 아니라 어조·어휘·문장 구조의 스타일 조정이 목적이다.
내용(사실, 의견, 감정, 논지)은 절대 바꾸지 않는다.

[INPUT]
- 글의 장르: {genreLabel}
- 예상 독자: {audienceLabel}
- 게시·제출 장소: {venueLabel}
- 앞뒤 맥락:
{surroundingContext}
- 스타일 조정 대상:
{selectedText}

[TASK]
스타일 조정 대상 텍스트를 예상 독자와 게시 장소에 어울리는 격식 수준과 어휘로 다듬은 버전을 반환한다.

[규칙]
- 내용(사실, 의견, 감정, 논지)은 절대 바꾸지 않는다. 스타일·어조·어휘만 조정한다.
- 예상 독자와 게시 장소가 가이드다. 격식이 높은 장소(학교 제출, 공식 포럼)이면 어조를 더 단정하게, 가벼운 공간(개인 블로그, SNS)이면 자연스러운 구어체도 허용한다.
- 문장 구조를 지나치게 바꾸거나 동의어로 전면 교체하지 않는다. 어색한 구어·은어·지나치게 격식 없는 표현만 교체한다.
- 원문이 이미 적합한 격식 수준이면 원문 그대로 반환한다.
- 수정 이유나 설명을 붙이지 않는다.

[출력 형식]
조정된 텍스트만 출력한다. JSON이나 마크다운 없이 순수 텍스트만.`;

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: FormalizeRequest;
  try {
    body = (await req.json()) as FormalizeRequest;
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  if (!body.selectedText || body.selectedText.trim().length === 0) {
    return NextResponse.json({ error: 'no text to formalize' }, { status: 400 });
  }

  const systemPrompt = fill(SYSTEM_TEMPLATE, {
    genreLabel: body.genreLabel || '글',
    audienceLabel: body.audienceLabel || '일반 독자',
    venueLabel: body.venueLabel || '일반적인 글쓰기 공간',
    surroundingContext: body.surroundingContext || body.selectedText,
    selectedText: body.selectedText,
  });

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: systemPrompt,
      messages: [{ role: 'user', content: '위 텍스트의 스타일을 조정해 주세요.' }],
    });

    const formalizedText = text
      .trim()
      .replace(/^```(?:[a-z]*)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    if (!formalizedText) {
      return NextResponse.json({ error: 'formalize generation failed' }, { status: 500 });
    }

    return NextResponse.json({ formalizedText });
  } catch (err) {
    console.error('[writing/formalize] LLM error:', err);
    return NextResponse.json({ error: 'formalize generation failed' }, { status: 500 });
  }
}
