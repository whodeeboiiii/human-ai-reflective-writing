'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ideation-input.module.css';

interface Props {
  initialValue?: string;
  placeholder: string;
  maxLength: number;
  onSubmit: (value: string) => void;
}

export function OpenQuestionInput({ initialValue = '', placeholder, maxLength, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 180);
    return () => clearTimeout(t);
  }, []);

  const canSubmit = value.trim().length > 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) onSubmit(value.trim());
    }
  }

  return (
    <div className={styles.ixOpen}>
      <textarea
        ref={ref}
        className={styles.ixTextarea}
        rows={3}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.ixOpenFoot}>
        <span className={styles.ixCounter}>
          {value.length} / {maxLength}
        </span>
        <button
          type="button"
          className={`${styles.ixBtn} ${styles.ixBtnPrimary} ${styles.ixBtnSm}`}
          disabled={!canSubmit}
          onClick={() => onSubmit(value.trim())}
        >
          <span>완료</span>
          <span className={styles.ixArrow} aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
