'use client';

import { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MaterialCard as MaterialCardType } from '@/types/ideation';
import styles from './ideation-outline.module.css';

interface MaterialCardProps {
  card: MaterialCardType;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  canDelete: boolean;
  /** When set, renders an ordinal badge (used in the writing-order column). */
  orderNumber?: number;
  /** aria-label for the remove button. */
  deleteAriaLabel?: string;
}

export function MaterialCard({
  card,
  onUpdate,
  onDelete,
  canDelete,
  orderNumber,
  deleteAriaLabel = '카드 삭제',
}: MaterialCardProps) {
  const [draft, setDraft] = useState(card.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleBlur() {
    const trimmed = draft.trim();
    if (trimmed !== card.content) {
      onUpdate(trimmed);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          {orderNumber !== undefined && (
            <span className={styles.cardNum} aria-hidden="true">
              {orderNumber}
            </span>
          )}
          <button
            type="button"
            className={styles.dragHandle}
            aria-label="드래그하여 이동"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
        </div>
        {canDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onDelete}
            aria-label={deleteAriaLabel}
          >
            ×
          </button>
        )}
      </div>
      <textarea
        ref={textareaRef}
        className={styles.cardTextarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        rows={3}
        aria-label="카드 내용"
        placeholder="내용을 입력하세요"
      />
    </div>
  );
}
