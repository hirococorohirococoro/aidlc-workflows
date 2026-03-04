'use client'

import { useManuscriptStore } from '@/app/store/manuscriptStore'
import type { DolphinState } from '@/lib/types'

const DOLPHIN_LABELS: Record<DolphinState, string> = {
  idle: '🐬 idle',
  guiding: '🐬 guiding',
  excited: '🐬 excited',
  celebrating: '🐬 celebrating',
  jump: '🐬 jump',
}

export default function DolphinIndicator() {
  const dolphinState = useManuscriptStore(state => state.dolphinState)

  return (
    <div className="dolphin-indicator">
      {DOLPHIN_LABELS[dolphinState]}
    </div>
  )
}
