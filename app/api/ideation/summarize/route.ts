import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';

interface RequestBody {
  text: string;
}

// Simple one-shot prompt: condense a single answer to one key-point line.
const SUMMARY_SYSTEM = [
  '너는 사용자의 답변에서 핵심만 뽑아 한 줄로 요약하는 도우미다.',
  '규칙:',
  '- 한국어로, 한 줄(최대 35자)로 요약한다.',
  '- 답변에서 가장 중요한 포인트(장면·감정·생각) 하나만 남긴다.',
  '- 사용자의 답변을 그대로 옮기지 말고, 핵심을 압축한 명사구/짧은 구문으로 만든다.',
  '- "요약:" 같은 접두어, 따옴표, 군더더기 없이 핵심 내용만 출력한다.',
].join('\n');

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  if (!text) {
    return NextResponse.json({ summary: '' });
  }

  try {
    const { text: raw } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: SUMMARY_SYSTEM,
      prompt: text,
    });
    // Strip wrapping quotes / whitespace / accidental prefixes.
    const summary = raw
      .trim()
      .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
      .replace(/^요약\s*[:：]\s*/, '')
      .trim();
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('summarize API error:', err);
    // Graceful degradation — empty summary means the caller keeps the raw answer.
    return NextResponse.json({ summary: '' });
  }
}
