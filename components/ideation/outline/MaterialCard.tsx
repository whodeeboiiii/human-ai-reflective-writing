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
  /** Ordinal badge shown at the top-left of the card. */
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
    // Cursor reflects whether a drag is active; otherwise signal the card is draggable
    cursor: isDragging ? 'grabbing' : 'grab',
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
      // Spread drag attributes + listeners on the whole card so any non-textarea
      // area acts as a drag handle.  The textarea and delete button each call
      // stopPropagation on pointerdown so they never initiate a drag.
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          {orderNumber !== undefined && (
            <span className={styles.cardNum} aria-hidden="true">
              {orderNumber}
            </span>
          )}
        </div>
        {canDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            // Prevent card-level drag from firing when tapping the delete button
            onPointerDown={(e) => e.stopPropagation()}
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
        // Prevent card-level drag from firing when the user clicks or selects text
        onPointerDown={(e) => e.stopPropagation()}
        rows={3}
        aria-label="카드 내용"
        placeholder="내용을 입력하세요"
        style={{ cursor: 'text' }}
      />
    </div>
  );
}
