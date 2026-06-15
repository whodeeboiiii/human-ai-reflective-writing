'use client';

import { useState } from 'react';
import styles from './quick-qa.module.css';

interface Props {
  canSkip: boolean; // 서브질문일 때만 true (§4.3)
  onSkip: () => void;
}

// 질문 건너뛰기 버튼. 메인질문에서는 비활성(회색) + 안내 (§4.3).
// 모바일에선 hover가 없으므로 비활성 상태를 tap하면 안내를 잠깐 띄운다.
export function SkipGuard({ canSkip, onSkip }: Props) {
  const [hintShown, setHintShown] = useState(false);

  function handleClick() {
    if (canSkip) {
      onSkip();
      return;
    }
    // 비활성 상태 tap → 안내 노출
    setHintShown(true);
    setTimeout(() => setHintShown(false), 2200);
  }

  return (
    <div className={styles.skipGuardWrap}>
      {hintShown && !canSkip && (
        <span className={styles.skipGuardHint} role="status">
          이 질문은 대답해주세요.
        </span>
      )}
      <button
        type="button"
        className={`${styles.skipBtn}${canSkip ? '' : ` ${styles.skipBtnDisabled}`}`}
        aria-disabled={!canSkip}
        title={canSkip ? '이 질문 건너뛰기' : '이 질문은 대답해주세요.'}
        onClick={handleClick}
      >
        건너뛰기
      </button>
    </div>
  );
}
