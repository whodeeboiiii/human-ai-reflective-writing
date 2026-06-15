import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return Response.json({ success: false, error: 'id 누락' }, { status: 400 });
  }

  const gasRes = await fetch(new URL('/api/gas', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'like',
      table: 'community_posts',
      id,
    }),
  });

  const gasJson = await gasRes.json();
  if (!gasJson.success) {
    return Response.json({ success: false, error: gasJson.data?.error ?? 'GAS 오류' }, { status: 500 });
  }

  return Response.json({ success: true, data: { id: gasJson.data.id, likes: Number(gasJson.data.likes) } });
}
