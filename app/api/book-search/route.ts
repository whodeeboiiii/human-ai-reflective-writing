import { NextResponse } from 'next/server';
import type { BookContext } from '@/types/ideation';

interface NaverBookItem {
  title: string;
  author: string;
  publisher: string;
  description: string;
}

interface NaverBookResponse {
  items?: NaverBookItem[];
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, '').trim();
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const display = Math.min(Math.max(parseInt(searchParams.get('display') ?? '1', 10), 1), 10);

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[book-search] NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set');
    return NextResponse.json({ bookContext: null, results: [] });
  }

  try {
    const url = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}&display=${display}`;
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!res.ok) {
      console.error('[book-search] Naver API responded', res.status);
      return NextResponse.json({ bookContext: null, results: [] });
    }

    const data = (await res.json()) as NaverBookResponse;

    if (!data.items || data.items.length === 0) {
      console.log(`[book-search] query="${query}" → 검색 결과 없음`);
      return NextResponse.json({ bookContext: null, results: [] });
    }

    const results: BookContext[] = data.items.map((item) => ({
      title: stripHtml(item.title),
      author: stripHtml(item.author),
      publisher: stripHtml(item.publisher),
      description: stripHtml(item.description),
    }));

    const bookContext = results[0];

    console.log(
      `[book-search] query="${query}" display=${display} → ${results.length}건 · 첫번째="${bookContext.title}" · 저자="${bookContext.author}"`
    );

    return NextResponse.json({ bookContext, results });
  } catch (err) {
    console.error('[book-search] fetch error:', err);
    return NextResponse.json({ bookContext: null, results: [] });
  }
}
