'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Genre } from '@/types/community';
import styles from './community.module.css';

interface Props {
  genre: Genre;
  onConfirm: (nickname: string, tags: string) => Promise<void>;
  onClose: () => void;
}

export function PublishModal({ genre, onConfirm, onClose }: Props) {
  const [nickname, setNickname] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nicknameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nicknameRef.current?.focus();
  }, []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) { setError('닉네임을 입력해 주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      await onConfirm(trimmed, tags.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : '발행 중 오류가 발생했어요.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.modalEyebrow}>글 발행하기</p>
          <h2 className={styles.modalTitle}>독자에게 어떻게 불릴까요?</h2>

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <label className={styles.fieldLabel}>
              닉네임 <span className={styles.required}>*</span>
            </label>
            <input
              ref={nicknameRef}
              className={styles.fieldInput}
              type="text"
              placeholder="예: 책읽는곰"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
            />

            <label className={styles.fieldLabel} style={{ marginTop: 20 }}>
              태그 <span className={styles.fieldOptional}>(선택, 콤마로 구분)</span>
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              placeholder="예: 성장, 회고, 일상"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />

            <div className={styles.genreChip}>
              <span className={styles.genreChipLabel}>장르</span>
              <span className={styles.genreChipValue}>{genre}</span>
            </div>

            {error && <p className={styles.fieldError}>{error}</p>}

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                취소
              </button>
              <button
                type="submit"
                className={styles.publishBtn}
                disabled={!nickname.trim() || loading}
              >
                {loading ? '발행 중…' : '발행하기'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
