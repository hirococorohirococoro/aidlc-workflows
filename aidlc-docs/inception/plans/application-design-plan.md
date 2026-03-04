# Application Design Plan

## 実行チェックリスト

- [x] Step 1: コンテキスト分析（requirements.md / stories.md 読み込み済み）
- [x] Step 2: アプリケーション設計計画作成
- [x] Step 3: 必須成果物の定義
- [x] Step 4: 確認質問の生成（下記参照）
- [x] Step 5: application-design-plan.md に保存（このファイル）
- [x] Step 6: ユーザーへ質問提示 → 回答待ち
- [x] Step 7: 回答収集（全 [Answer]: タグ完了を確認）
- [x] Step 8: 回答の曖昧さ分析（追加確認不要）
- [x] Step 10: 設計成果物の生成
  - [x] components.md
  - [x] component-methods.md
  - [x] services.md
  - [x] component-dependency.md
- [ ] Step 13: ユーザーによる承認待ち

---

## コンテキスト分析サマリー

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js (App Router) + TypeScript |
| データ永続化 | localStorage のみ（MVPはサーバーなし） |
| SEO要件 | ランディングページ SSR 必須 |
| 主要デバイス | iPad 横向き（タブレット）|
| 核心的複雑さ | **縦書きグリッドレンダリングエンジン**（20×20、文字→セル変換） |
| 画面数 | 3〜4画面（モード選択 / プランモード / 執筆 / 印刷） |

---

## 提案コンポーネント構成（確認用）

### UIコンポーネント

| コンポーネント | 責務 | 対応機能 |
|---|---|---|
| `ModeSelector` | モード選択UI（プランモード/フリーモード） | F-00 |
| `PlanModeWizard` | ヒント入力ウィザード（種別→学年→質問3問→確認） | F-01〜F-04 |
| `CharacterDolphin` | イルカキャラクター表示・リアクション制御 | F-04 |
| `ManuscriptGrid` | **縦書きグリッド本体**（文字→セルマッピング・ページング） | F-05 |
| `WritingPage` | 執筆画面レイアウト（グリッド＋入力エリア Split） | F-05〜F-09 |
| `TextInputArea` | 横書き入力エリア（→リアルタイムでグリッドに反映） | F-05 |
| `PageNavigator` | ページ移動ボタン（前ページ/次ページ） | F-05 |
| `TitleNameHeader` | タイトル・氏名入力欄 | F-06 |
| `CharacterCounter` | 文字数カウンター（リアルタイム） | F-08 |
| `PrintLayout` | 印刷用レイアウト（@media print 対応） | F-10 |
| `UsageGuide` | 原稿用紙使い方ガイドモーダル | F-11 |

### サービス層

| サービス | 責務 |
|---|---|
| `storageService` | localStorage CRUD（作文データの保存・復元） |
| `manuscriptService` | テキスト→グリッドセルマッピングロジック（縦書き変換） |
| `printService` | 印刷トリガー（window.print()）・印刷用CSS適用 |

### Next.js ルート構成（提案）

| ルート | ページ | SSR/CSR |
|---|---|---|
| `/` | ランディング + モード選択 | SSR（SEO対応） |
| `/start` | プランモードウィザード | CSR |
| `/write` | 執筆画面（原稿用紙） | CSR |

---

## 確認質問

各 `[Answer]:` タグの後にアルファベットを記入してください。
完了したら「完了」とお知らせください。

---

### Q1: 縦書きグリッドのレンダリングアプローチ

原稿用紙グリッド（ManuscriptGrid）の実装方式を選んでください。
**これがアーキテクチャの中で最も重要な決定です。**

A) **CSS Grid + 文字セル（推奨）** — 各マス（400個）を `<div>` で表現し、CSS Grid で配置。文字は各セルに1文字ずつ入れる。`writing-mode: vertical-rl` を親要素に適用して縦書き順を実現。実装がシンプルで印刷対応しやすい。
B) **Canvas ベース** — HTML5 Canvas に文字を直接描画。高度な視覚的制御が可能だが、アクセシビリティ・印刷対応が複雑になる。
C) **絶対配置（position: absolute）** — 各文字を x/y 座標で絶対配置。柔軟性は高いが、パフォーマンス懸念（400文字×ページ数の DOM ノード）あり。
X) Other (please describe after [Answer]: tag below)

[Answer]: A

CSS Grid + 文字セル方式を採用します。
印刷対応・アクセシビリティ・保守性を優先します。
Phase 0 では 20×20（400字）固定とし、
シンプルな実装で安定動作を重視します。

---

### Q2: 状態管理アプローチ

アプリ全体の状態（作文データ・ページ状態・ヒント入力等）をどう管理しますか？

A) **Zustand（推奨）** — 軽量でシンプル。localStorage との永続化（zustand/middleware persist）が容易。TypeScript との相性が良い。Claude Code との実装相性も高い。
B) **React Context + useReducer** — ライブラリ追加なし。中規模アプリまでは十分。localStorage との連携は手動実装が必要。
C) **Jotai** — アトムベースで細粒度な状態管理。シンプルな API。Zustand より細かい単位で管理できるが学習コストがやや高い。
X) Other (please describe after [Answer]: tag below)

[Answer]: A

Zustand を採用します。
理由は以下の通りです。

- localStorage 永続化（persist middleware）が容易
- TypeScript との相性が良い
- 実装がシンプルでデモ優先に向いている
- 小〜中規模アプリで十分な拡張性がある

Phase 0 では作文データ・ページ状態・ヒント入力のみを管理対象とします。

---

### Q3: ルート構成の確認

提案のルート構成（`/` → `/start` → `/write`）でよいですか？

A) **提案通り（推奨）** — `/`（ランディング+モード選択）→ `/start`（プランモード）→ `/write`（執筆）の3ルート
B) **シンプル化（2ルート）** — `/`（ランディング）+ `/app`（全機能を1ページで管理）
C) **細分化（4ルート）** — `/` + `/start` + `/write` + `/print`（印刷専用ページを追加）
X) Other (please describe after [Answer]: tag below)

[Answer]: A

提案通りの 3 ルート構成を採用します。

/        — ランディング + モード選択
/start   — プランモード（ヒント入力）
/write   — 執筆画面（原稿用紙）

責務を分離することで構造が明確になり、
Phase 0（デモ）でも安定した実装が可能になるためです。
印刷機能は当面 /write 内で対応します。

---

## 生成予定の設計成果物

| ファイル | 内容 |
|---|---|
| `aidlc-docs/inception/application-design/components.md` | コンポーネント定義・責務・インターフェース |
| `aidlc-docs/inception/application-design/component-methods.md` | メソッドシグネチャ・入出力型（詳細ビジネスロジックはFunctional Designで） |
| `aidlc-docs/inception/application-design/services.md` | サービス定義・オーケストレーションパターン |
| `aidlc-docs/inception/application-design/component-dependency.md` | 依存関係マトリクス・データフロー |
