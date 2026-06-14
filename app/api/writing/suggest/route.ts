import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';

interface SuggestRequest {
  genreLabel: string;
  topicSentence: string;
  outlineSummary: string;
  recentText: string;
}

const SYSTEM_TEMPLATE = `[ROLE]
너는 글쓰기를 돕는 AI 작가 파트너다.
사용자가 지금까지 쓴 글 다음에 자연스럽게 이어질 한 문장을 제안한다.

[INPUT]
- 글의 장르: {genreLabel}
- 글의 주제: {topicSentence}
- 글의 아웃라인:
{outlineSummary}
- 지금까지 작성한 글 (최근 500자):
{recentText}

[TASK]
위 글에서 다음에 자연스럽게 이어지는 문장 3가지를 생성한다.

[규칙]
- 각 제안은 정확히 한 문장이어야 한다. 마침표 또는 물음표로 끝난다.
- 3가지 제안은 서로 다른 방향이어야 한다. 같은 표현이나 구조를 반복하지 않는다.
- 사용자가 지금까지 사용한 어조와 문체를 유지한다.
- 아웃라인을 참고하되, 이미 다룬 내용을 반복하지 않는다.
- 사용자가 쓴 내용을 요약·재서술하지 않는다. 새로운 내용을 더한다.
- 두 문장 이상 출력하지 않는다.

[금지]
- 제안 앞에 번호·불릿·설명을 붙이지 않는다.
- 마크다운 서식을 사용하지 않는다.

[출력 형식]
반드시 아래 예시처럼 단 하나의 JSON 배열([]) 안에 3개의 문자열을 담아서 출력한다. 절대 다른 텍스트를 포함하지 않는다.
[
  "첫 번째 제안 문장",
  "두 번째 제안 문장",
  "세 번째 제안 문장"
]`;

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: SuggestRequest;
  try {
    body = (await req.json()) as SuggestRequest;
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }

  const systemPrompt = fill(SYSTEM_TEMPLATE, {
    genreLabel: body.genreLabel || '글',
    topicSentence: body.topicSentence || '(주제 미정)',
    outlineSummary: body.outlineSummary || '(아웃라인 없음)',
    recentText: body.recentText || '(아직 작성된 글 없음)',
  });

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: systemPrompt,
      messages: [{ role: 'user', content: '다음 문장 세 가지를 제안해 주세요.' }],
    });

    let parsed: unknown;
    try {
      let cleaned = text
        .trim()
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '');

      // Handle edge case where LLM outputs ["A"]\n["B"]\n["C"]
      if (cleaned.includes(']\n[') || cleaned.includes('][')) {
        cleaned = '[' + cleaned.replace(/\]\s*\[/g, '],[') + ']';
      }

      parsed = JSON.parse(cleaned);
      
      // Flatten if it parsed as [["A"], ["B"], ["C"]]
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        parsed = parsed.flat();
      }
    } catch (err) {
      console.error('[writing/suggest] JSON parse error:', err, 'Text:', text);
      
      // Fallback: extract string literals
      const matches = text.match(/"([^"]+)"/g);
      if (matches && matches.length >= 3) {
        parsed = matches.map(s => {
          try { return JSON.parse(s); } catch { return s.replace(/(^"|"$)/g, ''); }
        });
      } else {
        return NextResponse.json({ error: 'suggestion parsing failed' }, { status: 500 });
      }
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'suggestion parsing failed' }, { status: 500 });
    }

    const suggestions = parsed
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim());

    if (suggestions.length < 3) {
      console.error('[writing/suggest] Not enough suggestions. Length:', suggestions.length, 'Data:', suggestions);
      return NextResponse.json({ error: 'not enough suggestions' }, { status: 500 });
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
  } catch (err) {
    console.error('[writing/suggest] LLM error:', err);
    return NextResponse.json({ error: 'suggestion generation failed' }, { status: 500 });
  }
}
