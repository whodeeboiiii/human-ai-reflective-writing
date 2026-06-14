'use client';

import styles from './ideation-qa.module.css';
import type { QATurn, ElementProgress, ElementKey } from '@/types/ideation';

interface SidePanelProps {
  turns: QATurn[];
  answerSummaries: Record<string, string>;
  elementProgressMax: ElementProgress;
  currentElement: ElementKey | null;
  completionThreshold: number;
}

const ELEMENT_LABELS: Record<ElementKey, string> = {
  orientation: '외적 사실',
  feelings: '감정·반응',
  evaluation: '평가',
  takeaway: '깨달음·여운',
};

const ELEMENT_ORDER: ElementKey[] = ['orientation', 'feelings', 'evaluation', 'takeaway'];

function ProgressGauge({
  label,
  value,
  isActive,
  completionThreshold,
}: {
  label: string;
  value: number;
  isActive: boolean;
  completionThreshold: number;
}) {
  // Normalize: (actual / threshold) * 100, capped at 100%
  // If completionThreshold is 70 and value is 70, display 100%
  const normalized = (value / completionThreshold) * 100;
  const percentage = Math.min(100, Math.max(0, normalized));

  return (
    <div className={`${styles.gauge} ${isActive ? styles.gaugeActive : ''}`}>
      <div className={styles.gaugeLabel}>
        {label}
        {isActive && <span className={styles.gaugeActiveDot} aria-label="현재 질문 요소" />}
      </div>
      <div className={styles.gaugeBarContainer}>
        <div
          className={styles.gaugeBar}
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          role="progressbar"
        />
      </div>
      <div className={styles.gaugeValue}>{percentage}%</div>
    </div>
  );
}

export function SidePanel({
  turns,
  answerSummaries,
  elementProgressMax,
  currentElement,
  completionThreshold,
}: SidePanelProps) {
  // Only answers that earned a summary slot (main/followup) appear here.
  // skip/clarification answers are never keyed into answerSummaries.
  const userAnswers = turns.filter(
    (t) => t.role === 'user' && Object.prototype.hasOwnProperty.call(answerSummaries, t.id),
  );

  return (
    <aside className={styles.sidePanel}>
      {/* Gauges Section */}
      <div className={styles.sidePanelGauges}>
        <h3 className={styles.sidePanelHeading}>완성도</h3>
        <div className={styles.gaugesGrid}>
          {ELEMENT_ORDER.map((key) => (
            <ProgressGauge
              key={key}
              label={ELEMENT_LABELS[key]}
              value={elementProgressMax[key]}
              isActive={currentElement === key}
              completionThreshold={completionThreshold}
            />
          ))}
        </div>
      </div>

      {/* Answers Accumulation Section */}
      <div className={styles.sidePanelAnswers}>
        <h3 className={styles.sidePanelHeading}>지금까지의 답변</h3>
        {userAnswers.length === 0 ? (
          <p className={styles.sidePanelEmpty}>아직 답변이 없어요.</p>
        ) : (
          <ul className={styles.answersList}>
            {userAnswers.map((answer) => {
              const summary = answerSummaries[answer.id];
              const pending = !summary; // '' until the summary LLM returns (or on failure)
              return (
                <li key={answer.id} className={styles.answerItem}>
                  <p
                    className={`${styles.answerText}${pending ? ` ${styles.answerTextPending}` : ''}`}
                  >
                    {summary || answer.content}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
