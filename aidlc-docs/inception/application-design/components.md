# Components

## アーキテクチャ概要

| 決定事項 | 内容 |
|---|---|
| フレームワーク | Next.js 15 (App Router) + TypeScript |
| 縦書きレンダリング | CSS Grid + 文字セル（`writing-mode: vertical-rl` + `grid-auto-flow: column`） |
| 状態管理 | Zustand + persist middleware（localStorage 連携） |
| ルート構成 | `/`（ランディング）→ `/start`（プランモード）→ `/write`（執筆） |
| ロジック分離 | 純粋ロジック → `lib/`、ブラウザ依存 → `app/services/` |

---

## コアデータ型

```typescript
type WritingMode = 'plan' | 'free'
type EssayGenre = 'reading_report' | 'event_impression' | 'free'
type Grade = 'es1'|'es2'|'es3'|'es4'|'es5'|'es6'|'jh1'|'jh2'|'jh3'|'hs1'|'hs2'|'hs3'
type PageCount = 2 | 4 | 8 | 10

interface HintAnswer {
  questionId: string
  question: string
  answer: string
}

interface PlanData {
  genre: EssayGenre
  grade: Grade
  hintAnswers: HintAnswer[]
}

interface ManuscriptData {
  id: string
  title: string
  authorName: string
  text: string
  pageCount: PageCount
  planData?: PlanData
  writingMode: WritingMode
  createdAt: string
  updatedAt: string
}
```

---

## コンポーネント定義

### 画面0: モード選択

---

#### `ModeSelector`

**ファイル**: `app/components/ModeSelector.tsx`

**責務**:
- プランモード / フリーモードの選択 UI を表示する
- 選択されたモードを親（ランディングページ）に通知する

**Props インターフェース**:
```typescript
interface ModeSelectorProps {
  onSelectMode: (mode: WritingMode) => void
}
```

---

### 画面1a: プランモード ウィザード

---

#### `PlanModeWizard`

**ファイル**: `app/components/PlanModeWizard/index.tsx`

**責務**:
- ヒント入力の多ステップウィザードを管理する（種別選択 → 学年設定 → 質問3問 → 確認）
- ウィザード完了時に `PlanData` を Zustand store に保存し、`/write` へ遷移する

**Props インターフェース**:
```typescript
interface PlanModeWizardProps {
  onComplete: (planData: PlanData) => void
  onSkip: () => void  // フリーモードへの切り替え
}
```

**サブコンポーネント**:
- `GenreSelector` — 作文種別選択 UI（F-01）
- `GradeSelector` — 学年選択 UI（F-02）
- `HintQuestions` — 質問3問フォーム（F-03）
- `WizardConfirmation` — 入力内容の確認ステップ

---

#### `CharacterDolphin`

**ファイル**: `app/components/CharacterDolphin.tsx`

**責務**:
- イルカキャラクターの表示状態（アイドル / 案内中 / 完成近づき）を管理する
- 文字数が目標の 90% 以上になるとリアクションを表示する

**Props インターフェース**:
```typescript
type DolphinState = 'idle' | 'guiding' | 'celebrating'

interface CharacterDolphinProps {
  state: DolphinState
  message?: string  // キャラクターが表示するテキスト（省略可）
}
```

---

### 画面2: 執筆画面

---

#### `ManuscriptGrid` ⭐ コアコンポーネント

**ファイル**: `app/components/ManuscriptGrid/index.tsx`

**責務**:
- 縦書き原稿用紙グリッドを CSS Grid でレンダリングする
- テキストを 1 文字 1 セルにマッピングして表示する
- `writing-mode: vertical-rl` + `grid-auto-flow: column` で縦書き順（右列から左へ）を実現する
- 現在ページのセルのみを表示する（ページング対応）
- 印刷時に原稿用紙と同等の精度で出力できるようにする

**Props インターフェース**:
```typescript
interface ManuscriptGridProps {
  text: string           // 全体テキスト（ページング前の生テキスト）
  currentPage: number    // 0-indexed
  isReadOnly?: boolean   // 印刷プレビュー時は true
  // columns / rows は GRID_SIZE 定数（lib/constants.ts）を直接参照するため Props から除外
}
```

**CSS アーキテクチャ**:
```css
.manuscript-grid {
  display: grid;
  grid-template-rows: repeat(var(--grid-size, 20), 1fr);
  grid-auto-flow: column;
  writing-mode: vertical-rl;
  /* GRID_SIZE × GRID_SIZE = CELLS_PER_PAGE セル（lib/constants.ts 参照） */
}

.grid-cell {
  /* 1文字1セル、茶色系罫線 */
  border: 1px solid var(--grid-line-color);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

#### `WritingPageLayout`

**ファイル**: `app/components/WritingPageLayout.tsx`

**責務**:
- 執筆画面のスプリットレイアウト（左: グリッド、右: 入力エリア）を管理する
- タブレット横向きレイアウトの崩れを防ぐ
- 印刷時は入力エリアを非表示にして ManuscriptGrid のみを表示する

**Props インターフェース**:
```typescript
interface WritingPageLayoutProps {
  left: React.ReactNode    // ManuscriptGrid
  right: React.ReactNode   // TextInputArea + ControPanels
}
```

---

#### `TextInputArea`

**ファイル**: `app/components/TextInputArea.tsx`

**責務**:
- 横書きテキストエリアで入力を受け付ける
- 入力変化を Zustand store の `text` に即時反映する（ManuscriptGrid のリアルタイム更新を実現）

**Props インターフェース**:
```typescript
interface TextInputAreaProps {
  value: string
  onChange: (text: string) => void
  maxLength: number            // pageCount × charsPerPage
  placeholder?: string
}
```

---

#### `PageNavigator`

**ファイル**: `app/components/PageNavigator.tsx`

**責務**:
- 前ページ / 次ページのナビゲーションを提供する
- 現在ページ番号と総ページ数を表示する

**Props インターフェース**:
```typescript
interface PageNavigatorProps {
  currentPage: number        // 1-indexed（表示用）
  totalPages: number
  onPrev: () => void
  onNext: () => void
}
```

---

#### `TitleNameHeader`

**ファイル**: `app/components/TitleNameHeader.tsx`

**責務**:
- タイトルと氏名の入力フィールドを表示する
- 原稿用紙の上部に配置され、印刷時も正しい位置に出力される

**Props インターフェース**:
```typescript
interface TitleNameHeaderProps {
  title: string
  authorName: string
  onTitleChange: (title: string) => void
  onAuthorNameChange: (name: string) => void
}
```

---

#### `CharacterCounter`

**ファイル**: `app/components/CharacterCounter.tsx`

**責務**:
- 現在の文字数と目標文字数をリアルタイム表示する
- 目標超過時に視覚的なフィードバックを提供する

**Props インターフェース**:
```typescript
interface CharacterCounterProps {
  current: number
  target: number            // pageCount × 400
  nearCompletionThreshold?: number  // default: 0.9（90%）
  onNearCompletion?: () => void     // イルカリアクションのトリガー
}
```

---

### 出力・サポート

---

#### `PrintLayout`

**ファイル**: `app/components/PrintLayout.tsx`

**責務**:
- `@media print` CSS で印刷専用スタイルを適用する
- ナビゲーション・入力エリア等の非印刷要素を隠す
- 全ページを連続して印刷可能な形式で出力する

**Props インターフェース**:
```typescript
interface PrintLayoutProps {
  children: React.ReactNode
  pageCount: PageCount
}
```

---

#### `UsageGuide`

**ファイル**: `app/components/UsageGuide.tsx`

**責務**:
- 原稿用紙の使い方（句読点・段落・字下げ等）をモーダルまたはドロワーで表示する
- 原稿用紙画面の執筆を妨げない表示方式を使用する

**Props インターフェース**:
```typescript
interface UsageGuideProps {
  isOpen: boolean
  onClose: () => void
}
```

---

## Next.js ページ構成

| ページ | ファイルパス | レンダリング | 主要コンポーネント |
|---|---|---|---|
| ランディング / モード選択 | `app/page.tsx` | SSR（SEO対応） | ModeSelector |
| プランモード | `app/start/page.tsx` | CSR | PlanModeWizard, CharacterDolphin |
| 執筆画面 | `app/write/page.tsx` | CSR | WritingPageLayout, ManuscriptGrid, TextInputArea, PageNavigator, CharacterCounter, TitleNameHeader, PrintLayout, UsageGuide |

---

## lib/constants.ts

```typescript
// lib/constants.ts — グリッド定数（副作用なし、SSR / CSR 共通）

export const GRID_SIZE = 20                          // 1ページの行数・列数
export const CELLS_PER_PAGE = GRID_SIZE * GRID_SIZE  // 1ページのセル総数（400）
export const CHARS_PER_PAGE = CELLS_PER_PAGE         // 1ページの最大文字数（= CELLS_PER_PAGE）
```

---

## Zustand Store 構成

```typescript
// app/store/manuscriptStore.ts

interface ManuscriptStore {
  // 作文データ
  manuscript: ManuscriptData | null

  // UI状態
  currentPage: number
  dolphinState: DolphinState
  isDirty: boolean   // 未保存の変更がある場合 true（ページ離脱警告などに使用）

  // アクション
  setManuscript: (data: Partial<ManuscriptData>) => void
  setText: (text: string) => void
  setTitle: (title: string) => void
  setAuthorName: (name: string) => void
  setPlanData: (plan: PlanData) => void
  setCurrentPage: (page: number) => void
  setDolphinState: (state: DolphinState) => void
  resetManuscript: () => void
}

// persist middleware で自動的に localStorage に保存
```
