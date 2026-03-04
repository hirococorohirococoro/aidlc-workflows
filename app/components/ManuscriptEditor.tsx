'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useManuscriptStore } from '@/app/store/manuscriptStore'
import { getDolphinState } from '@/lib/manuscriptEngine'
import { GRID_SIZE, CHARS_PER_PAGE } from '@/lib/constants'
import ManuscriptGrid from './ManuscriptGrid'

export default function ManuscriptEditor() {
  const { text, cursorIndex, setText, setCursorIndex, setDolphinState } =
    useManuscriptStore()

  const containerRef = useRef<HTMLDivElement>(null)

  // マウント時にフォーカスを当てる
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // 文字数の変化に応じて DolphinState を更新（純粋関数で計算）
  useEffect(() => {
    const charCount = Array.from(text).filter(c => c !== '\n').length
    const progress = Math.min(charCount / CHARS_PER_PAGE, 1.0)
    setDolphinState(getDolphinState(progress))
  }, [text, setDolphinState])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // IME 変換中はブラウザに処理を委譲
      if (e.nativeEvent.isComposing) return

      if (e.key === 'Enter') {
        e.preventDefault()
        // 改行文字は挿入しない。カーソルを次の行頭へ移動するのみ
        const nextRowStart =
          Math.floor(cursorIndex / GRID_SIZE + 1) * GRID_SIZE
        setCursorIndex(Math.min(nextRowStart, CHARS_PER_PAGE))
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        // cursorIndex が 0 以下にならないよう保証
        if (cursorIndex <= 0) return
        const newIndex = cursorIndex - 1
        const newText = text.slice(0, newIndex) + text.slice(newIndex + 1)
        setText(newText)
        setCursorIndex(newIndex)
        return
      }

      // 修飾キーのみの入力・特殊キーは無視
      if (e.key.length !== 1) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      e.preventDefault()

      // 400文字上限
      if (cursorIndex >= CHARS_PER_PAGE) return

      const newText =
        text.slice(0, cursorIndex) + e.key + text.slice(cursorIndex + 1)
      setText(newText)
      setCursorIndex(cursorIndex + 1)
    },
    [text, cursorIndex, setText, setCursorIndex]
  )

  return (
    <div
      ref={containerRef}
      role="textbox"
      aria-label="原稿用紙"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none', cursor: 'default' }}
    >
      <ManuscriptGrid text={text} cursorIndex={cursorIndex} />
    </div>
  )
}
