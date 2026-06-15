'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './stage-intro-toast.module.css';

interface StageIntroToastProps {
  eyebrow: string;
  title: string;
  body?: string;
  durationMs?: number;
}

export function StageIntroToast({
  eyebrow,
  title,
  body,
  durationMs = 4000,
}: StageIntroToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.toast}
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          <div className={styles.inner}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setVisible(false)}
              aria-label="안내 닫기"
            >
              ×
            </button>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <p className={styles.title}>{title}</p>
            {body && <p className={styles.body}>{body}</p>}
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressBar}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: durationMs / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
