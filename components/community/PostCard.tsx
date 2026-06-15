'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getReadingTime } from '@/lib/readingTime';
import type { CommunityPost } from '@/types/community';
import styles from './community.module.css';

interface Props {
  post: CommunityPost;
  index?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function PostCard({ post, index = 0 }: Props) {
  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const readingTime = getReadingTime(post.content);

  return (
    <motion.li
      className={styles.postCard}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <Link href={`/community/${post.id}`} className={styles.postCardLink}>
        {/* 읽기 시간 뱃지 */}
        <span className={styles.readingBadge}>{readingTime}</span>

        {/* 장르 + 닉네임 */}
        <div className={styles.postCardMeta}>
          <span className={styles.genreBadge}>{post.genre}</span>
          <span className={styles.authorName}>{post.author_nickname}</span>
        </div>

        {/* 제목 */}
        <h2 className={styles.postCardTitle}>{post.title}</h2>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className={styles.tagList}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* 하단: 날짜 + 좋아요 */}
        <div className={styles.postCardBottom}>
          <span className={styles.postDate}>{formatDate(post.publish_date)}</span>
          <span className={styles.likeCount}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 13.5S1.5 9.5 1.5 5.5a3 3 0 0 1 6-0.5 3 3 0 0 1 6 0.5c0 4-6.5 8-6.5 8z" />
            </svg>
            {post.likes}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export function PostCardSkeleton() {
  return (
    <li className={`${styles.postCard} ${styles.postCardSkeleton}`} aria-hidden="true">
      <div className={styles.skeletonLine} style={{ width: '40%', height: 11, marginBottom: 16 }} />
      <div className={styles.skeletonLine} style={{ width: '90%', height: 20, marginBottom: 10 }} />
      <div className={styles.skeletonLine} style={{ width: '70%', height: 20, marginBottom: 20 }} />
      <div className={styles.skeletonLine} style={{ width: '55%', height: 11 }} />
    </li>
  );
}
