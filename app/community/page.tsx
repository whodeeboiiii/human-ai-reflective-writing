'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchPosts } from '@/lib/community';
import { logEvent } from '@/lib/events';
import type { CommunityPost, Genre, SortOrder } from '@/types/community';
import { PostCard, PostCardSkeleton } from '@/components/community/PostCard';
import { GenreTabs } from '@/components/community/GenreTabs';
import { SearchBar } from '@/components/community/SearchBar';
import styles from '@/components/community/community.module.css';

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, '');
}

const HIDDEN_KEY = 'flect_hidden_posts';
function getHiddenIds(): string[] {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]'); } catch { return []; }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  const [activeGenre, setActiveGenre] = useState<Genre | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('latest');

  const year = new Date().getFullYear();

  useEffect(() => {
    logEvent('community_visit'); // H3 분모
    setHiddenIds(getHiddenIds());
    fetchPosts('all')
      .then(setPosts)
      .catch(() => setError('글 목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    // 숨긴 글 제외
    let result = posts.filter((p) => !hiddenIds.includes(p.id));

    // 장르 필터
    if (activeGenre !== 'all') {
      result = result.filter((p) => p.genre === activeGenre);
    }

    // 검색 (제목 + 닉네임 + 태그)
    if (query.trim()) {
      const q = normalize(query);
      result = result.filter(
        (p) =>
          normalize(p.title).includes(q) ||
          normalize(p.author_nickname).includes(q) ||
          normalize(p.tags).includes(q)
      );
    }

    // 정렬
    return [...result].sort((a, b) =>
      sort === 'latest'
        ? new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
        : b.likes - a.likes
    );
  }, [posts, activeGenre, query, sort, hiddenIds]);

  return (
    <div className={styles.feedPage}>
      {/* ── Header ─────────────────────────────────── */}
      <header className={styles.feedHeader}>
        <Link href="/" className={styles.feedBrand} aria-label="Flect 홈">
          Flect
        </Link>
        <Link href="/app" className={styles.myPostsBtn}>
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v7" />
            <path d="M1 12h14" />
            <path d="M6 8h4" />
          </svg>
          내 글
        </Link>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className={styles.feedHero}>
        <p className={styles.feedEyebrow}>Community · Flect</p>
        <h1 className={styles.feedTitle}>
          사람들의 <em>진짜 이야기</em>
        </h1>
        <p className={styles.feedSub}>Flect로 쓴 글들을 모아봤어요.</p>
      </section>

      {/* ── Toolbar ────────────────────────────────── */}
      <div className={styles.feedToolbar}>
        <GenreTabs active={activeGenre} onChange={setActiveGenre} />

        <div className={styles.feedToolbarRow}>
          <SearchBar value={query} onChange={setQuery} />

          <div className={styles.sortToggle}>
            <button
              className={`${styles.sortBtn} ${sort === 'latest' ? styles.sortBtnActive : ''}`}
              onClick={() => setSort('latest')}
            >
              최신순
            </button>
            <button
              className={`${styles.sortBtn} ${sort === 'popular' ? styles.sortBtnActive : ''}`}
              onClick={() => setSort('popular')}
            >
              인기순
            </button>
          </div>
        </div>
      </div>

      {/* ── Feed ───────────────────────────────────── */}
      <section className={styles.feedSection}>
        {error && <p style={{ color: '#e05252', marginBottom: 24 }}>{error}</p>}

        {!loading && !error && (
          <p className={styles.feedCount}>
            {filtered.length}개의 글
          </p>
        )}

        <ul className={styles.postGrid}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}

          {!loading &&
            filtered.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
        </ul>

        {!loading && filtered.length === 0 && !error && (
          <div className={styles.feedEmpty}>
            <p>검색 결과가 없어요.</p>
            <p className={styles.feedEmptySub}>다른 검색어나 장르를 시도해 보세요.</p>
          </div>
        )}
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">Flect</div>
            <div className="footer-meta">
              <span>© {year} Flect.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
