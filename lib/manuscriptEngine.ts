import type { Cell, DolphinState } from './types'
import { CHARS_PER_PAGE } from './constants'

/**
 * テキストを Cell 配列に変換する。
 * - 改行文字 \n はスキップ（セルとして扱わない）
 * - 空白は文字として扱う
 * - 最大 CHARS_PER_PAGE (400) セルまで
 */
export function splitTextToCells(text: string): Cell[] {
  return Array.from(text)
    .filter(c => c !== '\n')
    .slice(0, CHARS_PER_PAGE)
    .map(char => ({ char }))
}

/**
 * 進捗（0.0〜1.0）から DolphinState を返す純粋関数。
 * progress = currentChars / targetChars
 */
export function getDolphinState(progress: number): DolphinState {
  if (progress >= 1.0) return 'jump'
  if (progress >= 0.9) return 'celebrating'
  if (progress >= 0.6) return 'excited'
  if (progress >= 0.3) return 'guiding'
  return 'idle'
}
