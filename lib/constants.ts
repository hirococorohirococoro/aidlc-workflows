export const GRID_SIZE = 20
export const CHARS_PER_PAGE = GRID_SIZE * GRID_SIZE

// セルを「空」として保持するためのプレースホルダ（表示上は空に見える）
// - カーソル移動で先のセルに書くため、文字列長を埋める用途
// - 文字数カウントやレンダリング時は空セルとして扱う
export const CELL_PLACEHOLDER = '\u200B'
