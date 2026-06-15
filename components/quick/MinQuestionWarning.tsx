'use client';

import { AnimatePresence, motion } from 'framer-motion';
import styles from './quick-qa.module.css';

interface Props {
  open: boolean;
  onContinue: () => void; // 넘어가기 (Outline으로)
  onKeepAnswering: () => void; // 더 답하기 (닫기)
}

// 최소 질문 floor 경고 (§4.5). 차단이 아니라 확인.
export function MinQuestionWarning({ open, onContinue, onKeepAnswering }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onKeepAnswering}
        >
          <motion.div
            className={styles.modalCard}
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>정보가 너무 적어요</h3>
            <p className={styles.modalBody}>
              정보가 너무 적어서, AI가 도움을 드리기 어려워요.
              <br />
              그래도 넘어가시겠어요?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.modalBtn} ${styles.modalBtnGhost}`}
                onClick={onKeepAnswering}
              >
                더 답하기
              </button>
              <button
                type="button"
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                onClick={onContinue}
              >
                넘어가기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
