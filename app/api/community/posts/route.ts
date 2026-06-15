import { NextRequest } from 'next/server';
import type { CommunityPost } from '@/types/community';

type RawPost = CommunityPost & { author_ip?: string; author_device?: string; row?: number };

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

function strip(post: RawPost): CommunityPost {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { author_ip, author_device, row, ...safe } = post;
  return { ...safe, likes: Number(safe.likes) };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const scope = searchParams.get('scope');
  const deviceId = searchParams.get('device_id') ?? '';

  // 단건 조회
  if (id) {
    const gasRes = await fetch(
      new URL(`/api/gas?action=read&table=community_posts&id=${encodeURIComponent(id)}`, req.url)
    );
    const gasJson = await gasRes.json();
    if (!gasJson.success || !gasJson.data) {
      return Response.json({ success: false, error: '글을 찾을 수 없습니다' }, { status: 404 });
    }
    return Response.json({ success: true, data: strip(gasJson.data as RawPost) });
  }

  // 전체 목록 조회
  const gasRes = await fetch(
    new URL('/api/gas?action=read&table=community_posts', req.url)
  );
  const gasJson = await gasRes.json();
  if (!gasJson.success) {
    return Response.json({ success: false, error: 'GAS 오류' }, { status: 500 });
  }

  let posts = (gasJson.data as RawPost[]) ?? [];

  // scope=mine: IP(서버 주입) OR device_id(클라이언트 전송) OR 합집합 필터
  if (scope === 'mine') {
    const currentIp = getClientIp(req);
    posts = posts.filter(
      (p) => p.author_ip === currentIp || (deviceId && p.author_device === deviceId)
    );
  }

  return Response.json({ success: true, data: posts.map(strip) });
}
