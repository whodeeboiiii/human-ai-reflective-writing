'use client';

import { motion } from 'framer-motion';
import type { Note } from '@/types/writing';
import { NoteCard, NewNoteCard } from './NoteCard';
import styles from './user.module.css';

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.32,
    },
  },
};

interface Props {
  notes: Note[];
}

export function NoteGrid({ notes }: Props) {
  return (
    <motion.ul
      className={styles.noteGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <NewNoteCard />
      {notes.map((note, i) => (
        <NoteCard key={note.id} note={note} index={i + 1} />
      ))}
    </motion.ul>
  );
}
