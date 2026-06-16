'use client';

import { useMemo, useState } from 'react';
import type { QATurn } from '@/types/ideation';
import styles from './writing.module.css';

interface QAPair {
  id: string;
  question: string; // just the question part of the AI turn (acknowledgment stripped)
  answer: string; // user's full submitted answer
}

// Pair each user answer with the question it answered (the most recent AI turn).
// AI content is "{acknowledgment}\n\n{question}", so the question is the last block.
function buildPairs(turns: QATurn[]): QAPair[] {
  const pairs: QAPair[] = [];
  let lastQuestion = '';
  for (const t of turns) {
    if (t.role === 'assistant') {
      const blocks = t.content.split('\n\n');
      lastQuestion = blocks[blocks.length - 1].trim();
    } else if (t.role === 'user' && t.content.trim()) {
      pairs.push({ id: t.id, question: lastQuestion, answer: t.content });
    }
  }
  return pairs;
}

interface AnswersSidebarProps {
  turns: QATurn[];
  open: boolean;
  onToggle: () => void;
}

export function AnswersSidebar({ turns, open, onToggle }: AnswersSidebarProps) {
  const pairs = useMemo(() => buildPairs(turns), [turns]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAnswer(pair: QAPair) {
    try {
      await navigator.clipboard.writeText(pair.answer);
      setCopiedId(pair.id);
      window.setTimeout(() => {
        setCopiedId((cur) => (cur === pair.id ? null : cur));
      }, 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <aside
      className={`${styles.answersSidebar} ${open ? '' : styles.answersSidebarCollapsed}`}
      onClick={!open ? onToggle : undefined}
      role={!open ? 'button' : undefined}
      tabIndex={!open ? 0 : undefined}
      onKeyDown={!open ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } } : undefined}
      aria-label={!open ? '대화 내용 열기' : undefined}
    >
      <div className={styles.answersHeader}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={open ? '답변 사이드바 접기' : '답변 사이드바 펼치기'}
          title={open ? '접기' : '펼치기'}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {open && <span className={styles.answersTitle}>내 답변</span>}
      </div>

      {/* Mobile collapsed tab label */}
      {!open && (
        <div className={styles.sidebarCollapsedLabel} aria-hidden="true">
          <span>대화 내용</span>
        </div>
      )}

      {open && (
        <div className={styles.answersBody}>
          {pairs.length === 0 ? (
            <p className={styles.answersEmpty}>
              아직 Flect와 나눈 대화 내용이 없어요.
            </p>
          ) : (
            <ul className={styles.answersList}>
              {pairs.map((p) => {
                const copied = copiedId === p.id;
                return (
                  <li key={p.id} className={styles.answerCard}>
                    <div className={styles.answerCardHead}>
                      <span className={styles.answerQ}>{p.question || '질문'}</span>
                      <button
                        type="button"
                        className={`${styles.answerCopyBtn} ${copied ? styles.answerCopyBtnCopied : ''}`}
                        onClick={() => copyAnswer(p)}
                        aria-label="답변 복사"
                      >
                        {copied ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <p className={styles.answerText}>{p.answer}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
