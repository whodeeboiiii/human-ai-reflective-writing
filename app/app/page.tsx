'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPosts } from '@/lib/community';
import type { CommunityPost } from '@/types/community';
import { PostCard, PostCardSkeleton } from '@/components/community/PostCard';
import userStyles from '@/components/user/user.module.css';
import communityStyles from '@/components/community/community.module.css';

function getTodayLabel(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export default function UserPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const todayLabel = getTodayLabel();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchPosts('mine')
      .then(setPosts)
      .catch(() => setError('글 목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Header ───────────────────────────────── */}
      <header className={userStyles.userHeader}>
        <Link href="/app" className="hero-mark" aria-label="Flect 홈">
          Flect
        </Link>
        <Link href="/community" className={communityStyles.communityBtn}>
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="5.5" cy="6" r="2.5" />
            <circle cx="11" cy="5" r="2" />
            <path d="M1 13c0-2 2-3 4.5-3s4.5 1 4.5 3" />
            <path d="M11 10c1.5 0 3 .8 3 2.5" />
          </svg>
          커뮤니티
        </Link>
      </header>

      {/* ── Greeting ─────────────────────────────── */}
      <section className={userStyles.userGreeting}>
        <div className="wrap">
          <div className="eyebrow">
            내 글 &nbsp;·&nbsp; {todayLabel}
          </div>
          <h1>
            오늘은 어떤 이야기를<br />
            <span className="emph">담아볼까요?</span>
          </h1>
          {!loading && (
            <p className={userStyles.userGreetingSub}>
              발행한 글 <span className={userStyles.count}>{posts.length}</span>개
            </p>
          )}
        </div>
      </section>

      {/* ── Post grid ────────────────────────────── */}
      <section className={userStyles.userGridSection}>
        <div className="wrap">
          {error && <p style={{ color: '#e05252', marginBottom: 24 }}>{error}</p>}

          <ul className={communityStyles.postGrid}>
            {/* 새 글 쓰기 카드 (항상 첫 번째) */}
            <li style={{ listStyle: 'none' }}>
              <Link href="/app/write" className={userStyles.noteCardLink} aria-label="새 글 쓰기" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 200, padding: '24px', background: '#fffcf6', border: '1px dashed var(--line)', borderRadius: 6, textDecoration: 'none', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--ink-soft)', transition: 'border-color 240ms, color 240ms' }}>
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={36} height={36} aria-hidden="true">
                  <line x1="24" y1="10" x2="24" y2="38" />
                  <line x1="10" y1="24" x2="38" y2="24" />
                </svg>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>새 글 쓰기</span>
              </Link>
            </li>

            {/* 로딩 스켈레톤 */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}

            {/* 발행된 글 목록 (최신순) */}
            {!loading && posts
              .slice()
              .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
              .map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))
            }
          </ul>

          {/* 빈 상태 */}
          {!loading && posts.length === 0 && !error && (
            <div className={communityStyles.emptyState}>
              <svg className={communityStyles.emptyStateIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <rect x="8" y="6" width="32" height="36" rx="3" />
                <line x1="16" y1="16" x2="32" y2="16" />
                <line x1="16" y1="23" x2="32" y2="23" />
                <line x1="16" y1="30" x2="24" y2="30" />
              </svg>
              <p className={communityStyles.emptyStateTitle}>아직 발행한 글이 없어요.</p>
              <p className={communityStyles.emptyStateSub}>첫 글을 써볼까요?</p>
              <Link href="/app/write" className={communityStyles.emptyStateLink}>
                글 쓰기 시작하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
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
    </>
  );
}
