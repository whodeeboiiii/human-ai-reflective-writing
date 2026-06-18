'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ideation-qa.module.css';

interface Props {
  enabled: boolean;
  done: boolean;
  onSend: (text: string) => void;
}

const IDLE_MS = 25_000; // C-4: show skip-nudge after 25s of inactivity
const UNDO_COALESCE_MS = 400; // C-6: chunk undo snapshots by pause

export function ChatInput({ enabled, done, onSend }: Props) {
  const [value, setValue] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // C-4 timers / once-per-question guard
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintShownRef = useRef(false);

  // C-6 undo history (controlled textarea breaks native undo)
  const undoStackRef = useRef<string[]>([]);
  const lastPushRef = useRef(0);
  const valueRef = useRef('');
  valueRef.current = value;

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }

  function startIdleTimer() {
    clearIdleTimer();
    if (hintShownRef.current) return; // already shown this question
    idleTimerRef.current = setTimeout(() => {
      if (!hintShownRef.current) {
        setHintVisible(true);
        hintShownRef.current = true;
      }
    }, IDLE_MS);
  }

  // Focus + reset per-question state when composer becomes enabled
  useEffect(() => {
    if (enabled) {
      hintShownRef.current = false;
      setHintVisible(false);
      undoStackRef.current = [];
      lastPushRef.current = 0;
      startIdleTimer();
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    // disabled → stop timer + hide hint
    clearIdleTimer();
    setHintVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => clearIdleTimer, []);

  function pushUndoSnapshot(prev: string) {
    const now = Date.now();
    if (now - lastPushRef.current > UNDO_COALESCE_MS) {
      undoStackRef.current.push(prev);
      lastPushRef.current = now;
      // cap stack size
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    pushUndoSnapshot(valueRef.current);
    setValue(e.target.value);
    // typing resets the idle nudge timer + hides current hint
    if (hintVisible) setHintVisible(false);
    startIdleTimer();
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || !enabled) return;
    clearIdleTimer();
    setHintVisible(false);
    onSend(trimmed);
    setValue('');
    undoStackRef.current = [];
  }

  function handleUndo() {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const prev = stack.pop() as string;
    setValue(prev);
    lastPushRef.current = 0;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // C-6: Ctrl/Cmd+Z restores deleted text (native undo is broken on controlled inputs)
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      handleUndo();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = enabled && value.trim().length > 0;

  return (
    <footer className={styles.qaComposer}>
      <div className={styles.qaComposerInner}>
        {hintVisible && !done && (
          <div className={styles.qaSkipHint} role="status">
            막막하다면 &lsquo;잘 모르겠어&rsquo;라고 답해주셔도 돼요. 다른 질문을 드릴게요.
          </div>
        )}
        <div className={styles.qaComposerShell}>
          <textarea
            ref={textareaRef}
            className={styles.qaInput}
            rows={8}
            placeholder={done ? '세션이 마무리되었어요.' : '답변을 적어주세요...'}
            aria-label="답변 입력"
            disabled={!enabled || done}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.qaComposerFoot}>
            <div className={styles.qaComposerHint}>
              <span className={styles.qaKbd}>Enter</span>
              <span>줄바꿈</span>
              <span className={styles.qaHintSep}>·</span>
              <span className={styles.qaKbd}>⌘</span>
              <span className={styles.qaKbd}>↵</span>
              <span>보내기</span>
            </div>
            <div className={styles.qaComposerActions}>
              <button
                type="button"
                className={`${styles.qaBtn} ${styles.qaBtnPrimary}`}
                disabled={!canSend || done}
                onClick={handleSend}
              >
                <span>보내기</span>
                <span className={styles.qaArrow} aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
