export interface QAScript {
  type: 'intro' | 'predefined' | 'llm-generated' | 'closing';
  content: string;
}

export const GENRE_LABELS: Record<string, string> = {
  'book-review': '독후감',
  'place-review': '장소 리뷰',
  'movie-review': '영화·공연 리뷰',
  'product-review': '제품 리뷰',
  travelogue: '여행기',
  reflection: '성찰 일지',
};

// First INTRO message is static; second is generated in ChatContainer using store answers.
export const INTRO_FIRST: QAScript = {
  type: 'intro',
  content: '안녕하세요. 함께 이야기를 풀어볼 시간이에요.',
};

// Fallback context used when structured-input store is empty (dev / direct navigation)
export const MOCK_CONTEXT = {
  genreLabel: '여행기',
  topicSentence: '교토에서의 사흘',
};

