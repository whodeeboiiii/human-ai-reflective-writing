import styles from './ideation-qa.module.css';

interface Props {
  content: string;
  isCont: boolean;
  timestamp: string;
  skipped?: boolean;
}

export function UserMessage({ content, isCont, timestamp, skipped = false }: Props) {
  return (
    <div
      className={[
        styles.qaMsg,
        styles.qaMsgUser,
        isCont ? styles.qaMsgCont : '',
        skipped ? styles.qaMsgSkipped : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.qaAvatar} aria-hidden="true">
        U
      </div>
      <div className={styles.qaBody}>
        {!isCont && (
          <div className={styles.qaMeta}>
            <span className={styles.qaName}>당신</span>
            <span className={styles.qaMetaSep} />
            <span className={styles.qaTime}>{timestamp}</span>
          </div>
        )}
        <div className={styles.qaText}>
          {skipped ? '(이 질문은 건너뛰었어요)' : content}
        </div>
      </div>
    </div>
  );
}
