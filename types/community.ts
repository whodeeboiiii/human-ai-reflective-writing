import type { GenreValue } from './structured-input';

// 실제 ideation.ts 라벨과 1:1 대응 (source of truth: lib/data/ideation.ts)
export type Genre =
  | '독후감'
  | '장소 리뷰'
  | '영화·공연 리뷰'
  | '제품 리뷰'
  | '여행기'
  | '성찰 일지';

export const GENRES: Genre[] = [
  '독후감',
  '장소 리뷰',
  '영화·공연 리뷰',
  '제품 리뷰',
  '여행기',
  '성찰 일지',
];

export const GENRE_LABEL: Record<GenreValue, Genre> = {
  'book-review': '독후감',
  'place-review': '장소 리뷰',
  'movie-review': '영화·공연 리뷰',
  'product-review': '제품 리뷰',
  travelogue: '여행기',
  reflection: '성찰 일지',
};

export type SortOrder = 'latest' | 'popular';

export interface CommunityPost {
  id: string;
  author_nickname: string;
  // author_ip, author_device: API 응답에서 서버가 제거함
  genre: Genre;
  title: string;
  content: string;
  outline_json: string; // JSON.parse 해서 사용
  tags: string;         // "a,b,c" → split(',')
  publish_date: string;
  likes: number;
}

export interface PublishInput {
  author_nickname: string;
  genre: Genre;
  title: string;
  content: string;
  outline_json: string;
  tags: string;
  device_id: string;
}
