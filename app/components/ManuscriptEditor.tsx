'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useManuscriptStore } from '@/app/store/manuscriptStore'
import { getDolphinState } from '@/lib/manuscriptEngine'
import { GRID_SIZE, CHARS_PER_PAGE, CELL_PLACEHOLDER } from '@/lib/constants'
import storageService from '@/app/services/storageService'
import ManuscriptGrid from './ManuscriptGrid'

export default function ManuscriptEditor() {
  const { text, cursorIndex, setText, setCursorIndex, setDolphinState } =
    useManuscriptStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isComposingRef = useRef(false)

  // Keep latest state accessible in native event handlers without stale closures
  const stateRef = useRef({ text, cursorIndex })
  stateRef.current = { text, cursorIndex }

  const applyInsert = useCallback(
    (toInsert: string[]) => {
      if (toInsert.length === 0) return

      const { text: t, cursorIndex: ci } = stateRef.current
      let newIndex = Math.min(Math.max(ci, 0), CHARS_PER_PAGE)

      const cells = Array.from(t)
      while (cells.length < newIndex) cells.push(CELL_PLACEHOLDER)

      for (const ch of toInsert) {
        if (newIndex >= CHARS_PER_PAGE) break
        if (cells.length <= newIndex) {
          while (cells.length <= newIndex) cells.push(CELL_PLACEHOLDER)
        }
        cells[newIndex] = ch
        newIndex++
      }

      setText(cells.join(''))
      setCursorIndex(newIndex)
    },
    [setText, setCursorIndex]
  )

  // マウント時: フォーカス
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // マウント時: ストレージ復元
  useEffect(() => {
    const saved = storageService.load()
    if (typeof saved === 'string' && saved.length > 0) {
      setText(saved)
    }
  }, [setText])

  // カーソルがテキスト長を大きく超えている場合は末尾へ寄せる（旧実装の不整合対策）
  useEffect(() => {
    const len = Math.min(Array.from(text).length, CHARS_PER_PAGE)
    if (cursorIndex > len) setCursorIndex(len)
  }, [text, cursorIndex, setCursorIndex])

  // 文字数変化 → DolphinState 更新
  useEffect(() => {
    const progress = Math.min(
      Array.from(text).filter(c => c !== '\n' && c !== CELL_PLACEHOLDER).length /
        CHARS_PER_PAGE,
      1.0
    )
    setDolphinState(getDolphinState(progress))
  }, [text, setDolphinState])

  // ── ネイティブイベントで IME + 通常入力を一括処理 ──────────────────
  // React の合成イベントではなくネイティブリスナーを使う理由:
  // Chrome では IME 開始時の最初のキー（例: "a"）は keydown.isComposing = false で
  // 発火するため、onKeyDown で e.preventDefault() しても compositionstart より
  // 前に文字が挿入されてしまう。ネイティブ input イベントの isComposing プロパティは
  // 正確で、composition 中の input は isComposing = true となるため安全に無視できる。
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const flushTextareaValue = () => {
      const value = textarea.value
      if (!value) return

      const { cursorIndex: ci } = stateRef.current
      const available = CHARS_PER_PAGE - ci
      if (available <= 0) {
        textarea.value = ''
        return
      }

      const chars = Array.from(value).slice(0, available)
      applyInsert(chars)
      textarea.value = ''
    }

    const onCompositionStart = () => {
      isComposingRef.current = true
      // 変換開始時に textarea に入っている「k」「a」等の素片を捨てる
      textarea.value = ''
    }

    const onCompositionEnd = () => {
      isComposingRef.current = false
      // compositionend の直後に input が来るが、環境差があるため保険で flush する
      queueMicrotask(flushTextareaValue)
    }

    const onInput = (e: Event) => {
      const ie = e as InputEvent
      // IME 変換中（mid-composition）は無視
      if (ie.isComposing || isComposingRef.current) return
      flushTextareaValue()
    }

    textarea.addEventListener('compositionstart', onCompositionStart)
    textarea.addEventListener('compositionend', onCompositionEnd)
    textarea.addEventListener('input', onInput)

    return () => {
      textarea.removeEventListener('compositionstart', onCompositionStart)
      textarea.removeEventListener('compositionend', onCompositionEnd)
      textarea.removeEventListener('input', onInput)
    }
  }, [setText, setCursorIndex])

  // ── キーボード: Backspace / Enter / 修飾キー ──────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // IME 変換中は干渉しない（最初のキーが compositionstart より先に来る環境があるため、
      // keyCode=229 / key=Process で先に composing 状態へ寄せる）
      const native = e.nativeEvent as unknown as { keyCode?: number; which?: number; isComposing?: boolean; key?: string }
      if (
        isComposingRef.current ||
        native.isComposing ||
        native.key === 'Process' ||
        native.keyCode === 229 ||
        native.which === 229
      ) {
        isComposingRef.current = true
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const ci = stateRef.current.cursorIndex
        // 次の列の先頭へ（縦書き: 次列 = 現在列インデックス + GRID_SIZE）
        const nextColStart = Math.floor(ci / GRID_SIZE + 1) * GRID_SIZE
        setCursorIndex(Math.min(nextColStart, CHARS_PER_PAGE))
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        const { text: t, cursorIndex: ci } = stateRef.current
        if (ci <= 0) return
        const cells = Array.from(t)
        while (cells.length < ci) cells.push(CELL_PLACEHOLDER)
        cells[ci - 1] = CELL_PLACEHOLDER
        setText(cells.join(''))
        setCursorIndex(ci - 1)
        return
      }

      // 修飾キーの組み合わせはテキストエリアに渡さない
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault()
        return
      }

      // 印字可能文字はデフォルト動作（テキストエリアへの入力）を許可し、
      // native input イベントハンドラで処理する
    },
    [setText, setCursorIndex]
  )

  return (
    <div
      style={{ outline: 'none', cursor: 'text' }}
      onClick={() => textareaRef.current?.focus()}
    >
      <ManuscriptGrid text={text} cursorIndex={cursorIndex} />

      {/* IME 対応のための hidden textarea */}
      <textarea
        ref={textareaRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
