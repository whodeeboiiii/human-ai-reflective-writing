import { AnimatePresence, motion } from 'framer-motion';
import styles from './ideation-qa.module.css';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BackConfirmModal({ isOpen, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.qaModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            className={styles.qaModal}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className={styles.qaModalEyebrow}>Confirm</p>
            <h2 className={styles.qaModalTitle} id="qa-modal-title">
              정말 돌아갈까요?
            </h2>
            <p className={styles.qaModalBody}>
              지금까지 나눈 이야기는 사라져요.
              <br />
              다시 시작하려면 처음부터 답변하셔야 해요.
            </p>
            <div className={styles.qaModalActions}>
              <button
                type="button"
                className={`${styles.qaBtn} ${styles.qaBtnGhost}`}
                onClick={onCancel}
              >
                계속 진행
              </button>
              <button
                type="button"
                className={`${styles.qaBtn} ${styles.qaBtnDark}`}
                onClick={onConfirm}
              >
                <span>돌아가기</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
