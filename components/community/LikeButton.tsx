'use client';

import { useEffect, useState } from 'react';
import { likePost } from '@/lib/community';
import { logEvent } from '@/lib/events';
import styles from './community.module.css';

const LIKED_KEY = 'flect_liked_posts';

function getLikedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function addLikedId(id: string): void {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...getLikedIds(), id]));
}

interface Props {
  postId: string;
  initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(getLikedIds().includes(postId));
  }, [postId]);

  const handleLike = async () => {
    if (liked || loading) return;

    logEvent('like'); // H3 분자

    // 낙관적 업데이트
    setLikes((n) => n + 1);
    setLiked(true);
    setLoading(true);

    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes); // 서버 실제값으로 보정
      addLikedId(postId);
    } catch {
      // 실패 시 롤백
      setLikes((n) => n - 1);
      setLiked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
      onClick={handleLike}
      disabled={liked || loading}
      aria-label={liked ? `좋아요 ${likes}개` : '좋아요'}
      aria-pressed={liked}
    >
      <svg
        viewBox="0 0 20 20"
        width="18"
        height="18"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 17S2 11.5 2 6.5a4 4 0 0 1 8-0.5 4 4 0 0 1 8 0.5C18 11.5 10 17 10 17z" />
      </svg>
      <span>{likes}</span>
    </button>
  );
}
