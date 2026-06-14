import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIWritingInteraction } from '@/types/writing';

interface WritingStore {
  draft: string; // Tiptap HTML
  setDraft: (html: string) => void;
  interactions: AIWritingInteraction[];
  addInteraction: (i: AIWritingInteraction) => void;
  reset: () => void;
}

export const useWritingStore = create<WritingStore>()(
  persist(
    (set) => ({
      draft: '',
      setDraft: (html) => set({ draft: html }),
      interactions: [],
      addInteraction: (i) => set((s) => ({ interactions: [...s.interactions, i] })),
      reset: () => set({ draft: '', interactions: [] }),
    }),
    {
      name: 'flect-writing',
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
