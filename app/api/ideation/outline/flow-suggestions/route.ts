import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { upstage, SOLAR_MODEL } from '@/lib/upstage';
import type { MaterialCard, FlowSuggestion } from '@/types/ideation';

const PROMPT_TEMPLATE = readFileSync(join(process.cwd(), 'OUTLINE_FLOW_PROMPT.md'), 'utf-8');

interface RequestBody {
  genreLabel: string;
  topicSentence: string;
  cards: MaterialCard[];
}

interface RawSuggestion {
  label?: unknown;
  cardOrder?: unknown;
  transitions?: unknown;
  rationale?: unknown;
}

function fillPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{${k}}`, v),
    template,
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { genreLabel, topicSentence, cards } = body;

  if (!Array.isArray(cards) || cards.length < 3) {
    return NextResponse.json({ error: 'not enough cards' }, { status: 400 });
  }

  const cardIds = new Set(cards.map((c) => c.id));

  // Format cards as JSON for the prompt
  const cardsJson = JSON.stringify(
    cards.map((c) => ({ id: c.id, content: c.content, sourceElement: c.sourceElement })),
    null,
    2,
  );

  const systemPrompt = fillPrompt(PROMPT_TEMPLATE, {
    genreLabel,
    topicSentence,
    cardsJson,
  });

  try {
    const { text } = await generateText({
      model: upstage(SOLAR_MODEL),
      system: systemPrompt,
      messages: [{ role: 'user', content: '흐름 후보 두 가지를 제안해 주세요.' }],
    });

    let parsed: unknown;
    try {
      const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'flow suggestion failed', detail: 'JSON parse error' },
        { status: 500 },
      );
    }

    const root = parsed as { suggestions?: unknown };
    if (!root || !Array.isArray(root.suggestions)) {
      return NextResponse.json(
        { error: 'flow suggestion failed', detail: 'Expected { suggestions: [...] }' },
        { status: 500 },
      );
    }

    const rawSuggestions = root.suggestions as RawSuggestion[];

    const suggestions: FlowSuggestion[] = [];
    for (const raw of rawSuggestions) {
      if (!Array.isArray(raw.cardOrder)) continue;

      const cardOrder = raw.cardOrder as unknown[];

      // Validate: all ids are valid strings from input cards, no duplicates
      const seen = new Set<string>();
      let valid = true;
      for (const id of cardOrder) {
        if (typeof id !== 'string' || !cardIds.has(id) || seen.has(id)) {
          valid = false;
          break;
        }
        seen.add(id);
      }
      if (!valid) continue;

      const transitions = Array.isArray(raw.transitions)
        ? (raw.transitions as unknown[]).map((t) => (typeof t === 'string' ? t : null))
        : (cardOrder as string[]).map(() => null);

      suggestions.push({
        id: crypto.randomUUID(),
        label: typeof raw.label === 'string' ? raw.label : '제안',
        cardOrder: cardOrder as string[],
        transitions,
        rationale: typeof raw.rationale === 'string' ? raw.rationale : '',
      });

      if (suggestions.length === 2) break;
    }

    if (suggestions.length === 0) {
      return NextResponse.json(
        { error: 'flow suggestion failed', detail: 'No valid suggestions parsed' },
        { status: 500 },
      );
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('Upstage API error:', err);
    return NextResponse.json({ error: 'flow suggestion failed' }, { status: 500 });
  }
}
