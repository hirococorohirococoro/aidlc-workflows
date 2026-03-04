import { splitTextToCells } from '@/lib/manuscriptEngine'
import { GRID_SIZE, CHARS_PER_PAGE } from '@/lib/constants'
import type { Cell, GridCell } from '@/lib/types'

interface ManuscriptGridProps {
  text: string
  cursorIndex?: number
}

function buildGridCells(text: string): GridCell[] {
  const raw: Cell[] = splitTextToCells(text)

  const cells: Cell[] = [...raw]
  while (cells.length < CHARS_PER_PAGE) {
    cells.push({ char: '' })
  }

  return cells.slice(0, CHARS_PER_PAGE).map((cell, index) => ({
    ...cell,
    // 縦書き: 右端の列から左へ、各列は上から下へ
    // index 0 → 右端列・1行目、index 19 → 右端列・20行目、index 20 → 右から2列目・1行目
    colIndex: GRID_SIZE - Math.floor(index / GRID_SIZE),  // 1-indexed（GRID_SIZEが右端）
    rowIndex: (index % GRID_SIZE) + 1,                    // 1-indexed
  }))
}

export default function ManuscriptGrid({ text, cursorIndex }: ManuscriptGridProps) {
  const gridCells = buildGridCells(text)

  return (
    <div
      className="manuscript-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
      }}
    >
      {gridCells.map((cell, index) => {
        const typeClass = cell.type && cell.type !== 'normal' ? `cell-${cell.type}` : ''
        const cursorClass = cursorIndex === index ? 'cursor' : ''
        const className = ['cell', typeClass, cursorClass].filter(Boolean).join(' ')

        // 長音符号（ー）はスパンで90度回転して縦に見せる
        const content =
          cell.type === 'chouon' && cell.char ? (
            <span className="chouon-inner">{cell.char}</span>
          ) : (
            cell.char
          )

        return (
          <div
            key={index}
            className={className}
            style={{
              gridColumn: cell.colIndex,
              gridRow: cell.rowIndex,
            }}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
