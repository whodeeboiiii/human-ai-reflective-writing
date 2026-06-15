'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './community.module.css';

interface Props {
  postId: string;
}

export function PublishSuccess({ postId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/community/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={styles.successPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 체크마크 애니메이션 */}
      <motion.div
        className={styles.successIcon}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg viewBox="0 0 56 56" fill="none" width={56} height={56}>
          <motion.circle
            cx="28" cy="28" r="26"
            stroke="var(--accent)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          />
          <motion.path
            d="M16 28.5 L24 36.5 L40 20"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.45, duration: 0.4, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.div
        className={styles.successText}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
      >
        <h2 className={styles.successTitle}>발행 완료!</h2>
        <p className={styles.successSub}>글이 커뮤니티에 공유됐어요.</p>
      </motion.div>

      <motion.div
        className={styles.successActions}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35 }}
      >
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? '복사됨 ✓' : '링크 복사'}
        </button>

        <Link href={`/community/${postId}`} className={styles.successPrimaryBtn}>
          커뮤니티에서 보기
        </Link>

        <Link href="/app" className={styles.successSecondaryBtn}>
          내 글 보기
        </Link>
      </motion.div>
    </motion.div>
  );
}
