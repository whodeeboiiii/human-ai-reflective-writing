'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import {
  INTRO_FIRST,
  GENRE_LABELS,
  MOCK_CONTEXT,
} from '@/lib/data/qa';
import type { QATurnType, QATurn, BookContext, ElementProgress, ElementKey } from '@/types/ideation';
import type { InterventionLevel } from '@/types/intervention';
import {
  computeBaselineNeed,
  computeFinalIntervention,
  INTERVENTION_PARAMS,
  INTERVENTION_LABEL,
} from '@/lib/intervention';
import { StageIntroToast } from '@/components/common/StageIntroToast';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatInput } from './ChatInput';
import { BackConfirmModal } from './BackConfirmModal';
import { SidePanel } from './SidePanel';
import styles from './ideation-qa.module.css';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type: string;
  isCont: boolean;
  timestamp: string;
  skipped?: boolean;
}

interface ThinkingState {
  isCont: boolean;
  timestamp: string;
}

function nowStamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}


export default function ChatContainer({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { answers } = useStructuredInputStore();
  const addTurn = useIdeationStore((s) => s.addTurn);
  const setTurns = useIdeationStore((s) => s.setTurns);
  // Reactive subscriptions — side panel must re-render as turns/progress change
  const turns = useIdeationStore((s) => s.turns);
  const elementProgress = useIdeationStore((s) => s.elementProgress);
  const answerSummaries = useIdeationStore((s) => s.answerSummaries);

  const genreLabel = answers.genre ? (GENRE_LABELS[answers.genre] ?? MOCK_CONTEXT.genreLabel) : MOCK_CONTEXT.genreLabel;
  const topicSentence = answers.topicSentence ?? MOCK_CONTEXT.topicSentence;
  const sessionStart = useRef(nowStamp()).current;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMsg, setStreamingMsg] = useState<ChatMessage | null>(null);
  const [thinkingState, setThinkingState] = useState<ThinkingState | null>(null);
  const [composerEnabled, setComposerEnabled] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentElement, setCurrentElement] = useState<ElementKey | null>(null);

  // Ref-based handoffs between async flow and React event handlers
  const onStreamEndRef = useRef<(() => void) | null>(null);
  const onUserInputRef = useRef<((text: string, skipped: boolean) => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const hasBootedRef = useRef(false);
  const lastSpeakerRef = useRef<'assistant' | 'user' | null>(null);
  // Most recent user answer awaiting a summarize decision (made once questionType is known).
  const lastUserAnswerRef = useRef<{ id: string; text: string } | null>(null);
  // Server-owned state, echoed back on every API call (server is authoritative).
  const currentElementRef = useRef<ElementKey | null>('orientation');
  const completedElementsRef = useRef<ElementKey[]>([]);
  const skippedElementsRef = useRef<ElementKey[]>([]);
  const clarifyStreakRef = useRef<number>(0);
  const addTurnRef = useRef(addTurn);
  addTurnRef.current = addTurn;

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('qa');
    return () => {
      document.body.classList.remove('qa');
    };
  }, []);

  // Keyboard: Escape closes modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (stage && stage.scrollHeight > stage.clientHeight) {
        // Fixed layout (>1200px): stage is the scroll container — scroll it directly.
        stage.scrollTop = stage.scrollHeight;
      } else {
        // Tablet static layout: whole page scrolls.
        scrollAnchorRef.current?.scrollIntoView({ block: 'end' });
      }
    });
  }, []);

  const handleImportSession = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content) as { transcript: QATurn[] };
        if (!Array.isArray(json.transcript)) {
          alert('Invalid log format: transcript is not an array');
          return;
        }
        setTurns(json.transcript);
        setMessages(
          json.transcript
            .filter((t) => t.type !== 'intro')
            .map((t) => ({
              id: t.id,
              role: t.role,
              content: t.content,
              type: t.type,
              isCont: t.isCont ?? false,
              timestamp: t.timestamp ?? '00:00',
              skipped: t.skipped,
            }))
        );
        setComposerEnabled(true);
        alert(`Session imported: ${json.transcript.length} turns loaded`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        alert(`Failed to import: ${err instanceof Error ? err.message : 'Unknown error'}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }, [setTurns]);

  // Called by AIMessage when streaming ends
  const handleStreamEnd = useCallback(() => {
    onStreamEndRef.current?.();
  }, []);

  // ── Async flow helpers (defined in component body, access refs safely) ──

  function streamMessage(content: string, type: string): Promise<void> {
    return new Promise((resolve) => {
      if (!mountedRef.current) { resolve(); return; }
      const isCont = lastSpeakerRef.current === 'assistant';
      lastSpeakerRef.current = 'assistant';
      const id = crypto.randomUUID();
      const timestamp = nowStamp();
      const msg: ChatMessage = { id, role: 'assistant', content, type, isCont, timestamp };
      setStreamingMsg(msg);
      onStreamEndRef.current = () => {
        if (!mountedRef.current) { resolve(); return; }
        setMessages((prev) => [...prev, msg]);
        setStreamingMsg(null);
        addTurnRef.current({ id, role: 'assistant', content, type: type as QATurnType, isCont, timestamp });
        resolve();
      };
    });
  }

  function addUserMessage(text: string) {
    if (!mountedRef.current) return;
    const isCont = lastSpeakerRef.current === 'user';
    lastSpeakerRef.current = 'user';
    const id = crypto.randomUUID();
    const timestamp = nowStamp();
    const msg: ChatMessage = { id, role: 'user', content: text, type: 'user', isCont, timestamp };
    setMessages((prev) => [...prev, msg]);
    addTurnRef.current({ id, role: 'user', content: text, type: 'predefined', isCont, timestamp });
    // Hold this answer; whether we summarize it is decided after the next question's
    // questionType is known (only main/followup answers get a side-panel summary).
    lastUserAnswerRef.current = { id, text };
    scrollToBottom();
  }

  // Fire-and-forget: condense the answer to a one-line key point for the side panel.
  // On failure the panel falls back to the raw answer (graceful degradation).
  async function summarizeAnswer(id: string, text: string) {
    try {
      const res = await fetch('/api/ideation/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const { summary } = (await res.json()) as { summary: string };
      if (summary && mountedRef.current) {
        useIdeationStore.getState().setAnswerSummary(id, summary);
      }
    } catch {
      // ignore — raw answer remains shown
    }
  }

  function waitForUser(): Promise<string> {
    return new Promise((resolve) => {
      setComposerEnabled(true);
      onUserInputRef.current = (text) => {
        setComposerEnabled(false);
        resolve(text);
      };
    });
  }

  // Show the "thinking" indicator on the AI side. Stays up until hideThinking()
  // is called (i.e. for the whole duration the LLM is actually working).
  function showThinking(): void {
    if (!mountedRef.current) return;
    const isCont = lastSpeakerRef.current === 'assistant';
    setThinkingState({ isCont, timestamp: nowStamp() });
  }

  function hideThinking(): void {
    setThinkingState(null);
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ── Boot sequence (runs once on mount) ──
  useEffect(() => {
    // React Strict Mode fires effects twice; reset mountedRef and guard against double-boot.
    mountedRef.current = true;
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    // Each Q&A session starts fresh — discard any turns from a previous run.
    useIdeationStore.getState().reset();
    currentElementRef.current = 'orientation';
    completedElementsRef.current = [];
    skippedElementsRef.current = [];
    clarifyStreakRef.current = 0;

    const liveAnswers = useStructuredInputStore.getState().answers;
    const liveGenreLabel = liveAnswers.genre
      ? (GENRE_LABELS[liveAnswers.genre] ?? MOCK_CONTEXT.genreLabel)
      : MOCK_CONTEXT.genreLabel;
    const liveTopicSentence = liveAnswers.topicSentence ?? MOCK_CONTEXT.topicSentence;
    const intro2 = `${liveGenreLabel}에 관한 글, 그리고 "${liveTopicSentence}"라는 주제로 함께 출발해볼게요. 질문에 정답은 없어요. 떠오르는 대로 편하게 답해주시면 돼요.`;

    async function askNext(): Promise<void> {
      if (!mountedRef.current) return;
      // Show "thinking" the moment the LLM call begins, and keep it visible for the
      // whole call. A minimum visible time prevents flicker on fast responses.
      showThinking();
      const minVisible = delay(650);
      let res: Response;
      try {
        res = await fetch('/api/ideation/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structuredInput: useStructuredInputStore.getState().answers,
            turns: useIdeationStore.getState().turns,
            bookContext: useIdeationStore.getState().bookContext,
            interventionLevel: useIdeationStore.getState().interventionLevel,
            // Echo back the server-owned state machine values from the previous turn.
            currentElement: currentElementRef.current,
            completedElements: completedElementsRef.current,
            skippedElements: skippedElementsRef.current,
            clarifyStreak: clarifyStreakRef.current,
            elementProgress: useIdeationStore.getState().elementProgress,
          }),
        });
      } catch (err) {
        hideThinking();
        console.error('questions API fetch failed', err);
        return;
      }
      if (!res.ok) {
        hideThinking();
        console.error('questions API error', res.status);
        return;
      }
      const {
        content, type, questionType, isDone,
        currentElement, completedElements, skippedElements, clarifyStreak, elementProgress,
      } =
        (await res.json()) as {
          content: string;
          type: QATurnType;
          questionType?: 'main' | 'followup' | 'clarification' | 'skip' | 'closing';
          isDone: boolean;
          currentElement: ElementKey | null;
          completedElements: ElementKey[];
          skippedElements: ElementKey[];
          clarifyStreak: number;
          elementProgress: ElementProgress;
        };

      // ── Server owns the state machine — just store what it returned. ──
      useIdeationStore.getState().setElementProgress(elementProgress);
      currentElementRef.current = currentElement;
      completedElementsRef.current = completedElements;
      skippedElementsRef.current = skippedElements ?? [];
      clarifyStreakRef.current = clarifyStreak ?? 0;
      // Side-panel highlight: the element this turn's question targets.
      const gaugeElement: ElementKey | null = currentElement;

      // Summarize the just-answered user turn ONLY if it led to a real question
      // (main/followup). skip/clarification answers get no side-panel summary.
      const pendingAnswer = lastUserAnswerRef.current;
      lastUserAnswerRef.current = null;
      if (pendingAnswer && (questionType === 'main' || questionType === 'followup')) {
        // Mark the turn as panel-eligible immediately (shows raw text until the
        // summary arrives), then fill in the one-line summary asynchronously.
        useIdeationStore.getState().setAnswerSummary(pendingAnswer.id, '');
        summarizeAnswer(pendingAnswer.id, pendingAnswer.text);
      }
      await minVisible; // keep the indicator up for at least the minimum beat
      if (!mountedRef.current) return;
      hideThinking();
      setCurrentElement(gaugeElement);
      await streamMessage(content, type);
      if (isDone) {
        if (mountedRef.current) setIsDone(true);
        return;
      }
      if (!mountedRef.current) return;
      const text = await waitForUser();
      addUserMessage(text);
      await askNext();
    }

    async function fetchBookContext(): Promise<void> {
      const answers = useStructuredInputStore.getState().answers;
      if (answers.genre !== 'book-review' || !answers.topicSentence) return;

      // Use book selected during structured input if available
      const selectedBook = useStructuredInputStore.getState().selectedBookContext;
      if (selectedBook) {
        useIdeationStore.getState().setBookContext(selectedBook);
        return;
      }

      // Fallback: auto-fetch from topicSentence
      try {
        const res = await fetch(
          `/api/book-search?query=${encodeURIComponent(answers.topicSentence)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { bookContext: BookContext | null };
        if (data.bookContext) {
          useIdeationStore.getState().setBookContext(data.bookContext);
        }
      } catch {
        // graceful degradation — Q&A proceeds without book context
      }
    }

    function calculateAndStoreInterventionLevel(): void {
      const { writingFrequency, ideaReadiness, userInterventionWant } =
        useStructuredInputStore.getState().answers;

      let level: InterventionLevel;
      if (writingFrequency && ideaReadiness && userInterventionWant) {
        const baseline = computeBaselineNeed(writingFrequency, ideaReadiness);
        level = computeFinalIntervention(baseline, userInterventionWant);
        console.log(
          `[개입 수준] ${level}단계 (${INTERVENTION_LABEL[level]}) · baseline=${baseline} ` +
            `· inputs={빈도:${writingFrequency}, 준비도:${ideaReadiness}, 희망:${userInterventionWant}} ` +
            `· completionThreshold=${INTERVENTION_PARAMS[level].completionThreshold} ` +
            `· followupThreshold=${INTERVENTION_PARAMS[level].followupThreshold}`
        );
      } else {
        // fallback to 2 (낮음) if any field is missing
        level = 2;
        console.log(
          `[개입 수준] fallback 2단계 (${INTERVENTION_LABEL[2]}) · 입력 누락 ` +
            `{빈도:${writingFrequency ?? '-'}, 준비도:${ideaReadiness ?? '-'}, 희망:${userInterventionWant ?? '-'}}`
        );
      }
      useIdeationStore.getState().setInterventionLevel(level);
    }

    async function boot() {
      // Calculate intervention level immediately
      calculateAndStoreInterventionLevel();

      // Start book search in parallel with intro messages
      const bookSearchPromise = fetchBookContext();

      await delay(320);
      if (!mountedRef.current) return;
      await streamMessage(INTRO_FIRST.content, 'intro');
      await delay(380);
      if (!mountedRef.current) return;
      await streamMessage(intro2, 'intro');

      // Ensure book context is ready before first LLM call
      await bookSearchPromise;

      await askNext();
    }

    boot();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Event handlers wired to ChatInput ──
  function handleSend(text: string) {
    const cb = onUserInputRef.current;
    if (!cb) return;
    onUserInputRef.current = null;
    cb(text, false);
  }

  return (
    <div className={styles.qaRoot}>
      {/* Stage intro toast */}
      <StageIntroToast
        eyebrow="Q&A Session · 안내"
        title="편하게 대화하듯 답해주세요"
        body="질문에 정답은 없어요. 경험이나 생각이 떠오르는 대로 이야기해 주시면 돼요. 건너뛰고 싶으면 그렇게 말해줘도 괜찮아요."
        durationMs={5000}
      />

      {/* Top Bar */}
      <header className={styles.qaTop}>
        <button
          type="button"
          className={styles.qaBack}
          onClick={() => setShowModal(true)}
          aria-label="이전 단계로"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 18 5 12 11 6" />
          </svg>
          <span>뒤로</span>
        </button>

        <div className={styles.qaStepIndicator} aria-label="Step 2 of 3">
          <span className={styles.qaStepLabel}>Step</span>
          <span className={styles.qaStepCur}>02</span>
          <span className={styles.qaStepOf}>/</span>
          <span className={styles.qaStepTotal}>03</span>
          <span className={styles.qaStepName}>Q&amp;A Session</span>
        </div>

        <Link href="/app" className={styles.qaMark} aria-label="Flect 홈">
          <span className={styles.qaMarkGlyph} aria-hidden="true" />
          <span>Flect</span>
        </Link>
      </header>

      {/* Two-Column Layout: Thread + Side Panel */}
      <main className={styles.qaStageWrapper}>
        <div className={styles.qaStage} id="qa-stage" ref={stageRef}>
          <div className={styles.qaThread} aria-live="polite" aria-relevant="additions">
          {/* Session header */}
          <div className={styles.qaSessionHead}>
            <p className={styles.qaEyebrow}>Session · Begun {sessionStart}</p>
            <h1 className={styles.qaSessionTitle}>
              함께 이야기를
              <br />
              <span className="emph">풀어볼 시간이에요.</span>
            </h1>
            <p className={styles.qaSessionMeta}>
              <span className={styles.qaContextPill}>
                <span className={styles.dot} />
                {genreLabel}
              </span>
              <span className={styles.qaContextSep}>·</span>
              <span className={styles.qaContextTopic}>{topicSentence}</span>
            </p>
          </div>

          {/* Conversation turns */}
          {messages.map((msg) =>
            msg.role === 'assistant' ? (
              <AIMessage
                key={msg.id}
                content={msg.content}
                isCont={msg.isCont}
                timestamp={msg.timestamp}
              />
            ) : (
              <UserMessage
                key={msg.id}
                content={msg.content}
                isCont={msg.isCont}
                timestamp={msg.timestamp}
                skipped={msg.skipped}
              />
            ),
          )}

          {/* Active streaming message */}
          {streamingMsg && (
            <AIMessage
              key={streamingMsg.id}
              content={streamingMsg.content}
              isCont={streamingMsg.isCont}
              timestamp={streamingMsg.timestamp}
              isStreaming
              onStreamEnd={handleStreamEnd}
              onWordReveal={scrollToBottom}
            />
          )}

          {/* Thinking indicator */}
          {thinkingState && (
            <ThinkingIndicator
              isCont={thinkingState.isCont}
              timestamp={thinkingState.timestamp}
            />
          )}

          {/* Final CTA */}
          {isDone && (
            <div className={styles.qaFinal}>
              <p className={styles.qaFinalText}>
                Step 2 · <strong>Complete</strong>
              </p>
              <Link
                href={`/app/write/${sessionId}/outline`}
                className={`${styles.qaBtn} ${styles.qaBtnPrimary} ${styles.qaBtnLg}`}
              >
                <span>다음 단계로</span>
                <span className={styles.qaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={scrollAnchorRef} aria-hidden="true" />
          </div>
        </div>

        {/* Side Panel */}
        <SidePanel
          turns={turns}
          answerSummaries={answerSummaries}
          elementProgressMax={elementProgress}
          currentElement={currentElement}
          completionThreshold={
            INTERVENTION_PARAMS[useIdeationStore.getState().interventionLevel ?? 2].completionThreshold
          }
        />
      </main>

      {/* Composer */}
      <ChatInput
        enabled={composerEnabled}
        done={isDone}
        onSend={handleSend}
      />

      {/* Back-navigation confirmation modal */}
      <BackConfirmModal
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          // SurveyFlow will also reset on mount, but reset here for immediate clarity.
          useIdeationStore.getState().reset();
          router.push(`/app/write/${sessionId}/structured-input`);
        }}
      />

      {/* Ghost action tray — bottom-right, appears on hover */}
      <div className={styles.qaGhostTray}>
        <Link
          href={`/app/write/${sessionId}/outline`}
          className={styles.qaGhostBtn}
          title="지금까지의 답변을 유지한 채로 다음 단계로 건너뜀"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
          <span>아웃라인으로 건너뛰기</span>
        </Link>
        <button
          type="button"
          className={styles.qaGhostBtn}
          onClick={() => fileInputRef.current?.click()}
          title="로그 파일 (JSON) 업로드해서 세션 복구"
          aria-label="세션 로그 임포트"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>임포트</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportSession}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
