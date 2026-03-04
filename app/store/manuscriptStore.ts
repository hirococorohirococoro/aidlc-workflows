import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DolphinState } from '@/lib/types'
import storageService from '@/app/services/storageService'

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

      setText: (text) => {
        storageService.save(text)
        set({ text, isDirty: true })
      },

      setCursorIndex: (cursorIndex) => set({ cursorIndex }),

      setDolphinState: (dolphinState) => set({ dolphinState }),

      resetManuscript: () => {
        storageService.clear()
        set(defaultState)
      },
    }),
    {
      // テキストは storageService で管理するため persist から除外
      name: 'manuscript-state',
      partialize: (state) => ({
        cursorIndex: state.cursorIndex,
        dolphinState: state.dolphinState,
      }),
    }
  )
)
