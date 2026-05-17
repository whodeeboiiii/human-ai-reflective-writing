import { create } from 'zustand';
import type { StructuredInput } from '@/types/structured-input';

interface StructuredInputState {
  answers: StructuredInput;
  setAnswer: (partial: Partial<StructuredInput>) => void;
  reset: () => void;
}

export const useStructuredInputStore = create<StructuredInputState>((set) => ({
  answers: {},
  setAnswer: (partial) =>
    set((state) => ({ answers: { ...state.answers, ...partial } })),
  reset: () => set({ answers: {} }),
}));
