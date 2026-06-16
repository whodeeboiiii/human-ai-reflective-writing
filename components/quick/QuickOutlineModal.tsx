'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MaterialCard } from '@/types/ideation';
import styles from './quick-outline-modal.module.css';

interface Props {
  topicSentence: string;
  cards: MaterialCard[];
  onProceed: () => void;
}

function buildMarkdown(topicSentence: string, cards: MaterialCard[]): string {
  const title = topicSentence.trim() ? `# ${topicSentence.trim()}\n\n` : '';
  const items = cards
    .filter((c) => c.content.trim())
    .map((c, i) => `${i + 1}. ${c.content.trim()}`)
    .join('\n');
  return `${title}## 아웃라인\n\n${items || '(카드 없음)'}`;
}

export function QuickOutlineModal({ topicSentence, cards, onProceed }: Props) {
  const markdown = buildMarkdown(topicSentence, cards);
  const [copied, setCopied] = useState(false);

  // 모달 오픈 시 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qom-title"
        >
          {/* 상단 헤더 */}
          <div className={styles.header}>
            <span className={styles.eyebrow}>완성된 아웃라인</span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label="아웃라인을 클립보드에 복사"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="2 8 6 12 14 4" />
                  </svg>
                  복사됨 ✓
                </>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="1" width="9" height="11" rx="1.5" />
                    <path d="M11 12v2a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 14V5A1.5 1.5 0 0 1 2 3.5h2" />
                  </svg>
                  클립보드에 복사
                </>
              )}
            </button>
          </div>

          {/* 마크다운 미리보기 */}
          <pre className={styles.mdPreview} aria-label="아웃라인 미리보기">{markdown}</pre>

          {/* CTA 섹션 */}
          <div className={styles.cta}>
            <p className={styles.ctaText} id="qom-title">
              잘했어요! 이제 만든 이 개요를 직접 글로 옮겨 보시겠어요?
            </p>
            <button
              type="button"
              className={styles.proceedBtn}
              onClick={onProceed}
            >
              <span>예, 글 쓰러 가기</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
