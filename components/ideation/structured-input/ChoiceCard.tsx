import styles from './ideation-input.module.css';
import type { Choice } from '@/lib/data/ideation';

interface Props {
  choice: Choice;
  rank?: string;
  isSelected: boolean;
  isFiring: boolean;
  onClick: () => void;
}

export function ChoiceCard({ choice, rank, isSelected, isFiring, onClick }: Props) {
  return (
    <button
      type="button"
      className={[
        styles.ixChoice,
        isSelected ? styles.isSelected : '',
        isFiring ? styles.isFiring : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-hint={choice.hint}
      onClick={onClick}
    >
      {rank !== undefined && <span className={styles.ixChoiceRank}>{rank}</span>}
      <span className={styles.ixChoiceText}>
        {choice.label}
        {choice.labelSub && <em>{choice.labelSub}</em>}
      </span>
    </button>
  );
}
