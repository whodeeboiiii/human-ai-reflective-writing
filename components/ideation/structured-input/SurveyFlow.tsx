'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import {
  SEQUENCE,
  MAIN_SCREENS,
  OPTIONAL_SCREENS,
  SCREENS_DATA,
  type ScreenName,
} from '@/lib/data/ideation';
import type { StructuredInput } from '@/types/structured-input';
import { ProgressDots } from './ProgressDots';
import { QuestionScreen } from './QuestionScreen';
import styles from './ideation-input.module.css';

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.06 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function SurveyFlow({ sessionId }: { sessionId: string }) {
  const { answers, setAnswer } = useStructuredInputStore();
  const [current, setCurrent] = useState<ScreenName>('intro');
  const [optionalActivated, setOptionalActivated] = useState(false);
  const [firingValue, setFiringValue] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('ideation');
    return () => document.body.classList.remove('ideation');
  }, []);

  // Arrow-left keyboard shortcut for back navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key !== 'ArrowLeft') return;
      if (current === 'genre' || current === 'intro' || current === 'complete') return;
      e.preventDefault();
      setHistory((h) => {
        const prev = h[h.length - 1];
        if (!prev) return h;
        setCurrent(prev);
        setFiringValue(null);
        return h.slice(0, -1);
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [current]);

  const [history, setHistory] = useState<ScreenName[]>([]);

  function go(name: ScreenName, opts?: { popping?: boolean }) {
    if (name === current) return;
    if (!opts?.popping) setHistory((h) => [...h, current]);
    if (OPTIONAL_SCREENS.includes(name)) setOptionalActivated(true);
    setCurrent(name);
    setFiringValue(null);
  }

  function handleBack() {
    if (current === 'genre' || current === 'intro' || current === 'complete') return;
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setCurrent(prev);
      setFiringValue(null);
      return h.slice(0, -1);
    });
  }

  function advance() {
    if (current === 'importance') { go('optional-gate'); return; }
    if (current === 'length') { go('complete'); return; }
    const i = SEQUENCE.indexOf(current);
    if (i >= 0 && i + 1 < SEQUENCE.length) go(SEQUENCE[i + 1]);
  }

  function handleChoiceSelect(answerKey: keyof StructuredInput, rawValue: string) {
    if (answerKey === 'importance') {
      setAnswer({ importance: Number(rawValue) as 1 | 2 | 3 | 4 });
    } else {
      setAnswer({ [answerKey]: rawValue } as unknown as Partial<StructuredInput>);
    }
    setFiringValue(rawValue);
    setTimeout(() => advance(), 180);
  }

  function handleOpenSubmit(value: string) {
    setAnswer({ topicSentence: value });
    advance();
  }

  const isBackHidden = current === 'intro' || current === 'complete';
  const isBackDisabled = current === 'genre';

  function renderScreen() {
    if (current === 'intro') {
      return (
        <motion.section
          key="intro"
          className={styles.ixScreen}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.ixScreenInner}>
            <p className={styles.ixEyebrow}>New Session</p>
            <h1 className={styles.ixHeading}>
              우선 당신이 쓰고 싶은 글에
              <br />
              <span className="emph">대해서 알아볼게요.</span>
            </h1>
            <p className={styles.ixSub}>
              몇 가지 질문을 통해 당신의 생각을 정리해볼게요.
              <br />
              정답은 없어요.
            </p>
            <div className={styles.ixCtaRow}>
              <button
                type="button"
                className={`${styles.ixBtn} ${styles.ixBtnPrimary}`}
                onClick={advance}
              >
                <span>시작하기</span>
                <span className={styles.ixArrow} aria-hidden="true">
                  →
                </span>
              </button>
              <p className={styles.ixCtaHint}>약 1–2분 소요 · 언제든 멈출 수 있어요</p>
            </div>
          </div>
        </motion.section>
      );
    }

    if (current === 'optional-gate') {
      return (
        <motion.section
          key="optional-gate"
          className={styles.ixScreen}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.ixScreenInner}>
            <p className={styles.ixEyebrow}>Step 1 · Optional</p>
            <h2 className={`${styles.ixHeading} ${styles.ixHeadingMid}`}>
              더 많은 정보를
              <br />
              <span className="emph">주실 건가요?</span>
            </h2>
            <p className={styles.ixSub}>
              선택사항이지만, 더 알려주시면
              <br />
              AI가 당신의 글에 더 잘 맞춰드릴 수 있어요.
            </p>
            <div className={`${styles.ixCtaRow} ${styles.ixCtaRowDual}`}>
              <button
                type="button"
                className={`${styles.ixBtn} ${styles.ixBtnPrimary}`}
                onClick={advance}
              >
                <span>네, 더 알려드릴게요</span>
                <span className={styles.ixArrow} aria-hidden="true">
                  →
                </span>
              </button>
              <button
                type="button"
                className={`${styles.ixBtn} ${styles.ixBtnGhost}`}
                onClick={() => go('complete')}
              >
                <span>건너뛰기</span>
              </button>
            </div>
          </div>
        </motion.section>
      );
    }

    if (current === 'complete') {
      return (
        <motion.section
          key="complete"
          className={styles.ixScreen}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.ixScreenInner}>
            <p className={styles.ixEyebrow}>Step 1 of 3 · Complete</p>
            <h2 className={styles.ixHeading}>
              고마워요. 이제 함께 생각을
              <br />
              <span className="emph">풀어볼 차례예요.</span>
            </h2>
            <p className={styles.ixSub}>
              다음 단계에서는 몇 가지 질문을 통해
              <br />
              당신의 이야기를 더 깊이 들여다볼게요.
            </p>
            <ul className={styles.ixPipeline} aria-hidden="true">
              <li className={styles.isDone}>
                <span className={styles.dot} />
                <span>Structured Input</span>
              </li>
              <li className={styles.isNext}>
                <span className={styles.dot} />
                <span>Q&amp;A Session</span>
              </li>
              <li>
                <span className={styles.dot} />
                <span>Outline Composition</span>
              </li>
            </ul>
            <div className={styles.ixCtaRow}>
              <Link
                href={`/app/write/${sessionId}/qa`}
                className={`${styles.ixBtn} ${styles.ixBtnPrimary}`}
              >
                <span>다음 단계로</span>
                <span className={styles.ixArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </motion.section>
      );
    }

    // Question screens (main and optional)
    const screenData = SCREENS_DATA[current];
    if (!screenData) return null;

    const selectedValue =
      answers[screenData.answerKey] != null
        ? String(answers[screenData.answerKey])
        : undefined;

    return (
      <motion.section
        key={current}
        className={styles.ixScreen}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <QuestionScreen
          screen={screenData}
          selectedValue={selectedValue}
          firingValue={firingValue ?? undefined}
          onChoiceSelect={(value) =>
            handleChoiceSelect(screenData.answerKey as keyof StructuredInput, value)
          }
          onOpenSubmit={handleOpenSubmit}
          initialTopicValue={answers.topicSentence}
        />
      </motion.section>
    );
  }

  return (
    <div>
      <header className={styles.ixTop}>
        <button
          type="button"
          className={`${styles.ixBack}${isBackDisabled ? ` ${styles.isDisabled}` : ''}`}
          hidden={isBackHidden}
          onClick={handleBack}
          aria-label="이전 질문으로"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 18 5 12 11 6" />
          </svg>
          <span>뒤로</span>
        </button>

        <ProgressDots current={current} optionalActivated={optionalActivated} />

        <Link href="/app" className={styles.ixMark} aria-label="Flect 홈">
          <span className={styles.ixMarkGlyph} aria-hidden="true" />
          <span>Flect</span>
        </Link>
      </header>

      <main className={styles.ixStage}>
        <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
      </main>
    </div>
  );
}
