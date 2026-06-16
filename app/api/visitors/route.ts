import { NextRequest } from 'next/server';

const GAS_URL = process.env.GAS_WEB_APP_URL!;

// 랜딩 페이지 방문 기록. ip는 서버에서 주입, 나머지는 클라이언트가 전송.
// visitors 시트 헤더: id | landingUrl | ip | referer | time_stamp | utm | device
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    landingUrl: string;
    referer: string;
    time_stamp: string;
    utm: string;
    device: string;
  };

  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';

  const data = { ...body, ip };

  const params = new URLSearchParams();
  params.append('action', 'insert');
  params.append('table', 'visitors');
  params.append('data', JSON.stringify(data));

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return Response.json(await res.json());
  } catch {
    return Response.json({ success: false }, { status: 502 });
  }
}
