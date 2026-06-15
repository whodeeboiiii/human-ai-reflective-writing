import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';

/**
 * 디버그 전용: 제목 + 장르로부터 약 500자 분량의 한국어 개인 에세이 본문을 생성한다.
 * outline 등은 사용하지 않으며, 커뮤니티 시드용 더미 본문을 빠르게 만들기 위한 용도.
 * 본문은 Tiptap/커뮤니티가 그대로 렌더할 수 있도록 <p> 단락 HTML로 반환한다.
 */
interface RequestBody {
  title?: string;
  genre?: string;
  tags?: string;
}

function buildSystem(genre: string): string {
  return [
    '너는 비전문 필자가 쓴 듯한 진솔한 개인 에세이를 대신 써 주는 작가다.',
    `글의 종류는 "${genre}"이다.`,
    '',
    '규칙:',
    '- 주어진 제목에 정확히 어울리는 본문을 쓴다.',
    '- 분량은 공백 포함 약 450~550자(한국어).',
    '- 2~3개의 문단으로 구성한다.',
    '- 1인칭 시점, 구체적인 장면·감정·생각이 담긴 담백한 구어체.',
    '- 과장된 미사여구나 광고 문구를 피하고, 실제 경험담처럼 쓴다.',
    '- 제목을 본문에 그대로 반복하지 않는다.',
    '',
    '출력 형식(반드시 준수):',
    '- 각 문단을 <p>...</p> 로 감싼 HTML만 출력한다.',
    '- <p> 외의 태그, 마크다운, 머리말("본문:" 등), 따옴표 래핑은 절대 쓰지 않는다.',
  ].join('\n');
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  const genre = (body.genre ?? '글').trim();
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const prompt = [
    `제목: ${title}`,
    body.tags ? `참고 태그: ${body.tags}` : '',
    '',
    '위 제목에 어울리는 본문을 규칙대로 써라.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: buildSystem(genre),
      prompt,
    });

    let content = text.trim().replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
    // 모델이 <p> 없이 평문/줄바꿈으로만 반환한 경우 단락을 <p>로 감싼다.
    if (!/<p[\s>]/i.test(content)) {
      content = content
        .split(/\n{2,}|\n/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => `<p>${para}</p>`)
        .join('');
    }

    if (!content) {
      return NextResponse.json({ error: 'empty generation' }, { status: 502 });
    }
    return NextResponse.json({ content });
  } catch (err) {
    console.error('[debug generate-content] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'LLM call failed' }, { status: 500 });
  }
}
