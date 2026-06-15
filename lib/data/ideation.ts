import type { StructuredInput } from '@/types/structured-input';

export interface Choice {
  value: string;
  label: string;
  labelSub?: string;
  hint?: string;
  rank?: string;
}

export interface ChoiceScreenData {
  type: 'choices';
  eyebrow: string;
  question: string;
  sub?: string;
  answerKey: keyof StructuredInput;
  layout: 'list' | 'ordinal' | 'two-col';
  choices: Choice[];
}

export interface OpenScreenData {
  type: 'open';
  eyebrow: string;
  question: string;
  answerKey: 'topicSentence';
  placeholder: string;
  maxLength: number;
}

export interface SliderScreenData {
  type: 'slider';
  eyebrow: string;
  question: string;
  sub?: string;
  answerKey: keyof StructuredInput;
  choices: Choice[];
  labels?: { left: string; center: string; right: string };
}

export type QuestionScreenData = ChoiceScreenData | OpenScreenData | SliderScreenData;

export const SEQUENCE = [
  'intro',
  'genre',
  'topic',
  'ideaReadiness',
  'writingFrequency',
  'userInterventionWant',
  'optional-gate',
  'audience',
  'sharing',
  'venue',
  'tone',
  'length',
  'complete',
] as const;

export type ScreenName = (typeof SEQUENCE)[number];

export const MAIN_SCREENS: ScreenName[] = [
  'genre',
  'topic',
  'ideaReadiness',
  'writingFrequency',
  'userInterventionWant',
];
export const OPTIONAL_SCREENS: ScreenName[] = [
  'audience',
  'sharing',
  'venue',
  'tone',
  'length',
];

export const SCREENS_DATA: Partial<Record<ScreenName, QuestionScreenData>> = {
  genre: {
    type: 'choices',
    eyebrow: 'Question 1 of 5',
    question: '어떤 글을 쓰고 싶으신가요?',
    answerKey: 'genre',
    layout: 'list',
    choices: [
      { value: 'book-review',    label: '독후감',         hint: '읽은 책에 대한 감상과 생각' },
      { value: 'place-review',   label: '장소 리뷰',      hint: '다녀온 장소에 대한 솔직한 후기' },
      { value: 'movie-review',   label: '영화·공연 리뷰', hint: '본 영화나 공연에 대한 감상' },
      { value: 'product-review', label: '제품 리뷰',      hint: '써본 제품에 대한 평가' },
      { value: 'travelogue',     label: '여행기',         hint: '다녀온 곳에 대한 경험과 인상' },
      { value: 'reflection',     label: '성찰 일지',      hint: '일상과 경험을 돌아보는 글' },
    ],
  },

  topic: {
    type: 'open',
    eyebrow: 'Question 2 of 5',
    question: '쓰고 싶은 글의 주제나 소재를\n한 문장으로 적어주세요.',
    answerKey: 'topicSentence',
    placeholder:
      '예: 지난주 방문한 작은 카페에 대해 / 김영하의 『작별인사』를 읽고 든 생각 / ...',
    maxLength: 200,
  },

  ideaReadiness: {
    type: 'choices',
    eyebrow: 'Question 3 of 5',
    question: '쓸 내용이 머릿속에\n얼마나 정리되어 있나요?',
    answerKey: 'ideaReadiness',
    layout: 'ordinal',
    choices: [
      { value: 'none',            label: '거의 없어요, 또는 잘 모르겠어요' },
      { value: 'little',          label: '조금 있어요, 단편적인 생각들이 떠올라요' },
      { value: 'some',            label: '어느 정도 있어요, 큰 줄기는 잡혀 있어요' },
      { value: 'much',            label: '꽤 많이 있어요' },
      { value: 'almost_complete', label: '거의 다 있어요, 정리만 하면 돼요' },
    ],
  },

  writingFrequency: {
    type: 'choices',
    eyebrow: 'Question 4 of 5',
    question: '최근 1년 동안 글을 얼마나 자주 작성하셨나요?',
    sub: '글쓰기 빈도에 따라 AI의 개입 정도가 정해져요.',
    answerKey: 'writingFrequency',
    layout: 'ordinal',
    choices: [
      { value: 'daily',         label: '거의 매일' },
      { value: 'few_per_week',  label: '주에 두세 번' },
      { value: 'once_per_week', label: '주에 한 번' },
      { value: 'few_per_month', label: '한 달에 한두 번' },
      { value: 'rarely',        label: '거의 안 씀' },
    ],
  },

  userInterventionWant: {
    type: 'slider',
    eyebrow: 'Question 5 of 5',
    question: 'AI가 글에 얼마나 개입했으면 좋겠나요?',
    answerKey: 'userInterventionWant',
    choices: [
      { value: 'very_low',  label: '매우 낮음',  hint: '핵심 질문만 간단히 해줘요' },
      { value: 'low',       label: '낮음' },
      { value: 'neutral',   label: '보통',      hint: '적당히 도와주세요' },
      { value: 'high',      label: '높음' },
      { value: 'very_high', label: '매우 높음', hint: '최대한 깊이 파고들어 주세요' },
    ],
    labels: { left: '매우 낮음', center: '보통', right: '매우 높음' },
  },

  audience: {
    type: 'choices',
    eyebrow: 'Optional · 1 of 5',
    question: '이 글을 누가 읽었으면 하나요?',
    answerKey: 'audience',
    layout: 'list',
    choices: [
      { value: 'self',            label: '나 자신을 위해 쓰는 글이에요' },
      { value: 'close-circle',    label: '가까운 사람들', labelSub: '(친구, 가족)' },
      { value: 'interest-circle', label: '같은 관심사를 가진 사람들' },
      { value: 'public',          label: '더 넓은 대중' },
      { value: 'undecided',       label: '아직 정하지 못했어요' },
    ],
  },

  sharing: {
    type: 'choices',
    eyebrow: 'Optional · 2 of 5',
    question: '이 글을 다른 사람과\n공유할 생각이 있으신가요?',
    sub: '혼자 간직할 글인지, 누군가에게 보일 글인지에 따라 글의 결이 달라져요.',
    answerKey: 'sharing',
    layout: 'list',
    choices: [
      { value: 'private',   label: '나 자신을 위해 쓰는 글이에요' },
      { value: 'close',     label: '가까운 사람들에게만 보여줄 거예요' },
      { value: 'public',    label: '공개적으로 공유하고 싶어요' },
      { value: 'undecided', label: '아직 정하지 못했어요' },
    ],
  },

  venue: {
    type: 'choices',
    eyebrow: 'Optional · 3 of 5',
    question: '이 글을 어디에 올릴 예정인가요?',
    sub: '글이 머무를 공간을 알면, 그 공간의 결에 맞게 도와드릴 수 있어요.',
    answerKey: 'venue',
    layout: 'two-col',
    choices: [
      { value: 'personal-blog', label: '개인 블로그' },
      { value: 'community',     label: '온라인 커뮤니티' },
      { value: 'official',      label: '공식적인 웹사이트' },
      { value: 'review-site',   label: '리뷰 사이트' },
      { value: 'press',         label: '전문 매체' },
      { value: 'undecided',     label: '아직 모르겠어요' },
      { value: 'none',          label: '공유하지 않을 거예요' },
    ],
  },

  tone: {
    type: 'choices',
    eyebrow: 'Optional · 4 of 5',
    question: '어떤 느낌의 글이었으면 하나요?',
    answerKey: 'tone',
    layout: 'list',
    choices: [
      { value: 'warm',       label: '따뜻하고 개인적인' },
      { value: 'reflective', label: '성찰적이고 진지한' },
      { value: 'critical',   label: '날카롭고 비판적인' },
      { value: 'humorous',   label: '가볍고 유머러스한' },
      { value: 'undecided',  label: '잘 모르겠어요' },
    ],
  },

  length: {
    type: 'choices',
    eyebrow: 'Optional · 5 of 5',
    question: '어느 정도 길이의 글을\n생각하고 계신가요?',
    answerKey: 'expectedLength',
    layout: 'ordinal',
    choices: [
      { value: 'short',  label: '짧게', labelSub: '(300자 이내, 한두 문단)', rank: 'SM' },
      { value: 'medium', label: '보통', labelSub: '(300~1000자, 몇 문단)',    rank: 'MD' },
      { value: 'long',   label: '길게', labelSub: '(1000자 이상, 에세이 분량)', rank: 'LG' },
    ],
  },
};
