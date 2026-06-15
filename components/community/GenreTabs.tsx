'use client';

import { motion } from 'framer-motion';
import { GENRES, type Genre } from '@/types/community';
import styles from './community.module.css';

interface Props {
  active: Genre | 'all';
  onChange: (genre: Genre | 'all') => void;
}

const ALL_TABS: { value: Genre | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  ...GENRES.map((g) => ({ value: g, label: g })),
];

export function GenreTabs({ active, onChange }: Props) {
  return (
    <div className={styles.genreTabs} role="tablist" aria-label="장르 필터">
      {ALL_TABS.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          className={`${styles.genreTab} ${active === value ? styles.genreTabActive : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
          {active === value && (
            <motion.span
              className={styles.genreTabIndicator}
              layoutId="genre-indicator"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
