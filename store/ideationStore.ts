import { create } from 'zustand';
import type { QATurn } from '@/types/ideation';

interface IdeationState {
  turns: QATurn[];
  addTurn: (turn: QATurn) => void;
  reset: () => void;
}

export const useIdeationStore = create<IdeationState>((set) => ({
  turns: [],
  addTurn: (turn) => set((s) => ({ turns: [...s.turns, turn] })),
  reset: () => set({ turns: [] }),
}));
