export type CellType =
  | 'normal'      // 通常文字
  | 'punctuation' // 句読点・感嘆符（。、！？）→ セル右上寄せ
  | 'small-kana'  // 小書き仮名（ぁぃぅ等）→ セル右上寄せ・小さく
  | 'chouon'      // 長音符号（ー）→ 90度回転
  | 'latin'       // ASCII・ラテン文字 → 縦中横

export type Cell = {
  char: string
  type?: CellType
}

export type GridCell = Cell & {
  colIndex: number
  rowIndex: number
}

export type DolphinState =
  | 'idle'
  | 'guiding'
  | 'excited'
  | 'celebrating'
  | 'jump'
