import { NextRequest } from 'next/server';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { author_nickname, genre, title, content, outline_json, tags, device_id } = body;

  if (!author_nickname || !genre || !title || !content) {
    return Response.json({ success: false, error: '필수 필드 누락' }, { status: 400 });
  }

  const author_ip = getClientIp(req);

  const gasRes = await fetch(new URL('/api/gas', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'insert',
      table: 'community_posts',
      data: { author_nickname, author_ip, author_device: device_id ?? '', genre, title, content, outline_json: outline_json ?? '', tags: tags ?? '' },
    }),
  });

  const gasJson = await gasRes.json();
  if (!gasJson.success) {
    return Response.json({ success: false, error: gasJson.data?.error ?? 'GAS 오류' }, { status: 500 });
  }

  return Response.json({ success: true, id: gasJson.data.id });
}
