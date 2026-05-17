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

export type QuestionScreenData = ChoiceScreenData | OpenScreenData;

export const SEQUENCE = [
  'intro',
  'genre',
  'topic',
  'clarity',
  'experience',
  'importance',
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
  'clarity',
  'experience',
  'importance',
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
      { value: 'commentary',  label: '논평',       hint: '시사·이슈에 대한 견해와 입장' },
      { value: 'critique',    label: '비평 / 평론', hint: '작품·현상에 대한 분석과 평가' },
      { value: 'book-report', label: '독후감',      hint: '읽은 책에 대한 감상과 생각' },
      { value: 'review',      label: '리뷰',        hint: '경험한 것에 대한 솔직한 후기' },
      { value: 'travelogue',  label: '여행기',      hint: '다녀온 곳에 대한 경험과 인상' },
      { value: 'reflection',  label: '성찰 일지',   hint: '일상에서 길어 올린 작은 성찰' },
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

  clarity: {
    type: 'choices',
    eyebrow: 'Question 3 of 5',
    question: '쓸 내용이 머릿속에\n얼마나 정리되어 있나요?',
    answerKey: 'ideaClarity',
    layout: 'ordinal',
    choices: [
      { value: 'none',     label: '거의 없어요, 막연한 인상만 있어요' },
      { value: 'somewhat', label: '조금 있어요, 단편적인 생각들이 떠올라요' },
      { value: 'mostly',   label: '꽤 있어요, 큰 줄기는 잡혀 있어요' },
      { value: 'clear',    label: '거의 다 있어요, 정리만 하면 돼요' },
    ],
  },

  experience: {
    type: 'choices',
    eyebrow: 'Question 4 of 5',
    question: '글쓰기에 얼마나 익숙하신가요?',
    sub: '글쓰기에 익숙한 정도에 따라 AI의 개입 정도가 정해져요.',
    answerKey: 'writingExperience',
    layout: 'ordinal',
    choices: [
      { value: 'none',         label: '거의 안 써요' },
      { value: 'casual',       label: '가끔 써요',       labelSub: '(한 달에 한두 번)' },
      { value: 'frequent',     label: '자주 써요',       labelSub: '(주에 한두 번 이상)' },
      { value: 'professional', label: '글쓰기를 직업/전공으로 다뤄요' },
    ],
  },

  importance: {
    type: 'choices',
    eyebrow: 'Question 5 of 5',
    question: '이 글이 얼마나 잘 써져야 하나요?',
    sub: 'AI가 얼마나 깊이 도와드릴지 정하는 데 사용돼요.',
    answerKey: 'importance',
    layout: 'ordinal',
    choices: [
      { value: '1', label: '가볍게, 흘러가는 대로 쓰고 싶어요' },
      { value: '2', label: '적당히, 무난한 정도면 돼요' },
      { value: '3', label: '잘 쓰고 싶어요' },
      { value: '4', label: '아주 잘 써야 해요' },
    ],
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
