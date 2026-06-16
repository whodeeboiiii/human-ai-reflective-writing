'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import { SCREENS_DATA, type QuestionScreenData, type ChoiceScreenData } from '@/lib/data/ideation';
import type { StructuredInput } from '@/types/structured-input';
import type { BookContext } from '@/types/ideation';
import { logEvent } from '@/lib/events';
import { QuestionScreen } from '@/components/ideation/structured-input/QuestionScreen';
import { BookSearchPanel } from '@/components/ideation/structured-input/BookSearchPanel';
import styles from '@/components/ideation/structured-input/ideation-input.module.css';

// Quick Mode 간소화 설문 (CLAUDE_QuickMode.md §3).
// full SurveyFlow 대비: AI 개입도(userInterventionWant) 질문 + optional-gate + 선택 5문항 제거.
// 남기는 필수 질문: 장르 / 주제 문장 / 쓸 내용 정리 정도 / 글쓰기 빈도.

type QuickQuestion = 'genre' | 'topic' | 'ideaReadiness' | 'writingFrequency';
type QuickScreen = 'intro' | QuickQuestion | 'complete';

const QUICK_ORDER: QuickQuestion[] = ['genre', 'topic', 'ideaReadiness', 'writingFrequency'];

// 기존 SCREENS_DATA 재사용 + eyebrow를 "N of 4"로 교체, writingFrequency의
// AI 개입도 관련 sub 제거(Quick엔 개입도 개념이 없음).
const QUICK_SCREENS: Record<QuickQuestion, QuestionScreenData> = {
  genre: { ...(SCREENS_DATA.genre as QuestionScreenData), eyebrow: 'Question 1 of 4' },
  topic: { ...(SCREENS_DATA.topic as QuestionScreenData), eyebrow: 'Question 2 of 4' },
  ideaReadiness: { ...(SCREENS_DATA.ideaReadiness as QuestionScreenData), eyebrow: 'Question 3 of 4' },
  writingFrequency: {
    ...(SCREENS_DATA.writingFrequency as ChoiceScreenData),
    eyebrow: 'Question 4 of 4',
    sub: undefined, // Quick엔 개입도 개념이 없으므로 "AI 개입 정도가 정해져요" 문구 제거
  },
};

function extractBookTitle(sentence: string): string {
  const patterns = [/<(.+?)>/, /『(.+?)』/, /「(.+?)」/, /《(.+?)》/, /"(.+?)"/, /“(.+?)”/];
  for (const p of patterns) {
    const m = sentence.match(p);
    if (m?.[1]) return m[1].trim();
  }
  const laMatch = sentence.match(/(\S+)라는\s*(?:책|소설|에세이|작품|도서)/);
  if (laMatch?.[1]) return laMatch[1].trim();
  return sentence.slice(0, 40).trim();
}

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.06 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function QuickDots({ current }: { current: QuickScreen }) {
  const idx = QUICK_ORDER.indexOf(current as QuickQuestion);
  const show = idx >= 0;
  return (
    <nav
      className={`${styles.ixProgress}${show ? '' : ` ${styles.isHidden}`}`}
      aria-label="진행 상황"
    >
      <div className={styles.ixDotGroup}>
        {QUICK_ORDER.map((name, i) => (
          <span
            key={name}
            className={[
              styles.ixDot,
              i < idx ? styles.isPast : '',
              i === idx ? styles.isCurrent : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </nav>
  );
}

export default function QuickStructuredInput({ sessionId }: { sessionId: string }) {
  const { answers, setAnswer } = useStructuredInputStore();
  const [current, setCurrent] = useState<QuickScreen>('intro');
  const [, setHistory] = useState<QuickScreen[]>([]);
  const [firingValue, setFiringValue] = useState<string | null>(null);
  const [bookSearchVisible, setBookSearchVisible] = useState(false);
  const [submittedTopicValue, setSubmittedTopicValue] = useState('');

  // Pipeline entry — wipe previous session data (한 번만).
  const hasResetRef = useRef(false);
  useEffect(() => {
    if (hasResetRef.current) return;
    hasResetRef.current = true;
    useStructuredInputStore.getState().reset();
    useIdeationStore.getState().reset();
  }, []);

  useEffect(() => {
    document.body.classList.add('ideation');
    return () => document.body.classList.remove('ideation');
  }, []);

  // structured_first_input 로깅 — 첫 질문에 실제로 답한 순간(실 참여 시작) 1회.
  const loggedFirstRef = useRef(false);
  function logFirstInputOnce() {
    if (loggedFirstRef.current) return;
    loggedFirstRef.current = true;
    logEvent('structured_first_input');
  }

  // structured_done 로깅 (H1 보조 분모). complete 화면 진입 시 1회.
  const loggedDoneRef = useRef(false);
  useEffect(() => {
    if (current === 'complete' && !loggedDoneRef.current) {
      loggedDoneRef.current = true;
      logEvent('structured_done');
    }
  }, [current]);

  function go(name: QuickScreen) {
    if (name === current) return;
    setHistory((h) => [...h, current]);
    setCurrent(name);
    setFiringValue(null);
  }

  function handleBack() {
    if (bookSearchVisible) {
      setBookSearchVisible(false);
      return;
    }
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setCurrent(prev);
      setFiringValue(null);
      return h.slice(0, -1);
    });
  }

  function advance() {
    if (current === 'intro') return go('genre');
    if (current === 'writingFrequency') return go('complete');
    const i = QUICK_ORDER.indexOf(current as QuickQuestion);
    if (i >= 0 && i + 1 < QUICK_ORDER.length) go(QUICK_ORDER[i + 1]);
  }

  function handleChoiceSelect(answerKey: keyof StructuredInput, rawValue: string) {
    logFirstInputOnce(); // 첫 질문(genre)이 choice라 보통 여기서 첫 입력이 잡힘
    setAnswer({ [answerKey]: rawValue } as unknown as Partial<StructuredInput>);
    setFiringValue(rawValue);
    setTimeout(() => advance(), 180);
  }

  function handleOpenSubmit(value: string) {
    logFirstInputOnce();
    setAnswer({ topicSentence: value });
    if (useStructuredInputStore.getState().answers.genre === 'book-review') {
      setSubmittedTopicValue(value);
      setBookSearchVisible(true);
    } else {
      advance();
    }
  }

  function handleBookConfirm(ctx: BookContext) {
    useStructuredInputStore.getState().setSelectedBookContext(ctx);
    setBookSearchVisible(false);
    advance();
  }

  function handleBookSkip() {
    useStructuredInputStore.getState().setSelectedBookContext(null);
    setBookSearchVisible(false);
    advance();
  }

  const isBackHidden = current === 'intro' || current === 'complete';

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
            <p className={styles.ixEyebrow}>Quick Mode</p>
            <h1 className={styles.ixHeading}>
              우선 당신이 쓰고 싶은 글에
              <br />
              <span className="emph">대해서 알아볼게요.</span>
            </h1>
            <p className={styles.ixSub}>
              네 가지 질문이면 충분해요.
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
              <p className={styles.ixCtaHint}>약 30초 소요 · 언제든 멈출 수 있어요</p>
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
            <p className={styles.ixEyebrow}>Complete</p>
            <h2 className={styles.ixHeading}>
              고마워요. 이제 함께 생각을
              <br />
              <span className="emph">풀어볼 차례예요.</span>
            </h2>
            <p className={styles.ixSub}>
              다음 단계에서는 짧은 질문 몇 개로
              <br />
              당신의 이야기를 끌어낼게요.
            </p>
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

    // 독후감: 주제 제출 후 책 검색 패널
    if (current === 'topic' && bookSearchVisible) {
      return (
        <motion.section
          key="topic-book-search"
          className={`${styles.ixScreen} ${styles.ixScreenScroll}`}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.ixScreenInner}>
            <p className={styles.ixEyebrow}>Question 2 of 4</p>
            <div className={styles.ixSubmittedTopic}>
              <p className={styles.ixSubmittedTopicText}>&ldquo;{submittedTopicValue}&rdquo;</p>
              <button
                type="button"
                className={styles.ixSubmittedTopicEdit}
                onClick={() => setBookSearchVisible(false)}
              >
                ← 수정하기
              </button>
            </div>
            <BookSearchPanel
              initialQuery={extractBookTitle(submittedTopicValue)}
              onConfirm={handleBookConfirm}
              onSkip={handleBookSkip}
            />
          </div>
        </motion.section>
      );
    }

    const screenData = QUICK_SCREENS[current as QuickQuestion];
    if (!screenData) return null;

    const selectedValue =
      answers[screenData.answerKey] != null ? String(answers[screenData.answerKey]) : undefined;

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
          className={styles.ixBack}
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

        <QuickDots current={current} />

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
