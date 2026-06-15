'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuickIdeation } from '@/hooks/useQuickIdeation';
import { ProgressCircles } from './ProgressCircles';
import { SkipGuard } from './SkipGuard';
import { MinQuestionWarning } from './MinQuestionWarning';
import { AIMessage } from '@/components/ideation/qa/AIMessage';
import { UserMessage } from '@/components/ideation/qa/UserMessage';
import { ThinkingIndicator } from '@/components/ideation/qa/ThinkingIndicator';
import { logEvent } from '@/lib/events';
import styles from './quick-qa.module.css';

// Quick Mode Q&A 화면 (§4, §9). 상단 ProgressCircles · 중앙 채팅 · 하단 sticky 입력.
export default function QuickQASession({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const q = useQuickIdeation();
  const [value, setValue] = useState('');
  const [showFloor, setShowFloor] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() =>
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [q.messages, q.streamingMsg, q.thinking, q.isDone, scrollToBottom]);

  useEffect(() => {
    if (!q.composerEnabled) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [q.composerEnabled]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || !q.composerEnabled) return;
    q.sendAnswer(trimmed);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSkip() {
    if (!q.composerEnabled) return;
    q.skip();
    setValue('');
  }

  function goOutline() {
    router.push(`/app/write/${sessionId}/outline`);
  }

  // 정상 종료 후 Outline 이동 — floor 미달이면 경고 (§4.5). qa_done은 hook이 isDone 시 적재.
  function proceed() {
    if (q.mainAnswered < 4) {
      setShowFloor(true);
      return;
    }
    goOutline();
  }

  // Q&A 통째 스킵 (§4.6) — 작게 배치, 클릭 시 qa_skipped 로깅.
  function wholeSkip() {
    logEvent('qa_skipped');
    goOutline();
  }

  const canSkip = q.currentQType === 'followup';
  const canSend = q.composerEnabled && value.trim().length > 0;

  return (
    <div className={styles.quickRoot}>
      {/* 상단 프레임: 4요소 ProgressCircles + 통째 스킵 (구석, 작게) */}
      <header className={styles.quickTopFrame}>
        <ProgressCircles
          elementProgress={q.elementProgress}
          currentElement={q.currentElement}
          completedElements={q.completedElements}
        />
        {!q.isDone && (
          <button type="button" className={styles.wholeSkipLink} onClick={wholeSkip}>
            Q&amp;A 건너뛰기
          </button>
        )}
      </header>

      {/* 채팅 스레드 */}
      <main className={styles.quickThread}>
        <div className={styles.quickThreadInner}>
          {q.messages.map((m) =>
            m.role === 'assistant' ? (
              <AIMessage key={m.id} content={m.content} isCont={m.isCont} timestamp={m.timestamp} />
            ) : (
              <UserMessage
                key={m.id}
                content={m.content}
                isCont={m.isCont}
                timestamp={m.timestamp}
                skipped={m.skipped}
              />
            ),
          )}

          {q.streamingMsg && (
            <AIMessage
              key={q.streamingMsg.id}
              content={q.streamingMsg.content}
              isCont={q.streamingMsg.isCont}
              timestamp={q.streamingMsg.timestamp}
              isStreaming
              onStreamEnd={q.handleStreamEnd}
              onWordReveal={scrollToBottom}
            />
          )}

          {q.thinking && (
            <ThinkingIndicator isCont={q.thinking.isCont} timestamp={q.thinking.timestamp} />
          )}

          {q.isDone && (
            <div className={styles.quickDone}>
              <p className={styles.quickDoneText}>충분히 이야기했어요. 이제 글의 재료를 정리해볼까요?</p>
              <button
                type="button"
                className={`${styles.quickBtn} ${styles.quickBtnPrimary} ${styles.quickBtnLg}`}
                onClick={proceed}
              >
                <span>다음 단계로</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          <div ref={scrollAnchorRef} aria-hidden="true" />
        </div>
      </main>

      {/* 하단 sticky 입력 (세션 진행 중에만) */}
      {!q.isDone && (
        <footer className={styles.quickComposer}>
          <div className={styles.quickComposerInner}>
            <textarea
              ref={textareaRef}
              className={styles.quickTextarea}
              rows={3}
              placeholder={q.composerEnabled ? '답변을 적어주세요...' : '잠시만요...'}
              aria-label="답변 입력"
              disabled={!q.composerEnabled}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className={styles.quickComposerRow}>
              <SkipGuard canSkip={canSkip && q.composerEnabled} onSkip={handleSkip} />
              <button
                type="button"
                className={`${styles.quickBtn} ${styles.quickBtnPrimary}`}
                disabled={!canSend}
                onClick={handleSend}
              >
                <span>보내기</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      <MinQuestionWarning
        open={showFloor}
        onContinue={() => {
          setShowFloor(false);
          goOutline();
        }}
        onKeepAnswering={() => setShowFloor(false)}
      />
    </div>
  );
}
