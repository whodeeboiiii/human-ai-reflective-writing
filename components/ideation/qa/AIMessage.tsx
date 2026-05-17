'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './ideation-qa.module.css';

interface Props {
  content: string;
  isCont: boolean;
  timestamp: string;
  isStreaming?: boolean;
  onStreamEnd?: () => void;
  onWordReveal?: () => void;
}

function tokenize(text: string): string[] {
  const out: string[] = [];
  text.split(/(\n)/).forEach((part) => {
    if (part === '\n') { out.push('\n'); return; }
    part.split(/(\s+)/).forEach((tok) => { if (tok.length) out.push(tok); });
  });
  return out;
}

export function AIMessage({ content, isCont, timestamp, isStreaming = false, onStreamEnd, onWordReveal }: Props) {
  const tokens = useMemo(() => tokenize(content), [content]);
  const [revealed, setRevealed] = useState(isStreaming ? 0 : tokens.length);

  // Keep callbacks in refs so the effect never re-subscribes when they change identity
  const onStreamEndRef = useRef(onStreamEnd);
  const onWordRevealRef = useRef(onWordReveal);
  onStreamEndRef.current = onStreamEnd;
  onWordRevealRef.current = onWordReveal;

  useEffect(() => {
    if (!isStreaming) return;

    if (revealed === 0) {
      // Pre-roll: caret blinks for 220ms before first word lands
      const t = setTimeout(() => setRevealed(1), 220);
      return () => clearTimeout(t);
    }

    if (revealed >= tokens.length) {
      onStreamEndRef.current?.();
      return;
    }

    const t = setTimeout(() => {
      setRevealed((r) => r + 1);
      onWordRevealRef.current?.();
    }, 55);
    return () => clearTimeout(t);
  }, [isStreaming, revealed, tokens.length]);

  const showCaret = isStreaming && revealed < tokens.length;

  return (
    <div
      className={[styles.qaMsg, styles.qaMsgAi, isCont ? styles.qaMsgCont : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.qaAvatar} aria-hidden="true">
        F
      </div>
      <div className={styles.qaBody}>
        {!isCont && (
          <div className={styles.qaMeta}>
            <span className={styles.qaName}>Flect</span>
            <span className={styles.qaMetaSep} />
            <span className={styles.qaTime}>{timestamp}</span>
          </div>
        )}
        <div className={styles.qaText}>
          {tokens.slice(0, revealed).map((tok, i) =>
            tok === '\n' ? (
              <span key={i} className={styles.qaWord}>
                <br />
              </span>
            ) : (
              <span key={i} className={styles.qaWord}>
                {tok}
              </span>
            ),
          )}
          {showCaret && <span className={styles.qaCaret} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
