import styles from './ideation-input.module.css';
import { MAIN_SCREENS, OPTIONAL_SCREENS, type ScreenName } from '@/lib/data/ideation';

interface Props {
  current: ScreenName;
  optionalActivated: boolean;
}

function dotState(target: ScreenName, current: ScreenName): 'past' | 'current' | 'future' {
  if (target === current) return 'current';

  const inMain = MAIN_SCREENS.includes(target);
  const inOptional = OPTIONAL_SCREENS.includes(target);
  const currentInMain = MAIN_SCREENS.includes(current);
  const currentInOptional = OPTIONAL_SCREENS.includes(current);

  if (inMain && currentInMain) {
    return MAIN_SCREENS.indexOf(target) < MAIN_SCREENS.indexOf(current) ? 'past' : 'future';
  }
  if (inOptional && currentInOptional) {
    return OPTIONAL_SCREENS.indexOf(target) < OPTIONAL_SCREENS.indexOf(current) ? 'past' : 'future';
  }
  if (inMain && (currentInOptional || current === 'optional-gate' || current === 'complete')) {
    return 'past';
  }
  if (inOptional && current === 'complete') {
    return 'past';
  }
  return 'future';
}

export function ProgressDots({ current, optionalActivated }: Props) {
  const isMain = MAIN_SCREENS.includes(current);
  const isOptional = OPTIONAL_SCREENS.includes(current);
  const showProgress = isMain || isOptional || current === 'optional-gate';
  const optionalShown = isOptional || (current === 'optional-gate' && optionalActivated);

  function dotClass(target: ScreenName): string {
    const state = dotState(target, current);
    return [
      styles.ixDot,
      state === 'past' ? styles.isPast : '',
      state === 'current' ? styles.isCurrent : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return (
    <nav
      className={`${styles.ixProgress}${showProgress ? '' : ` ${styles.isHidden}`}`}
      aria-label="진행 상황"
    >
      <div className={styles.ixDotGroup}>
        {MAIN_SCREENS.map((name) => (
          <span key={name} className={dotClass(name)} />
        ))}
      </div>
      <div
        className={`${styles.ixDotGroup} ${styles.ixDotGroupOptional}${optionalShown ? ` ${styles.isShown}` : ''}`}
      >
        {OPTIONAL_SCREENS.map((name) => (
          <span key={name} className={dotClass(name)} />
        ))}
      </div>
    </nav>
  );
}
