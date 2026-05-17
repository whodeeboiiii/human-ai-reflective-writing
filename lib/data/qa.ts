export interface QAScript {
  type: 'intro' | 'predefined' | 'llm-generated' | 'closing';
  content: string;
}

export const GENRE_LABELS: Record<string, string> = {
  commentary: '논평',
  critique: '비평 / 평론',
  'book-report': '독후감',
  review: '리뷰',
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

export const QUESTIONS: QAScript[] = [
  { type: 'predefined',    content: '이 여행이 당신에게 어떤 의미였나요?' },
  { type: 'predefined',    content: '여행 중 가장 인상 깊게 남은 한 장면을 떠올려본다면요?' },
  { type: 'predefined',    content: '그 장면 속에서 어떤 감정이 가장 컸나요?' },
  { type: 'llm-generated', content: '방금 말씀하신 "혼자만의 시간"이라는 표현이 마음에 남아요. 그 시간이 평소의 일상과 어떻게 달랐나요?' },
  { type: 'predefined',    content: '여행을 떠나기 전과 다녀온 후, 당신 안에서 무엇이 달라졌나요?' },
  { type: 'predefined',    content: '이 글을 통해 독자에게 가장 전하고 싶은 한 가지가 있다면요?' },
];

export const CLOSING: QAScript = {
  type: 'closing',
  content: '좋아요. 충분히 나눴어요. 이제 당신의 이야기를 하나의 흐름으로 엮어볼 차례예요.',
};
