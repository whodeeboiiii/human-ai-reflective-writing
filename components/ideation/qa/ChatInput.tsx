'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ideation-qa.module.css';

interface Props {
  enabled: boolean;
  done: boolean;
  onSend: (text: string) => void;
  onSkip: () => void;
}

export function ChatInput({ enabled, done, onSend, onSkip }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus when composer becomes enabled
  useEffect(() => {
    if (enabled) {
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [enabled]);

  function autosize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || !enabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleSkip() {
    if (!enabled) return;
    onSkip();
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = enabled && value.trim().length > 0;

  return (
    <footer className={styles.qaComposer}>
      <div className={styles.qaComposerInner}>
        <div className={styles.qaComposerShell}>
          <textarea
            ref={textareaRef}
            className={styles.qaInput}
            rows={5}
            placeholder={done ? '세션이 마무리되었어요.' : '답변을 적어주세요...'}
            aria-label="답변 입력"
            disabled={!enabled || done}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autosize();
            }}
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
                className={`${styles.qaBtn} ${styles.qaBtnGhost}`}
                disabled={!enabled || done}
                onClick={handleSkip}
              >
                <span>건너뛰기</span>
              </button>
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
