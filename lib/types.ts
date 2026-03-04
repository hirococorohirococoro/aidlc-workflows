export type Cell = {
  char: string
  type?: 'normal' | 'punctuation'
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
