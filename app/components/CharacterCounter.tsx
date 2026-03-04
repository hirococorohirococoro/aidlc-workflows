'use client'

import { useManuscriptStore } from '@/app/store/manuscriptStore'
import { CHARS_PER_PAGE, CELL_PLACEHOLDER } from '@/lib/constants'

export default function CharacterCounter() {
  const text = useManuscriptStore(state => state.text)
  
  // 改行を除いた文字数をカウント
  const currentCount = Array.from(text).filter(c => c !== '\n' && c !== CELL_PLACEHOLDER).length

  return (
    <div className="char-counter">
      <span className="count">{currentCount}</span>
      <span className="target"> / {CHARS_PER_PAGE} 文字</span>
    </div>
  )
}
