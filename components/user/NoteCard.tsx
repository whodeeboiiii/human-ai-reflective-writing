'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Note } from '@/types/writing';
import styles from './user.module.css';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
};

interface NoteCardProps {
  note: Note;
  index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
  const ordinal = String(index + 1).padStart(3, '0');
  return (
    <motion.li className={styles.noteCard} variants={cardVariants}>
      <Link href={`/app/write/${note.id}`} className={styles.noteCardLink}>
        <span className={styles.noteCardCorner}>{ordinal}</span>
        <h2 className={styles.noteTitle}>{note.title}</h2>
        <p className={styles.notePreview}>{note.preview}</p>
        <div className={styles.noteMeta}>
          <span className={styles.noteDate}>{note.modified}</span>
          <span className={styles.noteTag}>{note.tag}</span>
        </div>
      </Link>
    </motion.li>
  );
}

export function NewNoteCard() {
  return (
    <motion.li className={`${styles.noteCard} ${styles.noteCardNew}`} variants={cardVariants}>
      <Link href="/app/write" className={styles.noteCardLink} aria-label="새 글 쓰기">
        <span className={styles.noteCardCorner}>001 / new</span>
        <span className={styles.noteNewIcon} aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="24" y1="10" x2="24" y2="38" />
            <line x1="10" y1="24" x2="38" y2="24" />
          </svg>
        </span>
        <span className={styles.noteNewLabel}>새 글 쓰기</span>
        <span className={styles.noteNewHint}>백지에서 시작 →</span>
      </Link>
    </motion.li>
  );
}
