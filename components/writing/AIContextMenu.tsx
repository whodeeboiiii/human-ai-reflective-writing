'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './writing.module.css';

export type ContextMenuMode = 'suggest' | 'fix';

interface AIContextMenuProps {
  x: number;
  y: number;
  mode: ContextMenuMode;
  onAction: () => void;
  onClose: () => void;
}

const MENU_W = 200;
const MENU_H = 48;

export function AIContextMenu({ x, y, mode, onAction, onClose }: AIContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Keep menu within viewport bounds
  useLayoutEffect(() => {
    const pad = 8;
    const w = menuRef.current?.offsetWidth ?? MENU_W;
    const h = menuRef.current?.offsetHeight ?? MENU_H;
    const nextX = Math.min(x, window.innerWidth - w - pad);
    const nextY = Math.min(y, window.innerHeight - h - pad);
    setPos({ x: Math.max(pad, nextX), y: Math.max(pad, nextY) });
  }, [x, y]);

  // Close on outside click / Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const label = mode === 'fix' ? 'AI 문법 수정' : '다음 문장 제안';

  return createPortal(
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{ left: pos.x, top: pos.y }}
      role="menu"
    >
      <button
        type="button"
        className={styles.contextMenuItem}
        role="menuitem"
        onClick={() => {
          onAction();
          onClose();
        }}
      >
        <span className={styles.contextMenuSparkle} aria-hidden="true">✦</span>
        <span>{label}</span>
      </button>
    </div>,
    document.body
  );
}
