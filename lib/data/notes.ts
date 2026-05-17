import type { Note } from '@/types/writing';

export const NOTES: Note[] = [
  {
    id: 'a',
    title: '비 오는 날의 도서관',
    preview:
      '오랜만에 도서관에 들렀다. 빗소리와 책장 넘기는 소리가 묘하게 잘 어울려서, 한참을 가만히 앉아 있었다…',
    modified: '오늘',
    tag: '성찰 일지',
  },
  {
    id: 'b',
    title: '「작별인사」를 읽고',
    preview:
      '김영하의 신작을 마침내 읽었다. AI와 인간의 경계에 대한 질문이 생각보다 오래 남았다…',
    modified: '어제',
    tag: '독후감',
  },
  {
    id: 'c',
    title: '교토에서의 사흘',
    preview:
      '여름 끝자락의 교토는 생각보다 한적했다. 기온의 골목길을 걷다가 우연히 들어간 작은 다실에서…',
    modified: '5일 전',
    tag: '여행기',
  },
];
