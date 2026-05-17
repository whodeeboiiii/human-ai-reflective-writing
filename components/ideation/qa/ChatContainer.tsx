'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import {
  INTRO_FIRST,
  QUESTIONS,
  CLOSING,
  GENRE_LABELS,
  MOCK_CONTEXT,
} from '@/lib/data/qa';
import type { QATurnType } from '@/types/ideation';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatInput } from './ChatInput';
import { BackConfirmModal } from './BackConfirmModal';
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
  const { addTurn } = useIdeationStore();

  const genreLabel = answers.genre ? (GENRE_LABELS[answers.genre] ?? MOCK_CONTEXT.genreLabel) : MOCK_CONTEXT.genreLabel;
  const topicSentence = answers.topicSentence ?? MOCK_CONTEXT.topicSentence;
  const sessionStart = useRef(nowStamp()).current;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMsg, setStreamingMsg] = useState<ChatMessage | null>(null);
  const [thinkingState, setThinkingState] = useState<ThinkingState | null>(null);
  const [composerEnabled, setComposerEnabled] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Ref-based handoffs between async flow and React event handlers
  const onStreamEndRef = useRef<(() => void) | null>(null);
  const onUserInputRef = useRef<((text: string, skipped: boolean) => void) | null>(null);
  const mountedRef = useRef(true);
  const lastSpeakerRef = useRef<'assistant' | 'user' | null>(null);
  const qIndexRef = useRef(0);
  const addTurnRef = useRef(addTurn);
  addTurnRef.current = addTurn;

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('qa');
    return () => {
      document.body.classList.remove('qa');
      mountedRef.current = false;
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
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

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

  function addUserMessage(text: string, skipped: boolean) {
    if (!mountedRef.current) return;
    const isCont = lastSpeakerRef.current === 'user';
    lastSpeakerRef.current = 'user';
    const id = crypto.randomUUID();
    const timestamp = nowStamp();
    const msg: ChatMessage = { id, role: 'user', content: text, type: 'user', isCont, timestamp, skipped };
    setMessages((prev) => [...prev, msg]);
    addTurnRef.current({ id, role: 'user', content: text, type: 'predefined', isCont, skipped, timestamp });
    scrollToBottom();
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

  function think(ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (!mountedRef.current) { resolve(); return; }
      const isCont = lastSpeakerRef.current === 'assistant';
      setThinkingState({ isCont, timestamp: nowStamp() });
      setTimeout(() => {
        if (mountedRef.current) setThinkingState(null);
        resolve();
      }, ms);
    });
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ── Boot sequence (runs once on mount) ──
  useEffect(() => {
    const intro2 = `${genreLabel}에 관한 글, 그리고 "${topicSentence}"라는 주제로 함께 출발해볼게요. 질문에 정답은 없어요. 떠오르는 대로 편하게 답해주시면 돼요.`;

    async function askNext(): Promise<void> {
      if (!mountedRef.current) return;
      if (qIndexRef.current >= QUESTIONS.length) {
        await delay(320);
        await think(900);
        if (!mountedRef.current) return;
        await streamMessage(CLOSING.content, 'closing');
        if (mountedRef.current) setIsDone(true);
        return;
      }
      const q = QUESTIONS[qIndexRef.current++];
      await think(850);
      if (!mountedRef.current) return;
      await streamMessage(q.content, q.type);
      if (!mountedRef.current) return;
      const { text, skipped } = await waitForUser();
      addUserMessage(text, skipped);
      await askNext();
    }

    async function boot() {
      await delay(320);
      if (!mountedRef.current) return;
      await streamMessage(INTRO_FIRST.content, 'intro');
      await delay(380);
      if (!mountedRef.current) return;
      await streamMessage(intro2, 'intro');
      await askNext();
    }

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Event handlers wired to ChatInput ──
  function handleSend(text: string) {
    const cb = onUserInputRef.current;
    if (!cb) return;
    onUserInputRef.current = null;
    cb(text, false);
  }

  function handleSkip() {
    const cb = onUserInputRef.current;
    if (!cb) return;
    onUserInputRef.current = null;
    cb('', true);
  }

  return (
    <div>
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

      {/* Thread */}
      <main className={styles.qaStage} id="qa-stage">
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
      </main>

      {/* Composer */}
      <ChatInput
        enabled={composerEnabled}
        done={isDone}
        onSend={handleSend}
        onSkip={handleSkip}
      />

      {/* Back-navigation confirmation modal */}
      <BackConfirmModal
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => router.push(`/app/write/${sessionId}/structured-input`)}
      />
    </div>
  );
}
