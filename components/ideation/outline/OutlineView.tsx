'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import type { MaterialCard as MaterialCardType, Outline } from '@/types/ideation';
import { StageIntroToast } from '@/components/common/StageIntroToast';
import { logEvent } from '@/lib/events';
import { MaterialCard } from './MaterialCard';
import styles from './ideation-outline.module.css';

export default function OutlineView({ sessionId, quick = false }: { sessionId: string; quick?: boolean }) {
  const router = useRouter();

  const [cards, setCards] = useState<MaterialCardType[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const generatedAtRef = useRef<string>('');
  const originalCardCountRef = useRef<number>(0);
  const hasBootedRef = useRef(false);

  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  // PointerSensor with delay — hold 200ms to initiate drag (quick clicks pass through)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 50, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    if (quick) logEvent('outline_reached'); // H1 분자

    const liveTurns = useIdeationStore.getState().turns;
    const liveAnswers = useStructuredInputStore.getState().answers;

    const nonIntroTurns = liveTurns.filter((t) => t.type !== 'intro');
    if (nonIntroTurns.length === 0) {
      // Quick: Q&A를 통째로 스킵했을 수 있다 → 에러 대신 빈 카드 상태로 진입(§5).
      // Full: 기존대로 에러 처리.
      queueMicrotask(() => {
        if (quick) { setCards([]); setOrder([]); setHasError(false); }
        else setHasError(true);
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
        setOrder(generatedCards.map((c) => c.id));
        setHasError(false);
        setIsLoading(false);
      })
      // Quick: 생성 실패해도 빈 카드 상태로 graceful degradation.
      .catch(() => {
        if (quick) { setCards([]); setOrder([]); setHasError(false); }
        else setHasError(true);
        setIsLoading(false);
      });
  }, [quick]);

  // ── Card operations ──
  function handleCardUpdate(id: string, content: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, content, isEdited: true } : c)));
  }

  function handleCardDelete(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setOrder((prev) => prev.filter((x) => x !== id));
  }

  function handleCardAdd() {
    const newCard: MaterialCardType = {
      id: crypto.randomUUID(),
      content: '',
      sourceElement: 'orientation',
      isEdited: false,
    };
    setCards((prev) => [...prev, newCard]);
    setOrder((prev) => [...prev, newCard.id]);
  }

  // ── Drag & drop (single column) ──
  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      setOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  }

  // Outline 통째 스킵 (§5) — Quick 전용, 작게 배치. 바로 Writing으로.
  function handleSkipOutline() {
    logEvent('outline_skipped');
    router.push(`/app/write/${sessionId}`);
  }

  function handleNext() {
    if (!quick && order.length === 0) return;
    const orderedCards = order
      .map((id) => cardById.get(id))
      .filter((c): c is MaterialCardType => Boolean(c));
    const userEdited =
      cards.some((c) => c.isEdited) || order.length !== originalCardCountRef.current;
    const outline: Outline = {
      cards: orderedCards,
      userArrangedOrder: order,
      flowSuggestions: null,
      selectedFlowId: null,
      generatedAt: generatedAtRef.current,
      userEdited,
    };
    useIdeationStore.getState().setOutline(outline);
    router.push(`/app/write/${sessionId}`);
  }

  const orderedCards = order
    .map((id) => cardById.get(id))
    .filter((c): c is MaterialCardType => Boolean(c));
  const activeCard = activeId ? cardById.get(activeId) : null;

  return (
    <div>
      {/* Stage intro toast — shown once after cards load, non-blocking */}
      {!isLoading && !hasError && cards.length > 0 && (
        <StageIntroToast
          eyebrow="Outline · 사용 안내"
          title="재료 카드로 글의 순서를 잡아보세요"
          body="카드를 꾹 눌러 드래그하면 순서를 바꿀 수 있어요. 텍스트를 클릭하면 내용을 수정할 수 있고, 카드를 추가하거나 삭제할 수도 있어요."
        />
      )}

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
            <p className={styles.subhead}>
              드래그해서 순서를 정하고, 카드를 추가하거나 수정할 수 있어요.
            </p>
          </div>

          {isLoading && (
            <div className={styles.loadingBlock} aria-live="polite">
              <p className={styles.loadingLabel}>재료 카드를 생성 중이에요</p>
              <span className={styles.dots} aria-hidden="true">
                <span /><span /><span />
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

          {!isLoading && !hasError && (cards.length > 0 || quick) && (
            <>
              {quick && cards.length === 0 && (
                <p className={styles.subhead}>
                  아직 재료 카드가 없어요. 직접 추가하거나, 바로 글쓰기로 넘어갈 수 있어요.
                </p>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
              >
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  <div className={styles.cardList}>
                    {orderedCards.map((card, idx) => (
                      <MaterialCard
                        key={card.id}
                        card={card}
                        orderNumber={idx + 1}
                        onUpdate={(content) => handleCardUpdate(card.id, content)}
                        onDelete={() => handleCardDelete(card.id)}
                        canDelete
                      />
                    ))}
                  </div>
                </SortableContext>

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

              <button
                type="button"
                className={styles.addCardWide}
                onClick={handleCardAdd}
                aria-label="카드 추가"
              >
                <span className={styles.addCardIcon}>+</span>
                <span className={styles.addCardLabel}>카드 추가</span>
              </button>

              <div className={styles.outlineFinal}>
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleNext}
                  disabled={!quick && order.length === 0}
                >
                  <span>다음 단계로</span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </button>
                {quick && (
                  <button type="button" className={styles.skipLink} onClick={handleSkipOutline}>
                    아웃라인 없이 바로 글쓰기
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
