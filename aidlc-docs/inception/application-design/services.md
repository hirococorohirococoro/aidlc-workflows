# Services

## サービス一覧

| モジュール | ファイルパス | 責務 |
|---|---|---|
| `storageService` | `app/services/storageService.ts` | localStorage の CRUD 操作（ブラウザ依存） |
| `manuscriptEngine` | `lib/manuscriptEngine.ts` | テキスト→グリッドマッピング・ページング計算（純粋関数、SSR/CSR共通） |
| `printService` | `app/services/printService.ts` | 印刷トリガー・印刷スタイル適用（ブラウザ依存） |

---

## storageService

**責務**: localStorage への作文データの保存・読み込み・削除を担当する。
Zustand の `persist` middleware が自動的に呼び出すため、コンポーネントから直接呼ぶ必要はない。
ただし、テスト可能性のために独立したサービスとして定義する。

```typescript
// app/services/storageService.ts

const STORAGE_KEY = 'manuscript-data'

const storageService = {
  /**
   * 作文データを localStorage に保存する
   * @param data - 保存する ManuscriptData
   */
  save(data: ManuscriptData): void,

  /**
   * localStorage から作文データを読み込む
   * @returns 保存データが存在すれば ManuscriptData、なければ null
   */
  load(): ManuscriptData | null,

  /**
   * localStorage の作文データを削除する（新規作成・リセット時）
   */
  clear(): void,

  /**
   * localStorage が利用可能かチェックする
   * プライベートブラウジング等で無効な場合は false を返す
   * @returns 利用可能なら true
   */
  isAvailable(): boolean
}
```

**エラーハンドリング**:
- `isAvailable()` が false の場合、`save()` はサイレントにスキップ
- `load()` は localStorage が使えない場合 null を返す（graceful degradation）

---

## manuscriptEngine（lib/）

**責務**: テキスト文字列とグリッド表示の間のマッピングロジックを担当する。
純粋関数として実装し、ブラウザ API に依存しない。SSR・CSR 両環境で動作し、テスト容易性が高い。

```typescript
// lib/manuscriptEngine.ts

import { CHARS_PER_PAGE } from './constants'

const manuscriptEngine = {
  /**
   * テキスト全体を GridCell 配列に変換する
   * splitTextToCells は ManuscriptGrid のセルレンダリング基盤となる関数
   *
   * @param text - 全体テキスト（生テキスト）
   * @returns GridCell 配列
   */
  splitTextToCells(text: string): GridCell[],

  /**
   * 全体テキストから指定ページの文字配列を取得する
   * 縦書きグリッドのセルに1文字ずつ割り当てる
   * 文字数がページに満たない場合は空文字でパディングする
   *
   * @param text - 全体テキスト（生テキスト）
   * @param pageIndex - 0-indexed ページ番号
   * @param charsPerPage - 1ページあたりの文字数（CHARS_PER_PAGE）
   * @returns 長さ charsPerPage の文字配列
   */
  getPageChars(text: string, pageIndex: number, charsPerPage: number): string[],

  /**
   * 総ページ数を計算する
   * 実際のテキスト量と設定ページ数の大きい方を返す
   *
   * @param text - 全体テキスト
   * @param charsPerPage - 1ページあたりの文字数
   * @param minPages - 設定した最小ページ数（PageCount）
   * @returns 必要なページ数
   */
  calcTotalPages(text: string, charsPerPage: number, minPages: PageCount): number,

  /**
   * 指定ページの文字数（空でないセル数）を返す
   * @returns そのページに実際に入力されている文字数
   */
  getPageCharCount(text: string, pageIndex: number, charsPerPage: number): number,

  /**
   * テキスト全体の文字数を返す（空白・改行を除く場合のオプション）
   * CharacterCounter の表示値として使用
   */
  getTotalCharCount(text: string, excludeWhitespace?: boolean): number,

  /**
   * 個別学年（Grade）から学年グループを返す
   * ヒント質問バリエーションの選択に使用
   */
  getGradeGroup(grade: Grade): GradeGroup
}
```

---

## printService

**責務**: 印刷機能のトリガーと印刷専用スタイルの適用を担当する。
Next.js の `window` 参照は CSR 側でのみ実行する。

```typescript
// app/services/printService.ts

const printService = {
  /**
   * ブラウザの印刷ダイアログを起動する
   * PrintLayout コンポーネントの「印刷」ボタンから呼ばれる
   * @param options - 印刷オプション（将来拡張用）
   */
  triggerPrint(options?: PrintOptions): void,

  /**
   * 印刷前の準備処理を実行する
   * - 印刷用クラスを body に付与する
   * - @media print CSS が適用された状態を作る
   * @returns クリーンアップ関数（印刷ダイアログ閉じ後に呼ぶ）
   */
  preparePrint(): () => void
}

interface PrintOptions {
  /** 印刷タイトル（ブラウザのページタイトルに使用） */
  documentTitle?: string
}
```

**実装メモ**:
- `window.print()` を使用
- `window.onbeforeprint` / `window.onafterprint` イベントで準備・後処理を管理
- Next.js SSR 環境では `typeof window !== 'undefined'` チェックを必ず行う

---

## モジュール間オーケストレーション

```
ユーザー操作
    |
    v
[Zustand Store]  ←→  [storageService]  (persist middlewareが自動連携)
    |
    |-- text, pageIndex --> [manuscriptEngine] --> getPageChars() --> [ManuscriptGrid]
    |                       (lib/manuscriptEngine.ts / 純粋関数)
    |
    |-- text.length, target --> CharacterCounter
    |
    |-- printTrigger -------> [printService] --> window.print()
```

Zustand store が中心となり、`manuscriptEngine`（lib/）は純粋関数として実装する。
`storageService` / `printService`（app/services/）はブラウザ API を使用するため app/ 側に配置する。
React コンポーネントは store から状態を読み、各モジュール関数を呼んで副作用を実行する。
