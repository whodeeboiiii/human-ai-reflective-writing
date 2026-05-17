import styles from './ideation-input.module.css';
import type { ChoiceScreenData, OpenScreenData } from '@/lib/data/ideation';
import { ChoiceCard } from './ChoiceCard';
import { OpenQuestionInput } from './OpenQuestionInput';

interface Props {
  screen: ChoiceScreenData | OpenScreenData;
  selectedValue?: string;
  firingValue?: string;
  onChoiceSelect: (value: string) => void;
  onOpenSubmit: (value: string) => void;
  initialTopicValue?: string;
}

export function QuestionScreen({
  screen,
  selectedValue,
  firingValue,
  onChoiceSelect,
  onOpenSubmit,
  initialTopicValue,
}: Props) {
  const lines = screen.question.split('\n');

  return (
    <div className={styles.ixScreenInner}>
      <p className={styles.ixEyebrow}>{screen.eyebrow}</p>
      <h2 className={styles.ixQ}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h2>

      {screen.type === 'choices' && screen.sub && (
        <p className={styles.ixQSub}>{screen.sub}</p>
      )}

      {screen.type === 'open' && (
        <OpenQuestionInput
          initialValue={initialTopicValue ?? ''}
          placeholder={screen.placeholder}
          maxLength={screen.maxLength}
          onSubmit={onOpenSubmit}
        />
      )}

      {screen.type === 'choices' && (
        <ul
          className={[
            styles.ixChoices,
            screen.layout === 'ordinal' ? styles.ixChoicesOrdinal : '',
            screen.layout === 'two-col' ? styles.ixChoicesTwoCol : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {screen.choices.map((choice, idx) => {
            const rank =
              screen.layout === 'ordinal'
                ? (choice.rank ?? String(idx + 1).padStart(2, '0'))
                : undefined;
            return (
              <li key={choice.value}>
                <ChoiceCard
                  choice={choice}
                  rank={rank}
                  isSelected={choice.value === selectedValue}
                  isFiring={choice.value === firingValue}
                  onClick={() => onChoiceSelect(choice.value)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
