'use client';

import type { MaterialCard, FlowSuggestion } from '@/types/ideation';
import styles from './ideation-outline.module.css';

interface FlowSuggestionsPanelProps {
  cards: MaterialCard[];
  genreLabel: string;
  topicSentence: string;
  suggestions: FlowSuggestion[] | null;
  isLoading: boolean;
  selectedFlowId: string | null;
  onRequestSuggestions: () => Promise<void>;
  onSelectFlow: (suggestionId: string) => void;
  onClearSelection: () => void;
}

export function FlowSuggestionsPanel({
  cards,
  suggestions,
  isLoading,
  selectedFlowId,
  onRequestSuggestions,
  onSelectFlow,
  onClearSelection,
}: FlowSuggestionsPanelProps) {
  function getCardExcerpt(id: string): string {
    const card = cards.find((c) => c.id === id);
    if (!card) return '';
    return card.content.length > 40 ? card.content.slice(0, 40) + '…' : card.content;
  }

  return (
    <div className={styles.flowPanel}>
      {suggestions === null && !isLoading && (
        <div className={styles.flowInitial}>
          <button
            type="button"
            className={styles.flowRequestBtn}
            onClick={onRequestSuggestions}
          >
            글의 흐름을 제안받기 ▾
          </button>
          <p className={styles.flowHelper}>
            직접 카드를 드래그해 순서를 정하거나, AI의 제안을 받아볼 수 있어요.
          </p>
        </div>
      )}

      {isLoading && (
        <div className={styles.flowLoading} aria-live="polite">
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.flowLoadingLabel}>흐름을 제안하는 중이에요</span>
        </div>
      )}

      {!isLoading && suggestions !== null && suggestions.length > 0 && (
        <div className={styles.flowSuggestions}>
          <p className={styles.flowSuggestionsTitle}>흐름 제안</p>
          {suggestions.map((s) => {
            const isSelected = s.id === selectedFlowId;
            return (
              <div
                key={s.id}
                className={`${styles.flowSuggestion} ${isSelected ? styles.flowSuggestionSelected : ''}`}
              >
                <div className={styles.flowSuggestionHeader}>
                  <span className={styles.flowLabel}>{s.label}</span>
                  {isSelected && (
                    <button
                      type="button"
                      className={styles.clearFlowBtn}
                      onClick={onClearSelection}
                    >
                      내 순서로 되돌리기
                    </button>
                  )}
                </div>
                <p className={styles.flowRationale}>{s.rationale}</p>
                <ol className={styles.flowPreview}>
                  {s.cardOrder.slice(0, 3).map((id, idx) => (
                    <li key={id} className={styles.flowPreviewItem}>
                      <span className={styles.flowPreviewNum}>{idx + 1}</span>
                      <span className={styles.flowPreviewText}>{getCardExcerpt(id)}</span>
                    </li>
                  ))}
                  {s.cardOrder.length > 3 && (
                    <li className={styles.flowPreviewMore}>
                      외 {s.cardOrder.length - 3}개 카드
                    </li>
                  )}
                </ol>
                {!isSelected && (
                  <button
                    type="button"
                    className={styles.applyFlowBtn}
                    onClick={() => onSelectFlow(s.id)}
                  >
                    이 흐름으로 적용
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && suggestions !== null && suggestions.length === 0 && (
        <div className={styles.flowError} role="alert">
          <p>흐름을 생성하지 못했어요.</p>
          <button type="button" className={styles.flowRetryBtn} onClick={onRequestSuggestions}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
