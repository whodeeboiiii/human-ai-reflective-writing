'use client';

import { useState, useEffect, useRef } from 'react';
import type { BookContext } from '@/types/ideation';
import styles from './ideation-input.module.css';

interface Props {
  initialQuery: string;
  onConfirm: (ctx: BookContext) => void;
  onSkip: () => void;
}

export function BookSearchPanel({ initialQuery, onConfirm, onSkip }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<BookContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<BookContext | null>(null);
  const didAutoSearch = useRef(false);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(false);
    setSelected(null);
    try {
      const res = await fetch(`/api/book-search?query=${encodeURIComponent(q.trim())}&display=5`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { results: BookContext[] };
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  useEffect(() => {
    if (didAutoSearch.current) return;
    didAutoSearch.current = true;
    if (initialQuery.trim()) doSearch(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.ixBookSearch}>
      <p className={styles.ixBookSearchLabel}>어떤 책인지 확인해 볼게요</p>

      <div className={styles.ixBookSearchRow}>
        <input
          type="text"
          className={styles.ixBookSearchField}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
          placeholder="책 제목으로 검색..."
          aria-label="책 제목 검색"
        />
        <button
          type="button"
          className={`${styles.ixBtn} ${styles.ixBtnGhost} ${styles.ixBtnSm}`}
          onClick={() => doSearch(query)}
          disabled={loading || !query.trim()}
        >
          {loading ? '검색 중' : '검색'}
        </button>
      </div>

      {loading && (
        <p className={styles.ixBookSearchStatus}>검색 중...</p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className={styles.ixBookSearchStatus}>결과가 없어요. 다른 제목을 입력해 보세요.</p>
      )}

      {!loading && results.length > 0 && (
        <ul className={styles.ixBookResults}>
          {results.map((book, i) => (
            <li key={i}>
              <button
                type="button"
                className={`${styles.ixBookResult}${selected === book ? ` ${styles.isSelected}` : ''}`}
                onClick={() => setSelected((prev) => (prev === book ? null : book))}
              >
                <span className={styles.ixBookResultRadio} aria-hidden="true" />
                <span className={styles.ixBookResultInfo}>
                  <span className={styles.ixBookResultTitle}>{book.title}</span>
                  <span className={styles.ixBookResultMeta}>
                    {book.author} · {book.publisher}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.ixBookSearchFoot}>
        <button
          type="button"
          className={`${styles.ixBtn} ${styles.ixBtnPrimary} ${styles.ixBtnSm}`}
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          <span>이 책으로 계속하기</span>
          <span className={styles.ixArrow} aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          className={styles.ixBookSearchSkip}
          onClick={onSkip}
        >
          책 정보 없이 계속하기
        </button>
      </div>
    </div>
  );
}
