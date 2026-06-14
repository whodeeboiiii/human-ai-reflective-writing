import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QATurn, Outline, BookContext, ElementProgress } from '@/types/ideation';
import type { InterventionLevel } from '@/types/intervention';

interface IdeationStore {
  turns: QATurn[];
  addTurn: (turn: QATurn) => void;
  setTurns: (turns: QATurn[]) => void;
  // One-line LLM summaries of user answers, keyed by turn id (side-panel display).
  answerSummaries: Record<string, string>;
  setAnswerSummary: (id: string, summary: string) => void;
  outline: Outline | null;
  setOutline: (o: Outline) => void;
  bookContext: BookContext | null;
  setBookContext: (ctx: BookContext) => void;
  interventionLevel: InterventionLevel | null;
  setInterventionLevel: (level: InterventionLevel) => void;
  elementProgressMax: ElementProgress;
  updateElementProgressMax: (progress: ElementProgress) => void;
  reset: () => void;
}

export const useIdeationStore = create<IdeationStore>()(
  persist(
    (set) => ({
      turns: [],
      addTurn: (turn) => set((s) => ({ turns: [...s.turns, turn] })),
      setTurns: (turns) => set({ turns }),
      answerSummaries: {},
      setAnswerSummary: (id, summary) =>
        set((s) => ({ answerSummaries: { ...s.answerSummaries, [id]: summary } })),
      outline: null,
      setOutline: (o) => set({ outline: o }),
      bookContext: null,
      setBookContext: (ctx) => set({ bookContext: ctx }),
      interventionLevel: null,
      setInterventionLevel: (level) => set({ interventionLevel: level }),
      elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
      updateElementProgressMax: (progress) =>
        set((s) => ({
          elementProgressMax: {
            orientation: Math.max(s.elementProgressMax.orientation, progress.orientation),
            feelings: Math.max(s.elementProgressMax.feelings, progress.feelings),
            evaluation: Math.max(s.elementProgressMax.evaluation, progress.evaluation),
            takeaway: Math.max(s.elementProgressMax.takeaway, progress.takeaway),
          },
        })),
      reset: () =>
        set({
          turns: [],
          answerSummaries: {},
          outline: null,
          bookContext: null,
          interventionLevel: null,
          elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
        }),
    }),
    {
      name: 'flect-ideation',
      version: 6,
      migrate: (persistedState: unknown, fromVersion: number) => {
        const state = persistedState as Record<string, unknown>;
        if (fromVersion < 2) {
          return {
            ...state,
            outline: null,
            bookContext: null,
            interventionLevel: null,
            elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
          };
        }
        if (fromVersion < 3) {
          return {
            ...state,
            bookContext: null,
            interventionLevel: null,
            elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
          };
        }
        if (fromVersion < 4) {
          return {
            ...state,
            interventionLevel: null,
            elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
          };
        }
        if (fromVersion < 5) {
          return {
            ...state,
            elementProgressMax: { orientation: 0, feelings: 0, evaluation: 0, takeaway: 0 },
            answerSummaries: {},
          };
        }
        if (fromVersion < 6) {
          return { ...state, answerSummaries: {} };
        }
        return state;
      },
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
