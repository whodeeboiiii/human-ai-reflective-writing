'use client';

import styles from './community.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className={styles.searchWrap}>
      <svg
        className={styles.searchIcon}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        width={16}
        height={16}
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <line x1="13" y1="13" x2="18" y2="18" />
      </svg>
      <input
        className={styles.searchInput}
        type="search"
        placeholder="제목, 닉네임, 태그 검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="글 검색"
      />
      {value && (
        <button
          className={styles.searchClear}
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
