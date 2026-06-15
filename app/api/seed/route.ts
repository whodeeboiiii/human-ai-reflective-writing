// 일회성 시드 라우트. 사용 후 삭제하세요.
// GET /api/seed 를 한 번 호출하면 community_posts에 10개 행이 삽입됩니다.

import { NextRequest } from 'next/server';

const LIPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const SEEDS = [
  { author_nickname: '책읽는곰',   genre: '독후감',         title: '「채식주의자」를 읽고',          tags: '한강,소설,부커상',    likes: 24 },
  { author_nickname: '여행자K',    genre: '여행기',         title: '교토 골목길에서의 사흘',          tags: '교토,일본,혼여행',    likes: 18 },
  { author_nickname: '밤의글쓴이', genre: '영화·공연 리뷰', title: '봉준호 영화의 공간 미학',          tags: '영화,봉준호,비평',    likes: 31 },
  { author_nickname: '산책러',     genre: '장소 리뷰',      title: '북촌 카페 다섯 곳 솔직 후기',      tags: '카페,서울,북촌',      likes: 12 },
  { author_nickname: '책읽는곰',   genre: '독후감',         title: '「82년생 김지영」다시 읽기',       tags: '조남주,페미니즘,소설', likes: 9  },
  { author_nickname: '루나로그',   genre: '여행기',         title: '포르투갈 리스본 2주 여행기',       tags: '리스본,포르투갈,유럽', likes: 44 },
  { author_nickname: '시네필A',    genre: '영화·공연 리뷰', title: '칸 2024 황금종려상작 단평',        tags: '칸영화제,리뷰,2024',  likes: 7  },
  { author_nickname: '글귀모음',   genre: '성찰 일지',      title: '현대시에서 고독의 형태들',         tags: '시,현대시,문학비평',  likes: 15 },
  { author_nickname: '밤의글쓴이', genre: '독후감',         title: '「파친코」가 남긴 질문들',         tags: '이민진,역사소설,가족', likes: 29 },
  { author_nickname: '키보드워리어', genre: '제품 리뷰',    title: '기계식 키보드 3개월 사용기',       tags: '키보드,가젯,생산성',  likes: 21 },
] as const;

const GAS_URL = process.env.GAS_WEB_APP_URL!;

async function insertOne(data: Record<string, unknown>): Promise<{ success: boolean; id?: string; error?: string }> {
  const params = new URLSearchParams();
  params.set('action', 'insert');
  params.set('table', 'community_posts');
  params.set('data', JSON.stringify(data));

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const json = await res.json();
  return json.success
    ? { success: true, id: json.data?.id }
    : { success: false, error: json.data?.error ?? 'GAS 오류' };
}

export async function GET(_req: NextRequest) {
  const results: { title: string; id?: string; error?: string }[] = [];

  for (const seed of SEEDS) {
    const result = await insertOne({
      author_nickname: seed.author_nickname,
      author_ip: 'seed',
      author_device: 'seed-device',
      genre: seed.genre,
      title: seed.title,
      content: LIPSUM,
      outline_json: '',
      tags: seed.tags,
      likes: seed.likes,
    });
    results.push({ title: seed.title, ...result });
  }

  const failed = results.filter((r) => !r.id);
  return Response.json({
    success: failed.length === 0,
    inserted: results.filter((r) => r.id).length,
    failed: failed.length,
    results,
  });
}
