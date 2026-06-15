'use client';

import { useState, useEffect, useRef } from 'react';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import { INTRO_FIRST, GENRE_LABELS, MOCK_CONTEXT } from '@/lib/data/qa';
import type { QATurnType, BookContext, ElementProgress, ElementKey } from '@/types/ideation';
import { logEvent } from '@/lib/events';

export interface QuickChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type: string;
  isCont: boolean;
  timestamp: string;
  skipped?: boolean;
}

export interface QuickThinking {
  isCont: boolean;
  timestamp: string;
}

type QType = 'main' | 'followup' | 'clarification' | 'skip' | 'closing';

const SKIP_TEXT = '다음으로 넘어갈게요.';
const ZERO_PROGRESS: ElementProgress = { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 };

function nowStamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface QuestionResponse {
  content: string;
  type: QATurnType;
  // questionType = 직전 답변 intent 라벨(사이드패널용). 생성된 질문의 타입은 nextQuestionType.
  questionType?: QType;
  nextQuestionType?: QType;
  isDone: boolean;
  currentElement: ElementKey | null;
  completedElements: ElementKey[];
  skippedElements: ElementKey[];
  clarifyStreak: number;
  elementProgress: ElementProgress;
  mainAsked: number;
  followupBudget: number;
}

/**
 * Quick Mode Q&A 오케스트레이션. ChatContainer의 검증된 ref-기반 async 패턴을 재사용하되,
 * Quick 전용으로 축약/확장한다:
 *  - 매 턴 mode:'quick' + 예산 상태(mainAsked/followupBudget/lastQType) echo (서버 예산 머신 §4.7)
 *  - 명시적 skip(forceSkip) 지원
 *  - SidePanel 요약 대신 ProgressCircles용 상태 노출 (currentElement/progress/completed)
 *  - 개입도 계산 없음, qa_done 로깅
 */
export function useQuickIdeation() {
  const [messages, setMessages] = useState<QuickChatMessage[]>([]);
  const [streamingMsg, setStreamingMsg] = useState<QuickChatMessage | null>(null);
  const [thinking, setThinking] = useState<QuickThinking | null>(null);
  const [composerEnabled, setComposerEnabled] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentElement, setCurrentElement] = useState<ElementKey | null>(null);
  const [elementProgress, setElementProgressState] = useState<ElementProgress>(ZERO_PROGRESS);
  const [completedElements, setCompletedElements] = useState<ElementKey[]>([]);
  const [currentQType, setCurrentQType] = useState<QType | null>(null);
  const [mainAnswered, setMainAnswered] = useState(0);

  // Ref handoffs between the async flow and React event handlers.
  const onStreamEndRef = useRef<(() => void) | null>(null);
  const onUserInputRef = useRef<((text: string, skipped: boolean) => void) | null>(null);
  const mountedRef = useRef(true);
  const hasBootedRef = useRef(false);
  const lastSpeakerRef = useRef<'assistant' | 'user' | null>(null);

  // Server-owned state echoed back every turn (server is authoritative).
  const currentElementRef = useRef<ElementKey | null>('orientation');
  const completedElementsRef = useRef<ElementKey[]>([]);
  const skippedElementsRef = useRef<ElementKey[]>([]);
  const clarifyStreakRef = useRef<number>(0);
  // Quick budget state.
  const mainAskedRef = useRef<number>(0);
  const followupBudgetRef = useRef<number>(4);
  const lastQTypeRef = useRef<QType | null>(null);

  // Called by AIMessage when streaming ends.
  const handleStreamEnd = () => onStreamEndRef.current?.();

  useEffect(() => {
    mountedRef.current = true;
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    // Fresh session — discard any prior turns/progress.
    useIdeationStore.getState().reset();
    currentElementRef.current = 'orientation';
    completedElementsRef.current = [];
    skippedElementsRef.current = [];
    clarifyStreakRef.current = 0;
    mainAskedRef.current = 0;
    followupBudgetRef.current = 4;
    lastQTypeRef.current = null;

    const liveAnswers = useStructuredInputStore.getState().answers;
    const liveGenreLabel = liveAnswers.genre
      ? (GENRE_LABELS[liveAnswers.genre] ?? MOCK_CONTEXT.genreLabel)
      : MOCK_CONTEXT.genreLabel;
    const liveTopic = liveAnswers.topicSentence ?? MOCK_CONTEXT.topicSentence;
    const intro2 = `${liveGenreLabel}에 관한 글, 그리고 "${liveTopic}"라는 주제로 함께 출발해볼게요. 질문에 정답은 없어요. 떠오르는 대로 편하게 답해주시면 돼요.`;

    function delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function streamMessage(content: string, type: string): Promise<void> {
      return new Promise((resolve) => {
        if (!mountedRef.current) return resolve();
        const isCont = lastSpeakerRef.current === 'assistant';
        lastSpeakerRef.current = 'assistant';
        const id = crypto.randomUUID();
        const timestamp = nowStamp();
        const msg: QuickChatMessage = { id, role: 'assistant', content, type, isCont, timestamp };
        setStreamingMsg(msg);
        onStreamEndRef.current = () => {
          if (!mountedRef.current) return resolve();
          setMessages((prev) => [...prev, msg]);
          setStreamingMsg(null);
          useIdeationStore.getState().addTurn({ id, role: 'assistant', content, type: type as QATurnType, isCont, timestamp });
          resolve();
        };
      });
    }

    function addUserMessage(text: string, skipped: boolean) {
      if (!mountedRef.current) return;
      const isCont = lastSpeakerRef.current === 'user';
      lastSpeakerRef.current = 'user';
      const id = crypto.randomUUID();
      const timestamp = nowStamp();
      setMessages((prev) => [...prev, { id, role: 'user', content: text, type: 'user', isCont, timestamp, skipped }]);
      useIdeationStore.getState().addTurn({ id, role: 'user', content: text, type: 'predefined', isCont, timestamp, skipped });
      // Floor counter: a real answer to a main question counts toward the §4.5 floor.
      if (!skipped && lastQTypeRef.current === 'main') {
        setMainAnswered((n) => n + 1);
      }
    }

    function waitForUser(): Promise<{ text: string; skipped: boolean }> {
      return new Promise((resolve) => {
        setComposerEnabled(true);
        onUserInputRef.current = (text, skipped) => {
          setComposerEnabled(false);
          resolve({ text, skipped });
        };
      });
    }

    function showThinking() {
      if (!mountedRef.current) return;
      setThinking({ isCont: lastSpeakerRef.current === 'assistant', timestamp: nowStamp() });
    }
    function hideThinking() {
      setThinking(null);
    }

    async function fetchBookContext(): Promise<void> {
      const a = useStructuredInputStore.getState().answers;
      if (a.genre !== 'book-review' || !a.topicSentence) return;
      const selected = useStructuredInputStore.getState().selectedBookContext;
      if (selected) {
        useIdeationStore.getState().setBookContext(selected);
        return;
      }
      try {
        const res = await fetch(`/api/book-search?query=${encodeURIComponent(a.topicSentence)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { bookContext: BookContext | null };
        if (data.bookContext) useIdeationStore.getState().setBookContext(data.bookContext);
      } catch {
        /* graceful degradation */
      }
    }

    async function askNext(forceSkip = false): Promise<void> {
      if (!mountedRef.current) return;
      showThinking();
      const minVisible = delay(650);
      let res: Response;
      try {
        res = await fetch('/api/ideation/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'quick',
            structuredInput: useStructuredInputStore.getState().answers,
            turns: useIdeationStore.getState().turns,
            bookContext: useIdeationStore.getState().bookContext,
            // Echoed server-owned state.
            currentElement: currentElementRef.current,
            completedElements: completedElementsRef.current,
            skippedElements: skippedElementsRef.current,
            clarifyStreak: clarifyStreakRef.current,
            elementProgress: useIdeationStore.getState().elementProgress,
            // Quick budget state.
            mainAsked: mainAskedRef.current,
            followupBudget: followupBudgetRef.current,
            lastQType: lastQTypeRef.current,
            forceSkip,
          }),
        });
      } catch (err) {
        hideThinking();
        console.error('quick questions fetch failed', err);
        return;
      }
      if (!res.ok) {
        hideThinking();
        console.error('quick questions API error', res.status);
        return;
      }
      const data = (await res.json()) as QuestionResponse;

      // Store authoritative server state.
      useIdeationStore.getState().setElementProgress(data.elementProgress);
      currentElementRef.current = data.currentElement;
      completedElementsRef.current = data.completedElements;
      skippedElementsRef.current = data.skippedElements ?? [];
      clarifyStreakRef.current = data.clarifyStreak ?? 0;
      mainAskedRef.current = data.mainAsked ?? mainAskedRef.current;
      followupBudgetRef.current = data.followupBudget ?? followupBudgetRef.current;
      // 생성된 질문의 실제 타입 (직전 intent 라벨인 questionType이 아니라 nextQuestionType).
      // skip 환불 판단(서버) · skip 버튼 활성화 · floor 카운트가 모두 이 값에 의존.
      lastQTypeRef.current = data.nextQuestionType ?? null;

      await minVisible;
      if (!mountedRef.current) return;
      hideThinking();

      // Drive ProgressCircles + skip-button state.
      setCurrentElement(data.currentElement);
      setElementProgressState(data.elementProgress);
      setCompletedElements(data.completedElements);
      setCurrentQType(data.nextQuestionType ?? null);

      await streamMessage(data.content, data.type);

      if (data.isDone) {
        if (mountedRef.current) setIsDone(true);
        logEvent('qa_done');
        return;
      }
      if (!mountedRef.current) return;
      const input = await waitForUser();
      addUserMessage(input.text, input.skipped);
      await askNext(input.skipped);
    }

    async function boot() {
      const bookSearchPromise = fetchBookContext();
      await delay(320);
      if (!mountedRef.current) return;
      await streamMessage(INTRO_FIRST.content, 'intro');
      await delay(380);
      if (!mountedRef.current) return;
      await streamMessage(intro2, 'intro');
      await bookSearchPromise;
      await askNext(false);
    }

    boot();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function sendAnswer(text: string) {
    const cb = onUserInputRef.current;
    if (!cb) return;
    onUserInputRef.current = null;
    cb(text, false);
  }

  function skip() {
    const cb = onUserInputRef.current;
    if (!cb) return;
    onUserInputRef.current = null;
    cb(SKIP_TEXT, true);
  }

  return {
    messages,
    streamingMsg,
    thinking,
    composerEnabled,
    isDone,
    currentElement,
    elementProgress,
    completedElements,
    currentQType,
    mainAnswered,
    handleStreamEnd,
    sendAnswer,
    skip,
  };
}
