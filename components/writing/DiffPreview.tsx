'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './writing.module.css';

interface DiffPreviewProps {
  x: number;
  y: number;
  originalText: string;
  correctedText: string | null;
  loading: boolean;
  error: boolean;
  onApply: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

const CARD_W = 360;

export function DiffPreview({
  x,
  y,
  originalText,
  correctedText,
  loading,
  error,
  onApply,
  onCancel,
  onRetry,
}: DiffPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const pad = 12;
    const w = ref.current?.offsetWidth ?? CARD_W;
    const h = ref.current?.offsetHeight ?? 160;
    const nextX = Math.min(x, window.innerWidth - w - pad);
    const nextY = Math.min(y + 8, window.innerHeight - h - pad);
    setPos({ x: Math.max(pad, nextX), y: Math.max(pad, nextY) });
  }, [x, y, loading, error, correctedText]);

  // Escape cancels
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      className={styles.diffCard}
      style={{ left: pos.x, top: pos.y, width: CARD_W }}
      role="dialog"
      aria-label="AI 문법 수정"
    >
      <div className={styles.diffHeader}>
        <span className={styles.suggestTitle}>
          <span className={styles.contextMenuSparkle} aria-hidden="true">✦</span> AI 문법 수정
        </span>
      </div>

      {loading && (
        <div className={styles.diffLoading} aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>교정 중…</span>
        </div>
      )}

      {!loading && error && (
        <div className={styles.suggestError} role="alert">
          <p>교정을 가져오지 못했어요.</p>
          <button type="button" className={styles.suggestRetry} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && correctedText !== null && (
        <>
          <div className={styles.diffBody}>
            <p className={styles.diffOriginal}>{originalText}</p>
            <p className={styles.diffCorrected}>{correctedText}</p>
          </div>
          <div className={styles.diffActions}>
            <button type="button" className={styles.diffCancel} onClick={onCancel}>
              취소
            </button>
            <button type="button" className={styles.diffApply} onClick={onApply}>
              적용
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
