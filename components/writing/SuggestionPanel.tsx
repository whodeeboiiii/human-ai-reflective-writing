'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './writing.module.css';

interface SuggestionPanelProps {
  x: number;
  y: number;
  loading: boolean;
  error: boolean;
  suggestions: string[] | null;
  onSelect: (index: number) => void;
  onClose: () => void;
  onRetry: () => void;
}

const PANEL_W = 340;

export function SuggestionPanel({
  x,
  y,
  loading,
  error,
  suggestions,
  onSelect,
  onClose,
  onRetry,
}: SuggestionPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const pad = 12;
    const w = ref.current?.offsetWidth ?? PANEL_W;
    const h = ref.current?.offsetHeight ?? 200;
    const nextX = Math.min(x, window.innerWidth - w - pad);
    const nextY = Math.min(y + 8, window.innerHeight - h - pad);
    setPos({ x: Math.max(pad, nextX), y: Math.max(pad, nextY) });
  }, [x, y, loading, error, suggestions]);

  // Escape closes (no insertion)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      className={styles.suggestPanel}
      style={{ left: pos.x, top: pos.y, width: PANEL_W }}
      role="dialog"
      aria-label="다음 문장 제안"
    >
      <div className={styles.suggestHeader}>
        <span className={styles.suggestTitle}>
          <span className={styles.contextMenuSparkle} aria-hidden="true">✦</span> 다음 문장 제안
        </span>
        <button
          type="button"
          className={styles.suggestClose}
          onClick={onClose}
          aria-label="닫기 (Esc)"
        >
          ✕
        </button>
      </div>

      {loading && (
        <div className={styles.suggestList}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.suggestSkeleton} aria-hidden="true" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className={styles.suggestError} role="alert">
          <p>제안을 가져오지 못했어요.</p>
          <button type="button" className={styles.suggestRetry} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && suggestions && (
        <div className={styles.suggestList}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className={styles.suggestCard}
              onClick={() => onSelect(i)}
            >
              <span className={styles.suggestCardText}>{s}</span>
              <span className={styles.suggestCardApply}>적용</span>
            </button>
          ))}
        </div>
      )}

      <p className={styles.suggestHint}>Esc로 닫기 · 클릭해서 적용</p>
    </div>,
    document.body
  );
}
