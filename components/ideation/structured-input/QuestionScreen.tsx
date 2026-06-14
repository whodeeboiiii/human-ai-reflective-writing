'use client';

import { useState, type CSSProperties } from 'react';
import styles from './ideation-input.module.css';
import type { ChoiceScreenData, OpenScreenData, SliderScreenData } from '@/lib/data/ideation';
import { ChoiceCard } from './ChoiceCard';
import { OpenQuestionInput } from './OpenQuestionInput';

interface Props {
  screen: ChoiceScreenData | OpenScreenData | SliderScreenData;
  selectedValue?: string;
  firingValue?: string;
  onChoiceSelect: (value: string) => void;
  onOpenSubmit: (value: string) => void;
  initialTopicValue?: string;
}

export function QuestionScreen({
  screen,
  selectedValue,
  firingValue,
  onChoiceSelect,
  onOpenSubmit,
  initialTopicValue,
}: Props) {
  const lines = screen.question.split('\n');

  // Slider position is held locally so moving it does NOT advance the survey;
  // the user commits with the "선택" button. (Harmless for non-slider screens —
  // this screen remounts per question via the parent's `key`, so it resets.)
  const sliderChoices = screen.type === 'slider' ? screen.choices : [];
  const [sliderIndex, setSliderIndex] = useState(() => {
    const found = selectedValue
      ? sliderChoices.findIndex((c) => c.value === selectedValue)
      : -1;
    return found >= 0 ? found : Math.floor(sliderChoices.length / 2);
  });

  return (
    <div className={styles.ixScreenInner}>
      <p className={styles.ixEyebrow}>{screen.eyebrow}</p>
      <h2 className={styles.ixQ}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h2>

      {(screen.type === 'choices' || screen.type === 'slider') && screen.sub && (
        <p className={styles.ixQSub}>{screen.sub}</p>
      )}

      {screen.type === 'open' && (
        <OpenQuestionInput
          initialValue={initialTopicValue ?? ''}
          placeholder={screen.placeholder}
          maxLength={screen.maxLength}
          onSubmit={onOpenSubmit}
        />
      )}

      {screen.type === 'choices' && (
        <ul
          className={[
            styles.ixChoices,
            screen.layout === 'ordinal' ? styles.ixChoicesOrdinal : '',
            screen.layout === 'two-col' ? styles.ixChoicesTwoCol : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {screen.choices.map((choice, idx) => {
            const rank =
              screen.layout === 'ordinal'
                ? (choice.rank ?? String(idx + 1).padStart(2, '0'))
                : undefined;
            return (
              <li key={choice.value}>
                <ChoiceCard
                  choice={choice}
                  rank={rank}
                  isSelected={choice.value === selectedValue}
                  isFiring={choice.value === firingValue}
                  onClick={() => onChoiceSelect(choice.value)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {screen.type === 'slider' &&
        (() => {
          const lastIndex = screen.choices.length - 1;
          const idx = Math.min(Math.max(sliderIndex, 0), lastIndex);
          const current = screen.choices[idx];
          const fillPct = lastIndex > 0 ? (idx / lastIndex) * 100 : 0;

          return (
            <div className={styles.ixSliderBlock}>
              <div
                className={styles.ixSliderTrackWrap}
                style={{ ['--fill' as string]: `${fillPct}%` } as CSSProperties}
              >
                <input
                  type="range"
                  min={0}
                  max={lastIndex}
                  step={1}
                  value={idx}
                  onChange={(e) => setSliderIndex(Number(e.currentTarget.value))}
                  className={styles.ixSlider}
                  aria-label={screen.question}
                  aria-valuetext={current?.label}
                />
                <div className={styles.ixSliderTicks} aria-hidden="true">
                  {screen.choices.map((c, i) => (
                    <span
                      key={c.value}
                      className={`${styles.ixSliderTick}${i <= idx ? ` ${styles.isFilled}` : ''}`}
                    />
                  ))}
                </div>
              </div>

              {screen.labels && (
                <div className={styles.ixSliderEnds} aria-hidden="true">
                  <span>{screen.labels.left}</span>
                  <span>{screen.labels.right}</span>
                </div>
              )}

              <div className={styles.ixSliderReadout} aria-live="polite">
                <span className={styles.ixSliderReadoutLabel}>{current?.label}</span>
                {current?.hint && (
                  <span className={styles.ixSliderReadoutHint}>{current.hint}</span>
                )}
              </div>

              <div className={styles.ixCtaRow}>
                <button
                  type="button"
                  className={`${styles.ixBtn} ${styles.ixBtnPrimary}`}
                  onClick={() => onChoiceSelect(current.value)}
                >
                  <span>선택</span>
                  <span className={styles.ixArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
