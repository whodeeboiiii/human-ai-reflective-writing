import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';
import type { QATurn, MaterialCard, SourceElement } from '@/types/ideation';
import type { StructuredInput } from '@/types/structured-input';

const PROMPT_TEMPLATE = readFileSync(join(process.cwd(), 'OUTLINE_MAT_PROMPT.md'), 'utf-8');

const GENRE_MAP: Record<string, string> = {
  critique: '비평/평론',
  'book-report': '독후감',
  review: '리뷰',
  travelogue: '여행기',
};

const LENGTH_MAP: Record<string, string> = {
  short: '짧게 (단편)',
  medium: '보통',
  long: '길게 (장편)',
};

const VALID_SOURCE_ELEMENTS: SourceElement[] = ['orientation', 'feelings', 'evaluation', 'takeaway'];

interface RequestBody {
  structuredInput: Partial<StructuredInput>;
  turns: QATurn[];
}

function fillPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template,
  );
}

function buildTranscript(turns: QATurn[]): string {
  return turns
    .filter((t) => t.type !== 'intro' && t.type !== 'closing')
    .map((t) => {
      if (t.role === 'assistant') return `AI: ${t.content}`;
      return `사용자: ${t.skipped ? '(건너뜀)' : t.content}`;
    })
    .join('\n');
}

function validateSourceElement(value: unknown): SourceElement {
  if (typeof value === 'string' && (VALID_SOURCE_ELEMENTS as string[]).includes(value)) {
    return value as SourceElement;
  }
  return 'orientation';
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { structuredInput, turns } = body;

  const nonIntroTurns = turns.filter((t) => t.type !== 'intro' && t.type !== 'closing');
  if (nonIntroTurns.length === 0) {
    return NextResponse.json({ error: 'No Q&A turns found' }, { status: 400 });
  }

  const genre = structuredInput.genre ?? 'travelogue';
  const topicSentence = structuredInput.topicSentence ?? '';
  const expectedLength = structuredInput.expectedLength ?? 'medium';

  const genreLabel = GENRE_MAP[genre] ?? genre;
  const lengthLabel = LENGTH_MAP[expectedLength] ?? expectedLength;
  const qaTranscript = buildTranscript(turns);

  const systemPrompt = fillPrompt(PROMPT_TEMPLATE, {
    genreLabel,
    topicSentence,
    lengthLabel,
    qaTranscript,
  });

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: systemPrompt,
      messages: [{ role: 'user', content: '재료 카드를 작성해 주세요.' }],
    });

    let parsed: unknown;
    try {
      // Strip markdown code fences if present
      const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'card generation failed', detail: 'JSON parse error' },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'card generation failed', detail: 'Expected JSON array' },
        { status: 500 },
      );
    }

    const rawCards = parsed as { content?: unknown; sourceElement?: unknown }[];

    const cards: MaterialCard[] = rawCards
      .filter((item) => {
        if (typeof item.content !== 'string') return false;
        const c = item.content.trim();
        return c.length > 0 && c.length <= 200;
      })
      .slice(0, 16)
      .map((item) => ({
        id: crypto.randomUUID(),
        content: (item.content as string).trim(),
        sourceElement: validateSourceElement(item.sourceElement),
        isEdited: false,
      }));

    if (cards.length < 4) {
      return NextResponse.json(
        { error: 'card generation failed', detail: `Only ${cards.length} valid cards` },
        { status: 500 },
      );
    }

    return NextResponse.json({ cards });
  } catch (err) {
    console.error('Upstage API error:', err);
    return NextResponse.json({ error: 'card generation failed' }, { status: 500 });
  }
}
