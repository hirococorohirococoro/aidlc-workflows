# Component Dependency

## 依存関係マトリクス

| コンポーネント / モジュール | Zustand Store | manuscriptEngine (lib/) | storageService | printService |
|---|---|---|---|---|
| ModeSelector | R | - | - | - |
| PlanModeWizard | W | R | - | - |
| CharacterDolphin | R | - | - | - |
| ManuscriptGrid | R | R | - | - |
| WritingPageLayout | - | - | - | - |
| TextInputArea | W | - | - | - |
| PageNavigator | R/W | R | - | - |
| TitleNameHeader | R/W | - | - | - |
| CharacterCounter | R | R | - | - |
| PrintLayout | R | R | - | R |
| UsageGuide | - | - | - | - |

> R = 読み取り、W = 書き込み、R/W = 読み書き両方

---

## データフロー図

```
+-------------------+
|   localStorage    |
|  (persist layer)  |
+--------+----------+
         |  Zustand persist middleware (自動)
         v
+-------------------+     initManuscript()     +---------------------+
|   Zustand Store   | <----------------------- | ModeSelector        |
|                   |                          | PlanModeWizard      |
|  - manuscript     |                          +---------------------+
|  - currentPage    |
|  - dolphinState   |
+---+-----+---------+
    |     |
    |     |  text, currentPage
    |     v
    |  +--+------------------+     getPageChars()    +---------------------+
    |  | manuscriptEngine   | ------------------->  | ManuscriptGrid      |
    |  +---------------------+                       | (CSS Grid + cells)  |
    |                                                 +---------------------+
    |
    |  text (onChange)
    v
+------------------------+
| TextInputArea          |  --> setText() --> Zustand --> ManuscriptGrid
+------------------------+       (リアルタイム反映)
    |
    |  text.length, target
    v
+------------------------+
| CharacterCounter       |  --> onNearCompletion() --> setDolphinState()
+------------------------+

+------------------------+
| PageNavigator          |  --> setCurrentPage() --> Zustand --> ManuscriptGrid
+------------------------+

+------------------------+
| PrintLayout            |  --> printService.triggerPrint()
+------------------------+
```

---

## ページ間データフロー（ルート遷移）

```
app/page.tsx (/)
  |
  | ModeSelector.onSelectMode('plan')
  | router.push('/start')
  |
  v
app/start/page.tsx (/start)
  |
  | PlanModeWizard.onComplete(planData)
  | store.setPlanData(planData)
  | store.initManuscript('plan', pageCount)
  | router.push('/write')
  |
  v
app/write/page.tsx (/write)
  |
  | store から text / currentPage / title / etc. を読み込み
  | TextInputArea → store.setText() → ManuscriptGrid リアルタイム更新
  | PageNavigator → store.setCurrentPage()
  | PrintLayout → printService.triggerPrint()

---

app/page.tsx (/)
  |
  | ModeSelector.onSelectMode('free')
  | store.initManuscript('free', pageCount)  ← 枚数選択後
  | router.push('/write')
  |
  v
app/write/page.tsx (/write)  ← 同じページ
```

---

## コンポーネント依存ツリー

```
app/write/page.tsx
+-- WritingPageLayout
|   +-- [left] TitleNameHeader
|   +-- [left] ManuscriptGrid
|   |   +-- manuscriptEngine.getPageChars()
|   +-- [left] PageNavigator
|   +-- [right] TextInputArea
|   +-- [right] CharacterCounter
|   |   +-- manuscriptEngine.getTotalCharCount()
|   +-- CharacterDolphin
|   +-- UsageGuide (conditional)
+-- PrintLayout
    +-- ManuscriptGrid (isReadOnly=true, all pages)

app/start/page.tsx
+-- PlanModeWizard
|   +-- GenreSelector
|   +-- GradeSelector
|   +-- HintQuestions
|   +-- WizardConfirmation
+-- CharacterDolphin

app/page.tsx
+-- ModeSelector
```

---

## 通信パターン

| パターン | 使用箇所 | 説明 |
|---|---|---|
| **Zustand Store 経由** | 全コンポーネント | 状態の読み書きはすべて Zustand を通す。コンポーネント間の直接 props 連鎖を避ける |
| **Pure Function（lib/）** | ManuscriptGrid ← manuscriptEngine (lib/) | 副作用のない純粋関数。SSR/CSR 共通で動作。テスト容易性が高い |
| **Next.js Router** | ページ遷移 | `router.push()` でルート間を遷移。Zustand store のデータはページをまたいで保持される |
| **@media print CSS** | PrintLayout | JavaScript ではなく CSS で印刷時の表示を制御。`window.print()` のみ JavaScript |
| **Zustand persist** | storageService | localStorage への読み書きは Zustand middleware が自動処理。手動の storageService 呼び出し不要（ただしテスト・リセット用に定義） |

---

## Extension Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | コンポーネント設計に入力バリデーション（SECURITY-05）の接点を定義（TextInputArea の maxLength）。XSS 対策は React の JSX エスケープに委任。セキュリティヘッダー（SECURITY-04）は NFR Design で設計。 |
