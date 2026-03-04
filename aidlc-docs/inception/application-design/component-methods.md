# Component Methods

> **Note**: このドキュメントはメソッドシグネチャと高レベルの目的を定義します。
> 詳細なビジネスロジック（ヒント質問の内容、バリデーションルール等）は
> Construction Phase の **Functional Design** で設計します。

---

## lib/constants.ts

```typescript
// lib/constants.ts

export const GRID_SIZE = 20                          // 1ページの行数・列数
export const CELLS_PER_PAGE = GRID_SIZE * GRID_SIZE  // 1ページのセル総数（400）
export const CHARS_PER_PAGE = CELLS_PER_PAGE         // 1ページの最大文字数（= CELLS_PER_PAGE）
```

---

## lib/manuscriptEngine.ts（コアロジック）

```typescript
// lib/manuscriptEngine.ts — 純粋関数のみ。ブラウザ API 依存なし

/**
 * テキスト全体を GridCell 配列に変換する
 * 縦書き順（右列→左列、各列は上→下）のセルマッピングを1次元配列として返す
 * @param text - 全体テキスト（生テキスト）
 * @returns GridCell 配列（長さ = text.length。パディングなし）
 */
function splitTextToCells(text: string): GridCell[]

/**
 * テキスト全体を1次元配列に変換し、指定ページ分の文字を返す
 * @param text - 全体テキスト
 * @param pageIndex - 0-indexed ページ番号
 * @param charsPerPage - 1ページあたりの文字数（CHARS_PER_PAGE）
 * @returns そのページに表示する文字の配列（空文字でパディング、長さ = charsPerPage）
 */
function getPageChars(
  text: string,
  pageIndex: number,
  charsPerPage: number
): string[]

/**
 * テキスト全体のページ数を計算する
 * @param text - 全体テキスト
 * @param charsPerPage - 1ページあたりの文字数
 * @param minPages - 最小ページ数（設定した pageCount）
 * @returns 実際に必要なページ数（minPages 以上）
 */
function calcTotalPages(
  text: string,
  charsPerPage: number,
  minPages: number
): number

/**
 * 指定ページの文字数（空でないセル数）を返す
 */
function getPageCharCount(text: string, pageIndex: number, charsPerPage: number): number

/**
 * テキスト全体の文字数を返す
 */
function getTotalCharCount(text: string, excludeWhitespace?: boolean): number

/**
 * 文字数が目標の指定割合以上かチェックする
 * CharacterDolphin のリアクション判定に使用
 * @param current - 現在の文字数
 * @param target - 目標文字数
 * @param threshold - しきい値（0.0〜1.0、default: 0.9）
 * @returns しきい値以上なら true
 */
function isNearCompletion(
  current: number,
  target: number,
  threshold?: number
): boolean
```

---

## PlanModeWizard

```typescript
// app/components/PlanModeWizard/utils.ts

/**
 * 作文種別と学年グループに対応するヒント質問リストを取得する
 * 詳細なクエスチョンデータは Functional Design で定義
 * @param genre - 作文種別
 * @param grade - 学年（個別 Grade 型）
 * @returns ヒント質問の配列（3問）
 */
function getHintQuestions(genre: EssayGenre, grade: Grade): HintQuestion[]

/**
 * ウィザードの現在ステップが有効（次へ進める）かチェックする
 * @param step - 現在のウィザードステップ（'genre' | 'grade' | 'hints' | 'confirm'）
 * @param data - 現在の入力データ
 * @returns 次のステップへ進める場合 true
 */
function isStepValid(
  step: WizardStep,
  data: Partial<PlanData>
): boolean
```

---

## CharacterCounter

```typescript
// app/components/CharacterCounter/utils.ts

/**
 * 表示用の文字数テキストを生成する（例: "120 / 400"）
 * @param current - 現在の文字数
 * @param target - 目標文字数
 * @returns フォーマット済みの表示文字列
 */
function formatCountDisplay(current: number, target: number): string

/**
 * 目標文字数を超過しているかチェックする
 * @param current - 現在の文字数
 * @param target - 目標文字数
 * @returns 超過している場合 true（超過文字数を示す値）
 */
function isOverLimit(current: number, target: number): { over: boolean; excess: number }
```

---

## PageNavigator

```typescript
// app/components/PageNavigator/utils.ts

/**
 * 前ページへの移動が可能かチェックする
 * @param currentPage - 現在ページ（0-indexed）
 * @returns 前ページがある場合 true
 */
function canGoPrev(currentPage: number): boolean

/**
 * 次ページへの移動が可能かチェックする
 * @param currentPage - 現在ページ（0-indexed）
 * @param totalPages - 総ページ数
 * @returns 次ページがある場合 true
 */
function canGoNext(currentPage: number, totalPages: number): boolean
```

---

## Zustand Store アクション詳細

```typescript
// app/store/manuscriptStore.ts

interface ManuscriptStoreActions {
  /**
   * 作文テキストを更新する（入力変化のたびに呼ばれる）
   * persist middleware が自動的に localStorage に保存する
   */
  setText: (text: string) => void

  /**
   * タイトルを更新する
   */
  setTitle: (title: string) => void

  /**
   * 著者名を更新する
   */
  setAuthorName: (name: string) => void

  /**
   * プランモードの入力データを設定する
   * PlanModeWizard 完了時に呼ばれる
   */
  setPlanData: (plan: PlanData) => void

  /**
   * 新規作文を初期化する
   * @param mode - WritingMode（plan or free）
   * @param pageCount - 選択された枚数
   */
  initManuscript: (mode: WritingMode, pageCount: PageCount) => void

  /**
   * 現在ページを変更する
   * PageNavigator から呼ばれる
   */
  setCurrentPage: (page: number) => void

  /**
   * イルカの表示状態を変更する
   */
  setDolphinState: (state: DolphinState) => void

  /**
   * 保存データをすべてリセットする（新規作成時）
   * localStorage のデータも削除する
   */
  resetManuscript: () => void
}
```

---

## 型定義補足

```typescript
// lib/types.ts

/** ウィザードのステップ識別子 */
type WizardStep = 'genre' | 'grade' | 'hints' | 'confirm'

/** ヒント質問の型 */
interface HintQuestion {
  id: string
  text: string              // 例: "どこで？"
  placeholder?: string      // 入力欄のプレースホルダー
}

/** ManuscriptGrid のグリッドセル */
interface GridCell {
  char: string             // 空文字の場合は空セル
  colIndex: number         // 0 = 右端の列
  rowIndex: number         // 0 = 上端の行
}

/**
 * 学年グループ（ヒント質問選択の粒度を下げるために使用）
 * Grade（個別学年）は ManuscriptData の保存に使用し、
 * GradeGroup はヒント質問のバリエーション選択に使用する
 */
type GradeGroup = 'lower_es' | 'upper_es' | 'jh' | 'hs'
// lower_es: 小1〜小3、upper_es: 小4〜小6、jh: 中1〜中3、hs: 高1〜高3

/**
 * 個別学年（Grade）から学年グループを取得する
 * lib/manuscriptEngine.ts に実装
 * @param grade - 個別学年
 * @returns 対応する GradeGroup
 */
function getGradeGroup(grade: Grade): GradeGroup
```
