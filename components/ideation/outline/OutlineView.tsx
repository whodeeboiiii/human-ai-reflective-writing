'use client';

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import type { MaterialCard as MaterialCardType, Outline } from '@/types/ideation';
import { MaterialCard } from './MaterialCard';
import styles from './ideation-outline.module.css';

type ContainerId = 'pool' | 'order';

interface Containers {
  pool: string[]; // unordered material cards (left)
  order: string[]; // writing-order sequence (right)
}

/** A droppable, sortable column. Renders an empty hint when it has no cards. */
function DroppableColumn({
  id,
  items,
  emptyText,
  children,
}: {
  id: ContainerId;
  items: string[];
  emptyText: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`${styles.dropZone} ${id === 'order' ? styles.dropZoneOrder : ''} ${
          isOver ? styles.dropZoneOver : ''
        }`}
      >
        {items.length === 0 ? <p className={styles.dropEmpty}>{emptyText}</p> : children}
      </div>
    </SortableContext>
  );
}

export default function OutlineView({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  const [cards, setCards] = useState<MaterialCardType[]>([]);
  const [containers, setContainers] = useState<Containers>({ pool: [], order: [] });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const generatedAtRef = useRef<string>('');
  const originalCardCountRef = useRef<number>(0);
  const hasBootedRef = useRef(false);

  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    // Read from getState() to bypass Zustand persist hydration timing
    const liveTurns = useIdeationStore.getState().turns;
    const liveAnswers = useStructuredInputStore.getState().answers;

    const nonIntroTurns = liveTurns.filter((t) => t.type !== 'intro');
    if (nonIntroTurns.length === 0) {
      // defer out of the effect body to avoid a synchronous render cascade
      queueMicrotask(() => {
        setHasError(true);
        setIsLoading(false);
      });
      return;
    }

    fetch('/api/ideation/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredInput: liveAnswers, turns: liveTurns }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { cards: generatedCards } = (await res.json()) as { cards: MaterialCardType[] };
        generatedAtRef.current = new Date().toISOString();
        originalCardCountRef.current = generatedCards.length;
        setCards(generatedCards);
        // All generated cards start unordered in the left pool.
        setContainers({ pool: generatedCards.map((c) => c.id), order: [] });
        setHasError(false);
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  }, []);

  // ── Card operations ──
  function handleCardUpdate(id: string, content: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, content, isEdited: true } : c)));
  }

  function handleCardDelete(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setContainers((prev) => ({
      pool: prev.pool.filter((x) => x !== id),
      order: prev.order.filter((x) => x !== id),
    }));
  }

  function handleCardAdd() {
    const newCard: MaterialCardType = {
      id: crypto.randomUUID(),
      content: '',
      sourceElement: 'orientation',
      isEdited: false,
    };
    setCards((prev) => [...prev, newCard]);
    setContainers((prev) => ({ ...prev, pool: [...prev.pool, newCard.id] }));
  }

  // Remove a card from the writing order — send it back to the pool (not deleted).
  function handleRemoveFromOrder(id: string) {
    setContainers((prev) => ({
      pool: prev.pool.includes(id) ? prev.pool : [...prev.pool, id],
      order: prev.order.filter((x) => x !== id),
    }));
  }

  // ── Drag & drop (two containers) ──
  function findContainer(id: string): ContainerId | null {
    if (id === 'pool' || id === 'order') return id;
    if (containers.pool.includes(id)) return 'pool';
    if (containers.order.includes(id)) return 'order';
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const id = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setContainers((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const overIndex = overItems.indexOf(overId);

      let newIndex: number;
      if (overId === overContainer) {
        newIndex = overItems.length; // dropped onto the column area itself
      } else {
        const translatedTop = active.rect.current.translated?.top;
        const isBelow =
          translatedTop !== undefined && translatedTop > over.rect.top + over.rect.height / 2;
        newIndex = overIndex >= 0 ? overIndex + (isBelow ? 1 : 0) : overItems.length;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((x) => x !== id),
        [overContainer]: [...overItems.slice(0, newIndex), id, ...overItems.slice(newIndex)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const id = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

    const items = containers[activeContainer];
    const oldIndex = items.indexOf(id);
    const newIndex = overId === overContainer ? items.length - 1 : items.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setContainers((prev) => ({
        ...prev,
        [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
      }));
    }
  }

  function handleNext() {
    const order = containers.order;
    if (order.length === 0) return;
    const orderedCards = order
      .map((id) => cardById.get(id))
      .filter((c): c is MaterialCardType => Boolean(c));

    const userEdited =
      cards.some((c) => c.isEdited) || order.length !== originalCardCountRef.current;

    const outline: Outline = {
      cards: orderedCards, // only the placed cards, in writing order
      userArrangedOrder: order,
      flowSuggestions: null,
      selectedFlowId: null,
      generatedAt: generatedAtRef.current,
      userEdited,
    };
    useIdeationStore.getState().setOutline(outline);
    router.push(`/app/write/${sessionId}`);
  }

  const poolCards = containers.pool
    .map((id) => cardById.get(id))
    .filter((c): c is MaterialCardType => Boolean(c));
  const orderCards = containers.order
    .map((id) => cardById.get(id))
    .filter((c): c is MaterialCardType => Boolean(c));
  const activeCard = activeId ? cardById.get(activeId) : null;

  return (
    <div>
      {/* Top Bar */}
      <header className={styles.outlineTop}>
        <Link
          href={`/app/write/${sessionId}/qa`}
          className={styles.outlineBack}
          aria-label="이전 단계로"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 18 5 12 11 6" />
          </svg>
          <span>뒤로</span>
        </Link>

        <div className={styles.outlineStepIndicator} aria-label="Step 3 of 3">
          <span className={styles.stepLabel}>Step</span>
          <span className={styles.stepCur}>03</span>
          <span className={styles.stepOf}>/</span>
          <span className={styles.stepTotal}>03</span>
          <span className={styles.stepName}>Outline</span>
        </div>

        <Link href="/app" className={styles.outlineMark} aria-label="Flect 홈">
          <span className={styles.outlineMarkGlyph} aria-hidden="true" />
          <span>Flect</span>
        </Link>
      </header>

      {/* Main */}
      <main className={styles.outlineStage}>
        <div className={styles.outlineInner}>
          <div className={styles.outlineHead}>
            <p className={styles.eyebrow}>Outline · Step 03</p>
            <h1 className={styles.heading}>
              글의 재료를
              <br />
              <span className="emph">정리해볼게요.</span>
            </h1>
            <p className={styles.subhead}>재료 카드를 직접 편집하거나, 삭제할 수 있어요.</p>
          </div>

          {isLoading && (
            <div className={styles.loadingBlock} aria-live="polite">
              <p className={styles.loadingLabel}>재료 카드를 생성 중이에요</p>
              <span className={styles.dots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}

          {hasError && !isLoading && (
            <div className={styles.errorBlock} role="alert">
              <p className={styles.errorText}>
                아웃라인을 불러올 수 없어요. Q&A 세션을 먼저 완료해 주세요.
              </p>
              <Link href={`/app/write/${sessionId}/qa`} className={styles.errorBack}>
                Q&A 세션으로 돌아가기
              </Link>
            </div>
          )}

          {!isLoading && !hasError && cards.length > 0 && (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
              >
                <div className={styles.composer}>
                  {/* Left — unordered material pool */}
                  <section className={styles.column}>
                    <div className={styles.columnHead}>
                      <h2 className={styles.columnTitle}>재료 카드</h2>
                      <span className={styles.columnSub}>순서 없는 재료 모음</span>
                    </div>
                    <DroppableColumn
                      id="pool"
                      items={containers.pool}
                      emptyText="카드를 모두 순서에 놓았어요. 새 카드를 추가하거나, 오른쪽에서 되돌릴 수 있어요."
                    >
                      {poolCards.map((card) => (
                        <MaterialCard
                          key={card.id}
                          card={card}
                          onUpdate={(content) => handleCardUpdate(card.id, content)}
                          onDelete={() => handleCardDelete(card.id)}
                          canDelete
                        />
                      ))}
                    </DroppableColumn>
                    <button
                      type="button"
                      className={styles.addCardWide}
                      onClick={handleCardAdd}
                      aria-label="카드 추가"
                    >
                      <span className={styles.addCardIcon}>+</span>
                      <span className={styles.addCardLabel}>카드 추가</span>
                    </button>
                  </section>

                  {/* Right — writing order */}
                  <section className={styles.column}>
                    <div className={styles.columnHead}>
                      <h2 className={styles.columnTitle}>글쓰기 순서</h2>
                      <span className={styles.columnSub}>위에서부터 쓸 순서</span>
                    </div>
                    <DroppableColumn
                      id="order"
                      items={containers.order}
                      emptyText="여기로 카드를 끌어다 놓아 글을 쓸 순서를 만들어요."
                    >
                      {orderCards.map((card, idx) => (
                        <MaterialCard
                          key={card.id}
                          card={card}
                          orderNumber={idx + 1}
                          onUpdate={(content) => handleCardUpdate(card.id, content)}
                          onDelete={() => handleRemoveFromOrder(card.id)}
                          canDelete
                          deleteAriaLabel="순서에서 빼기"
                        />
                      ))}
                    </DroppableColumn>
                  </section>
                </div>

                <DragOverlay>
                  {activeCard ? (
                    <div className={`${styles.card} ${styles.cardOverlay}`}>
                      <p className={styles.cardOverlayText}>
                        {activeCard.content || '(빈 카드)'}
                      </p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <div className={styles.outlineFinal}>
                {containers.order.length === 0 && (
                  <span className={styles.finalHint}>
                    오른쪽에 글쓰기 순서를 만들어 주세요.
                  </span>
                )}
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleNext}
                  disabled={containers.order.length === 0}
                >
                  <span>다음 단계로</span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
