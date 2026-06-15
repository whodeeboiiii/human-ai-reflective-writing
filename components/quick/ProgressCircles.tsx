'use client';

import type { ElementKey, ElementProgress } from '@/types/ideation';
import styles from './quick-qa.module.css';

// 영어 4요소 용어는 비노출, 한글 라벨만 (§9.3). 순서는 진행 순서와 동일.
const ELEMENTS: { key: ElementKey; label: string }[] = [
  { key: 'orientation', label: '외적 사실' },
  { key: 'feelings', label: '감정·반응' },
  { key: 'evaluation', label: '평가' },
  { key: 'takeaway', label: '깨달음·여운' },
];

interface Props {
  elementProgress: ElementProgress;
  currentElement: ElementKey | null;
  completedElements: ElementKey[];
}

// 4요소 완성도 게이지 (§4.4). progress bar가 아니라 원형 채움(파이/도넛).
export function ProgressCircles({ elementProgress, currentElement, completedElements }: Props) {
  return (
    <div className={styles.circlesFrame} role="group" aria-label="네 가지 요소 완성도">
      {ELEMENTS.map(({ key, label }) => {
        const pct = Math.max(0, Math.min(100, Math.round(elementProgress[key] ?? 0)));
        const isCurrent = currentElement === key;
        const isDone = completedElements.includes(key) || pct >= 100;
        const fillColor = isDone ? 'var(--quick-success)' : 'var(--quick-accent)';
        return (
          <div
            key={key}
            className={[
              styles.circleItem,
              isCurrent ? styles.circleCurrent : '',
              isDone ? styles.circleDone : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div
              className={styles.circleRing}
              style={{ background: `conic-gradient(${fillColor} ${pct}%, var(--quick-track) 0)` }}
              aria-hidden="true"
            >
              <div className={styles.circleHole}>
                <span className={styles.circlePct}>{isDone ? '✓' : `${pct}%`}</span>
              </div>
            </div>
            <span className={styles.circleLabel}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
