import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StructuredInput } from '@/types/structured-input';

interface StructuredInputStore {
  answers: Partial<StructuredInput>;
  isComplete: boolean;
  optionalStarted: boolean;
  setAnswer: (partial: Partial<StructuredInput>) => void;
  setOptionalStarted: (v: boolean) => void;
  reset: () => void;
}

function computeIsComplete(answers: Partial<StructuredInput>): boolean {
  return (
    answers.genre != null &&
    answers.topicSentence != null &&
    answers.topicSentence.trim() !== '' &&
    answers.ideaReadiness != null &&
    answers.writingFrequency != null &&
    answers.userInterventionWant != null
  );
}

export const useStructuredInputStore = create<StructuredInputStore>()(
  persist(
    (set) => ({
      answers: {},
      isComplete: false,
      optionalStarted: false,
      setAnswer: (partial) =>
        set((state) => {
          const next = { ...state.answers, ...partial };
          return { answers: next, isComplete: computeIsComplete(next) };
        }),
      setOptionalStarted: (v) => set({ optionalStarted: v }),
      reset: () => set({ answers: {}, isComplete: false, optionalStarted: false }),
    }),
    {
      name: 'flect-structured-input',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
