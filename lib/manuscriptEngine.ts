import type { Cell, CellType, DolphinState } from './types'
import { CHARS_PER_PAGE, CELL_PLACEHOLDER } from './constants'

const PUNCTUATION_CHARS = new Set([
  '。', '、', '！', '？', '…', '・', '：', '；', '「', '」', '『', '』',
])

const SMALL_KANA = new Set([
  'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
  'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ッ', 'ャ', 'ュ', 'ョ', 'ヮ',
])

const CHOUON_CHARS = new Set(['ー', '〜'])

// ASCII の印字可能文字（記号含む）
const LATIN_RE = /^[\u0021-\u007E]$/

function getCellType(char: string): CellType {
  if (PUNCTUATION_CHARS.has(char)) return 'punctuation'
  if (SMALL_KANA.has(char)) return 'small-kana'
  if (CHOUON_CHARS.has(char)) return 'chouon'
  if (LATIN_RE.test(char)) return 'latin'
  return 'normal'
}

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
    .map((char) => {
      if (char === CELL_PLACEHOLDER) return { char: '' }
      return { char, type: getCellType(char) }
    })
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
