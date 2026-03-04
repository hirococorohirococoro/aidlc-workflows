import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DolphinState } from '@/lib/types'

interface ManuscriptStore {
  text: string
  cursorIndex: number
  isDirty: boolean
  dolphinState: DolphinState

  setText: (text: string) => void
  setCursorIndex: (index: number) => void
  setDolphinState: (state: DolphinState) => void
  resetManuscript: () => void
}

const defaultState = {
  text: '',
  cursorIndex: 0,
  isDirty: false,
  dolphinState: 'idle' as DolphinState,
}

export const useManuscriptStore = create<ManuscriptStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setText: (text) => set({ text, isDirty: true }),

      setCursorIndex: (cursorIndex) => set({ cursorIndex }),

      setDolphinState: (dolphinState) => set({ dolphinState }),

      resetManuscript: () => set(defaultState),
    }),
    {
      name: 'manuscript-data',
      // isDirty は永続化しない（ロード時は常に false）
      partialize: (state) => ({
        text: state.text,
        cursorIndex: state.cursorIndex,
        dolphinState: state.dolphinState,
      }),
    }
  )
)
