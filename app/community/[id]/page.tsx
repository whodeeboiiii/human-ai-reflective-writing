'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchPost } from '@/lib/community';
import { getReadingTime } from '@/lib/readingTime';
import type { CommunityPost } from '@/types/community';
import type { Outline } from '@/types/ideation';
import { LikeButton } from '@/components/community/LikeButton';
import styles from '@/components/community/community.module.css';

// ── localStorage helpers ────────────────────────────────────────────────
const HIDDEN_KEY = 'flect_hidden_posts';

function getHiddenIds(): string[] {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]'); } catch { return []; }
}
function addHiddenId(id: string): void {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...getHiddenIds(), id]));
}
function removeHiddenId(id: string): void {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(getHiddenIds().filter((x) => x !== id)));
}

// ── Date formatter ──────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ── Outline parser ──────────────────────────────────────────────────────
function parseOutline(json: string): Outline | null {
  if (!json) return null;
  try { return JSON.parse(json) as Outline; } catch { return null; }
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const year = new Date().getFullYear();

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch(() => setError('글을 불러올 수 없어요.'))
      .finally(() => setLoading(false));

    setHidden(getHiddenIds().includes(id));
  }, [id]);

  // 메뉴 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHide = () => {
    addHiddenId(id);
    setHidden(true);
    setMenuOpen(false);
    router.push('/community');
  };

  const handleUnhide = () => {
    removeHiddenId(id);
    setHidden(false);
    setMenuOpen(false);
  };

  // ── States ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailLoading}>불러오는 중…</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailError}>
          {error || '글을 찾을 수 없어요.'}
          <br />
          <Link href="/community" style={{ color: 'var(--accent-deep)', textDecoration: 'underline', marginTop: 12, display: 'inline-block' }}>
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const outline = parseOutline(post.outline_json);
  const readingTime = getReadingTime(post.content);

  // outline cards 순서 적용
  const orderedCards = (() => {
    if (!outline) return [];
    const { cards, userArrangedOrder } = outline;
    if (!userArrangedOrder) return cards;
    const byId = new Map(cards.map((c) => [c.id, c]));
    const ordered = userArrangedOrder.map((oid) => byId.get(oid)).filter(Boolean) as typeof cards;
    const rest = cards.filter((c) => !userArrangedOrder.includes(c.id));
    return [...ordered, ...rest];
  })();

  return (
    <div className={styles.detailPage}>
      {/* ── Header ──────────────────────────────────────── */}
      <header className={styles.detailHeader}>
        <Link href="/community" className={styles.detailBack}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 18 5 12 11 6" />
          </svg>
          커뮤니티
        </Link>

        <div className={styles.detailActions}>
          <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
              <rect x="8" y="2" width="6" height="6" rx="1" />
            </svg>
            {copied ? '복사됨 ✓' : '링크 복사'}
          </button>

          <div className={styles.hideMenuWrap} ref={menuRef}>
            <button
              className={styles.hideMenuTrigger}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="더 보기"
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
                <circle cx="8" cy="3" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="8" cy="13" r="1.3" />
              </svg>
            </button>

            {menuOpen && (
              <div className={styles.hideMenuDropdown}>
                {hidden ? (
                  <button className={styles.hideMenuItem} onClick={handleUnhide}>
                    숨김 해제
                  </button>
                ) : (
                  <button className={styles.hideMenuItem} onClick={handleHide}>
                    이 글 숨기기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <motion.div
        className={styles.detailMain}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 본문 컬럼 */}
        <article>
          {/* 메타 */}
          <div className={styles.detailMeta}>
            <span className={styles.detailGenreBadge}>{post.genre}</span>
            <span className={styles.detailAuthor}>{post.author_nickname}</span>
            <span className={styles.detailDate}>{formatDate(post.publish_date)}</span>
            <span className={styles.detailReadingTime}>{readingTime} 읽기</span>
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className={styles.detailTagList}>
              {tags.map((tag) => (
                <span key={tag} className={styles.detailTag}>#{tag}</span>
              ))}
            </div>
          )}

          {/* 제목 */}
          <h1 className={styles.detailTitle}>{post.title}</h1>

          {/* 본문 (Tiptap HTML → dangerouslySetInnerHTML) */}
          <div
            className={styles.detailContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 좋아요 */}
          <div className={styles.detailLikeRow}>
            <LikeButton postId={post.id} initialLikes={post.likes} />
          </div>
        </article>

        {/* Outline 사이드바 */}
        <aside className={styles.outlineSidebar}>
          <p className={styles.outlineSidebarTitle}>아이디어 아웃라인</p>
          {orderedCards.length > 0 ? (
            <ul className={styles.outlineCardList}>
              {orderedCards.map((card) => (
                <li key={card.id} className={styles.outlineCard}>
                  {card.content}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.outlineEmpty}>아웃라인 정보가 없어요.</p>
          )}
        </aside>
      </motion.div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">Flect</div>
            <div className="footer-meta"><span>© {year} Flect.</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
