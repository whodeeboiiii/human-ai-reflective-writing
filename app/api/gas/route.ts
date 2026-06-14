const GAS_URL = process.env.GAS_WEB_APP_URL!;

export async function POST(req: Request) {
  const body = await req.json(); // { action, table, id?, data? }
  const params = new URLSearchParams();
  Object.entries(body).forEach(([k, v]) => {
    params.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  });

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  return Response.json(await res.json());
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = new URL(GAS_URL);
  searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  return Response.json(await res.json());
}
