import { splitTextToCells } from '@/lib/manuscriptEngine'
import { GRID_SIZE, CHARS_PER_PAGE } from '@/lib/constants'
import type { Cell, GridCell } from '@/lib/types'

interface ManuscriptGridProps {
  text: string
  cursorIndex?: number
}

function buildGridCells(text: string): GridCell[] {
  const raw: Cell[] = splitTextToCells(text)

  // 400セルに満たない場合はパディング
  const cells: Cell[] = [...raw]
  while (cells.length < CHARS_PER_PAGE) {
    cells.push({ char: '' })
  }

  // 超過した場合はスライス（splitTextToCells で制限済みだが安全のため）
  return cells.slice(0, CHARS_PER_PAGE).map((cell, index) => ({
    ...cell,
    rowIndex: Math.floor(index / GRID_SIZE),
    colIndex: index % GRID_SIZE,
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
      }}
    >
      {gridCells.map((cell, index) => (
        <div
          key={index}
          className={`cell${cursorIndex === index ? ' cell--cursor' : ''}`}
          data-row={cell.rowIndex}
          data-col={cell.colIndex}
        >
          {cell.char}
        </div>
      ))}
    </div>
  )
}
