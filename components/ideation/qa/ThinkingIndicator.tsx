import styles from './ideation-qa.module.css';

interface Props {
  isCont: boolean;
  timestamp: string;
}

export function ThinkingIndicator({ isCont, timestamp }: Props) {
  return (
    <div
      className={[styles.qaMsg, styles.qaMsgAi, isCont ? styles.qaMsgCont : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.qaAvatar} aria-hidden="true">
        F
      </div>
      <div className={styles.qaBody}>
        {!isCont && (
          <div className={styles.qaMeta}>
            <span className={styles.qaName}>Flect</span>
            <span className={styles.qaMetaSep} />
            <span className={styles.qaTime}>{timestamp}</span>
          </div>
        )}
        <div className={styles.qaThinking} aria-label="생각 중…">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
