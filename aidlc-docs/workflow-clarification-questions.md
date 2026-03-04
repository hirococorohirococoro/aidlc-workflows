# Workflow Clarification Questions

CLAUDE.md と `aidlc-docs/aidlc-state.md` に従って再開しようとしたところ、**ワークフロー状態と実際のリポジトリの状態に不整合**が見つかりました。

- `aidlc-docs/aidlc-state.md` は **INCEPTION / Application Design（承認待ち）** かつ「Existing Code: No」と記載
- 一方で、実装コード（Next.js アプリ）が存在し、ローカル実行も進んでいます

以降の進め方を確定するため、以下に回答してください。
各 `[Answer]:` の後に選択肢の文字（A/B/C...）を記入してください。
完了したら「完了」とお知らせください。

---

## Question 1: 既存の実装コードをどう扱いますか？

A) **プロトタイプとして存在は認めるが、以降のコード変更は Code Generation まで凍結する（推奨 / AIDLC厳守）**
B) **現状を Code Generation 済み相当として扱い、state を追認して先へ進む（AIDLCを一部後追いで整合）**
C) **既存コードがあるため Brownfield とみなし、Reverse Engineering からやり直す**
X) Other (please describe after [Answer]: tag below)

[Answer]:

---

## Question 2: Application Design 成果物を承認しますか？

対象:
- `aidlc-docs/inception/application-design/components.md`
- `aidlc-docs/inception/application-design/component-methods.md`
- `aidlc-docs/inception/application-design/services.md`
- `aidlc-docs/inception/application-design/component-dependency.md`

A) **Approve & Continue**（Units Generation へ進む）
B) **Request Changes**（どこをどう直したいかを具体的に追記してください）
X) Other (please describe after [Answer]: tag below)

[Answer]:

---

## Question 3: 現在の未コミット変更（実装差分）をどうしますか？

A) **このまま保持**（ただし Q1=A の場合、以降の変更は Code Generation まで凍結）
B) **いったん差分を破棄してクリーンに戻す**（AIDLC厳守のため、Code Generation で作り直す）
C) **差分は保持するが、AIDLC の state/監査ログを先に整合させる（どの時点で作ったかも記録）**
X) Other (please describe after [Answer]: tag below)

[Answer]:

