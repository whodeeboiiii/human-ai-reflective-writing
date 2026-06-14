'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { MaterialCard as MaterialCardType } from '@/types/ideation';
import { MaterialCard } from './MaterialCard';
import styles from './ideation-outline.module.css';

interface MaterialCardGridProps {
  cards: MaterialCardType[];
  order: string[] | null;
  onCardUpdate: (id: string, content: string) => void;
  onCardDelete: (id: string) => void;
  onCardAdd: () => void;
  onReorder: (newOrder: string[]) => void;
}

export function MaterialCardGrid({
  cards,
  order,
  onCardUpdate,
  onCardDelete,
  onCardAdd,
  onReorder,
}: MaterialCardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Compute display order: use `order` array if set, otherwise use cards array order
  const orderedCards =
    order === null
      ? cards
      : order
          .map((id) => cards.find((c) => c.id === id))
          .filter((c): c is MaterialCardType => c !== undefined);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCards.findIndex((c) => c.id === active.id);
    const newIndex = orderedCards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(
      orderedCards.map((c) => c.id),
      oldIndex,
      newIndex,
    );
    onReorder(newOrder);
  }

  const sortableIds = orderedCards.map((c) => c.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <div className={styles.cardGrid} aria-label="재료 카드 목록">
          {orderedCards.map((card) => (
            <MaterialCard
              key={card.id}
              card={card}
              onUpdate={(content) => onCardUpdate(card.id, content)}
              onDelete={() => onCardDelete(card.id)}
              canDelete={cards.length > 3}
            />
          ))}
          <button type="button" className={styles.addCard} onClick={onCardAdd} aria-label="카드 추가">
            <span className={styles.addCardIcon}>+</span>
            <span className={styles.addCardLabel}>카드 추가</span>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
