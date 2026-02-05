# Project-K AI - Product Requirements Document
## 開発生産性を向上させるGitHub Action

**作成日**: 2026年2月5日  
**バージョン**: 1.0  
**チーム**: 4名 × 10時間 = 40人時

---

# 目次

| # | セクション |
|---|-----------|
| 1 | [エグゼクティブサマリー](#1-エグゼクティブサマリー) |
| 2 | [問題定義](#2-問題定義) |
| 3 | [ソリューション](#3-ソリューション) |
| 4 | [機能仕様](#4-機能仕様) |
| 5 | [技術仕様](#5-技術仕様) |
| 6 | [開発計画](#6-開発計画) |
| 7 | [成功指標](#7-成功指標) |
| 8 | [Andrej Karpathyレビュー](#8-andrej-karpathyレビュー) |
| 9 | [Kent Beckレビュー](#9-kent-beckレビュー) |
| 10 | [最終評価・改善提案](#10-最終評価改善提案) |

---

# 1. エグゼクティブサマリー

## 1.1 製品概要

| 項目 | 内容 |
|------|------|
| **製品名** | Project-K AI |
| **カテゴリ** | GitHub Action（開発者ツール） |
| **ターゲット** | ソフトウェア開発チーム |
| **価値提案** | PR作成からマージまでの時間を87%短縮 |

## 1.2 3つのコア機能

```
┌─────────────────────────────────────────────────────────────┐
│                      Project-K AI                              │
├─────────────────────────────────────────────────────────────┤
│  1️⃣ 複雑度チェッカー    CC ≤ 10, CoC ≤ 15 自動検証          │
│  2️⃣ AIコードレビュー    Claude/GPTによる自動レビュー         │
│  3️⃣ コミットメッセージAI  diff → 意味のあるメッセージ生成     │
└─────────────────────────────────────────────────────────────┘
```

## 1.3 ハッカソンテーマとの整合性

> **テーマ**: 「価値あるプロダクトを早く届ける」  
> **課題**: 「プロダクトの開発生産性を向上させる、なにかしらのモノ・仕組み」

**Project-K AIの回答**:
- PRレビュー待ち時間: 4時間 → 30分（**87%短縮**）
- コード品質問題の早期発見: マージ前に自動検出
- 開発者体験向上: 面倒な作業を自動化

---

# 2. 問題定義

## 2.1 現状の課題

### 課題1: PRレビューの遅延

```
現状:
├── レビュアー割当まで: 平均2時間
├── 最初のコメントまで: 平均4時間
├── 承認まで: 平均8時間
└── マージまで: 平均12時間

問題:
├── 開発者のコンテキストスイッチ増加
├── フィードバックループの遅延
└── デプロイ頻度の低下
```

### 課題2: 複雑なコードのマージ

```
現状:
├── 複雑度の高い関数がレビューを通過
├── 後で「技術的負債」として積み上がる
└── 保守コストの増大

問題:
├── 循環的複雑度 > 10 の関数が量産
├── 認知的複雑度 > 15 で可読性低下
└── テスト困難なコードの増加
```

### 課題3: 意味のないコミットメッセージ

```
実際のコミット履歴:
├── "fix"
├── "update"
├── "wip"
├── "asdf"
└── "final final v2"

問題:
├── 変更履歴の追跡困難
├── リリースノート作成の工数増大
└── チーム間のコミュニケーション阻害
```

## 2.2 ターゲットユーザー

| ペルソナ | 課題 | Project-K AIの価値 |
|---------|------|-----------------|
| **ジュニア開発者** | レビュー待ちでブロック | 即座にAIフィードバック取得 |
| **シニア開発者** | レビュー工数が多い | AIが一次スクリーニング |
| **テックリード** | コード品質の維持 | 複雑度の自動ゲート |
| **プロジェクトマネージャー** | デリバリー速度 | PRサイクルタイム短縮 |

---

# 3. ソリューション

## 3.1 製品コンセプト

**「PRを作成した瞬間に、3つの価値を自動提供」**

```
開発者がPR作成
       │
       ▼
┌─────────────────────────────────────────┐
│           Project-K AI 起動               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │複雑度   │ │AIレビュー│ │コミット │   │
│  │チェック │ │         │ │メッセージ│   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       │          │          │         │
│       ▼          ▼          ▼         │
│  ┌─────────────────────────────────┐   │
│  │      統合コメント投稿           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
       │
       ▼
開発者がすぐに改善アクション
```

## 3.2 差別化ポイント

| 既存ツール | Project-K AI |
|-----------|------------|
| 複雑度チェックのみ | 複雑度 + AIレビュー + メッセージ生成 |
| 設定が複雑 | ゼロコンフィグで即利用可能 |
| 英語のみ | 日本語対応（コメント・提案） |
| 有料SaaS | オープンソース・無料 |
| 有料AI API必須 | **Google Gemini 無料ティア対応** |

## 3.3 💡 コストゼロ戦略: Google Gemini 無料ティア

### なぜGemini無料ティアなのか？

> **ハッカソンチームの現実**: APIキーのコスト負担なしでAI機能を実装したい

Project-K AIは**Google Gemini API無料ティア**をデフォルトオプションとしてサポートし、開発チームが**コスト負担なく**AIコードレビューを導入できます。

### Gemini無料ティアスペック（2026年1月時点）

| 項目 | 無料ティア制限 |
|------|---------------|
| **リクエスト数** | 5-15 RPM（モデルにより異なる） |
| **トークン** | 250,000 TPM（分あたりトークン） |
| **日次制限** | 1,000リクエスト/日 |
| **コンテキストウィンドウ** | **1Mトークン**（ChatGPTの8倍！） |
| **クレジットカード** | ❌ 不要 |
| **対応モデル** | **Gemini 3.0 Pro Preview**, Gemini 2.5 Pro, 2.5 Flash |

### Project-K AIでの活用

```
┌─────────────────────────────────────────────────────────────┐
│                    無料ティアで十分な理由                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 一般的なPR分析                                           │
│  ├── 平均diffサイズ: ~5,000トークン                         │
│  ├── プロンプト + レスポンス: ~10,000トークン                │
│  └── 1日100個のPR処理可能（無料！）                         │
│                                                              │
│  💡 1Mコンテキストウィンドウのメリット                       │
│  ├── 大型PRも分割なしで全体分析可能                         │
│  ├── プロジェクトコンテキスト含有可能                        │
│  └── より正確なレビュー結果                                 │
│                                                              │
│  🚀 Gemini 3.0のメリット                                    │
│  ├── 最新モデルでより正確なコード理解                        │
│  ├── 向上した推論能力                                       │
│  └── 無料Previewアクセス可能                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### コスト比較

| プロバイダー | 無料ティア | 有料価格（1Mトークン） |
|-------------|----------|----------------------|
| **Google Gemini 3.0 Pro** ⭐ | ✅ Preview無料 | $2.00入力 / $8.00出力 |
| **Google Gemini 2.5 Flash** | ✅ 1,000リクエスト/日無料 | $0.10入力 / $0.40出力 |
| OpenAI GPT-4o | ❌ なし | $2.50入力 / $10.00出力 |
| Anthropic Claude 3.5 | ❌ なし | $3.00入力 / $15.00出力 |

### 推奨設定

```yaml
# 🚀 最新モデル設定（Gemini 3.0 - 推奨）
ai-provider: 'gemini'
ai-model: 'gemini-3.0-pro'      # 最新モデル、Preview無料
ai-api-key: ${{ secrets.GEMINI_API_KEY }}

# ⚡ 速度優先設定（Gemini 2.5 Flash）
ai-provider: 'gemini'
ai-model: 'gemini-2.5-flash'    # 最速、無料ティア活用
```

### APIキー発行方法（5分以内）

```
1. Google AI Studioにアクセス
   https://aistudio.google.com/

2. Googleアカウントでログイン

3. "Get API Key"をクリック

4. 無料APIキー発行完了！
   （クレジットカード登録不要）

5. GitHub Secretsに登録
   Settings → Secrets → GEMINI_API_KEY
```

---

# 4. 機能仕様

## 4.1 機能1: 複雑度チェッカー

### 概要

| 項目 | 内容 |
|------|------|
| **トリガー** | PR作成・更新時（自動） |
| **分析対象** | 変更されたファイル（.ts, .js, .tsx, .jsx） |
| **ルール** | CC ≤ 10, CoC ≤ 15 |
| **出力** | PRコメント |

### 出力例

```markdown
## 🔍 Complexity Check Results

### Summary
| Metric | Threshold | Result | Status |
|--------|-----------|--------|--------|
| Cyclomatic Complexity | ≤ 10 | Max: 8 | ✅ PASS |
| Cognitive Complexity | ≤ 15 | Max: 12 | ✅ PASS |

### Details
✅ All 5 files passed complexity checks.

<details>
<summary>📊 Per-file breakdown</summary>

| File | CC | CoC |
|------|-----|-----|
| src/api/handler.ts | 8 | 12 |
| src/utils/parser.ts | 6 | 9 |
| src/services/auth.ts | 4 | 7 |

</details>
```

### 失敗時の出力

```markdown
## 🔍 Complexity Check Results

### Summary
| Metric | Threshold | Result | Status |
|--------|-----------|--------|--------|
| Cyclomatic Complexity | ≤ 10 | Max: 14 | ❌ FAIL |
| Cognitive Complexity | ≤ 15 | Max: 22 | ❌ FAIL |

### ❌ Issues Found

#### `src/services/dataProcessor.ts`

| Line | Function | CC | CoC | Issue |
|------|----------|-----|-----|-------|
| 42 | `processUserData()` | 14 | 22 | Both exceeded |
| 89 | `validateInput()` | 11 | 18 | Both exceeded |

### 💡 Refactoring Suggestions

**`processUserData()` (Line 42)**
```typescript
// ❌ Current: Nested conditions (CC=14, CoC=22)
function processUserData(data) {
  if (data) {
    if (data.type === 'premium') {
      if (data.status === 'active') {
        // deep nesting...
      }
    }
  }
}

// ✅ Suggested: Guard clauses + extraction
function processUserData(data) {
  if (!data) return { error: 'No data' };
  if (!isPremiumActive(data)) return { error: 'Not eligible' };
  
  return processPremiumUser(data);
}
```
```

---

## 4.2 機能2: AIコードレビュー

### 概要

| 項目 | 内容 |
|------|------|
| **トリガー** | PR作成・更新時（自動） |
| **AI** | Claude 3.5 Sonnet / GPT-4 |
| **レビュー観点** | セキュリティ、パフォーマンス、ベストプラクティス |
| **出力** | PRコメント |

### AIプロンプト設計

```
あなたは経験豊富なシニアエンジニアです。
以下のコード変更をレビューしてください。

## レビュー観点
1. セキュリティ脆弱性（SQLインジェクション、XSS、認証漏れ等）
2. パフォーマンス問題（N+1クエリ、不要な再レンダリング等）
3. エラーハンドリング不足
4. コードの重複
5. 命名規則違反

## 出力形式
各問題について:
- 🔴 Critical / 🟡 Warning / 🔵 Info
- 該当ファイル・行番号
- 問題の説明
- 修正提案

## 制約
- 最大5件の指摘に絞る（重要度順）
- 建設的なフィードバックのみ
- 日本語で出力
```

### 出力例

```markdown
## 🤖 AI Code Review

### 指摘事項 (3件)

#### 🔴 Critical: SQLインジェクションの可能性
**ファイル**: `src/db/queries.ts:28`

```typescript
// ❌ 現在のコード
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 修正提案
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.execute(query, [userId]);
```

---

#### 🟡 Warning: 未処理のPromise rejection
**ファイル**: `src/api/handler.ts:45`

```typescript
// ❌ 現在のコード
async function fetchData() {
  const data = await api.get('/data'); // エラー時に例外
  return data;
}

// ✅ 修正提案
async function fetchData() {
  try {
    const data = await api.get('/data');
    return { success: true, data };
  } catch (error) {
    console.error('Fetch failed:', error);
    return { success: false, error };
  }
}
```

---

#### 🔵 Info: マジックナンバーの使用
**ファイル**: `src/utils/calc.ts:12`

```typescript
// ❌ 現在のコード
if (retryCount > 3) { ... }

// ✅ 修正提案
const MAX_RETRY_COUNT = 3;
if (retryCount > MAX_RETRY_COUNT) { ... }
```
```

---

## 4.3 機能3: コミットメッセージAI生成

### 概要

| 項目 | 内容 |
|------|------|
| **トリガー** | PRコメントで `/suggest-commit` |
| **入力** | PR内の全コミットのdiff |
| **出力** | Conventional Commits形式のメッセージ提案 |

### 使用方法

```markdown
開発者がPRにコメント:
> /suggest-commit

Project-K AIが返信:
> ## 📝 Suggested Commit Messages
>
> Based on the changes in this PR, here are suggested commit messages:
>
> ### Option 1 (Recommended)
> ```
> feat(auth): add JWT token refresh mechanism
>
> - Implement automatic token refresh before expiration
> - Add refresh token storage in secure cookie
> - Include retry logic for failed refresh attempts
> ```
>
> ### Option 2
> ```
> feat(auth): implement token refresh with secure storage
> ```
>
> ### Option 3
> ```
> add jwt refresh feature
> ```
```

---

# 5. 技術仕様

## 5.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                                                              │
│  PR Created/Updated                                          │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              GitHub Actions Workflow                     │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │              Project-K AI Action                    │   │ │
│  │  │                                                   │   │ │
│  │  │  1. Checkout code                                 │   │ │
│  │  │  2. Get changed files                             │   │ │
│  │  │  3. Run complexity check (ESLint + SonarJS)       │   │ │
│  │  │  4. Call AI API (Claude/GPT)                      │   │ │
│  │  │  5. Generate commit message suggestion            │   │ │
│  │  │  6. Post comment to PR                            │   │ │
│  │  │                                                   │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │                          │                               │ │
│  │                          ▼                               │ │
│  │                 ┌─────────────┐                          │ │
│  │                 │ PR Comment  │                          │ │
│  │                 └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 5.2 技術スタック

```yaml
Runtime: Node.js 20
Language: TypeScript 5.x
Linting: ESLint + eslint-plugin-sonarjs
AI API: 
  - Google Gemini 3.0 Pro（無料Preview） ⭐ 推奨
  - Google Gemini 2.5 Flash（無料ティア）
  - Anthropic Claude API（オプション）
  - OpenAI API（オプション）
GitHub: @actions/core, @actions/github
Testing: Vitest
Build: esbuild
```

### AIプロバイダー比較

| プロバイダー | 無料ティア | メリット | デメリット |
|-------------|----------|---------|-----------|
| **Gemini 3.0 Pro** ⭐ | ✅ Preview無料 | 最新モデル、高精度、無料 | Preview段階 |
| **Gemini 2.5 Flash** | ✅ 1,000リクエスト/日 | 高速、無料、1Mコンテキスト | 3.0より精度低い |
| Claude 3.5 Sonnet | ❌ | 高精度 | 有料必須 |
| GPT-4o | ❌ | 広く使われている | 有料必須 |

## 5.3 プロジェクト構造

```
Project-K/
├── action.yml                    # Action定義
├── src/
│   ├── index.ts                  # エントリーポイント
│   ├── complexity/
│   │   ├── checker.ts            # 複雑度分析
│   │   ├── eslint-config.ts      # ESLint設定
│   │   └── reporter.ts           # 結果フォーマット
│   ├── ai-review/
│   │   ├── reviewer.ts           # AIレビュー実行
│   │   ├── prompts.ts            # プロンプトテンプレート
│   │   └── claude-client.ts      # Claude API クライアント
│   ├── commit-message/
│   │   ├── generator.ts          # メッセージ生成
│   │   └── conventional.ts       # Conventional Commits パーサー
│   ├── github/
│   │   ├── pr.ts                 # PR情報取得
│   │   ├── diff.ts               # diff取得
│   │   └── comment.ts            # コメント投稿
│   └── utils/
│       ├── logger.ts             # ロギング
│       └── config.ts             # 設定管理
├── __tests__/
│   ├── complexity.test.ts
│   ├── ai-review.test.ts
│   └── commit-message.test.ts
├── .eslintrc.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## 5.4 複雑度制約（自己適用）

**Project-K AI自身のコードも複雑度制約を遵守**:

| ファイル | CC上限 | CoC上限 |
|---------|--------|--------|
| すべての.tsファイル | ≤ 10 | ≤ 15 |
| 1関数あたり行数 | ≤ 50 | - |
| ネスト深度 | ≤ 3 | - |

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['sonarjs'],
  rules: {
    'complexity': ['error', { max: 10 }],
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', 50],
  }
};
```

## 5.5 API設計

### action.yml

```yaml
name: 'Project-K AI'
description: 'Automated PR complexity check, AI code review, and commit message suggestions'
author: 'Your Team'

inputs:
  github-token:
    description: 'GitHub token for PR comments'
    required: true
  ai-provider:
    description: 'AI provider (gemini, claude, openai)'
    required: false
    default: 'gemini'  # 無料ティア活用のためデフォルト変更
  ai-model:
    description: 'AI model (gemini-3.0-pro, gemini-2.5-flash, claude-3.5-sonnet, gpt-4o)'
    required: false
    default: 'gemini-3.0-pro'  # 最新モデル、Preview無料
  ai-api-key:
    description: 'API key for AI provider (Gemini is free to get)'
    required: true
  complexity-cc-threshold:
    description: 'Cyclomatic complexity threshold'
    required: false
    default: '10'
  complexity-coc-threshold:
    description: 'Cognitive complexity threshold'
    required: false
    default: '15'
  language:
    description: 'Output language (en or ja)'
    required: false
    default: 'ja'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

### 使用例（ワークフロー）

```yaml
# .github/workflows/Project-K.yml
name: Project-K AI

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  Project-K:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 🚀 Gemini 3.0 Pro使用（最新モデル、推奨）
      - name: Project-K AI (Gemini 3.0)
        uses: your-org/Project-K@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ai-provider: 'gemini'
          ai-model: 'gemini-3.0-pro'
          ai-api-key: ${{ secrets.GEMINI_API_KEY }}
          language: 'ja'

      # ⚡ または Gemini 2.5 Flash使用（高速）
      # - name: Project-K AI (Flash)
      #   uses: your-org/Project-K@v1
      #   with:
      #     github-token: ${{ secrets.GITHUB_TOKEN }}
      #     ai-provider: 'gemini'
      #     ai-model: 'gemini-2.5-flash'
      #     ai-api-key: ${{ secrets.GEMINI_API_KEY }}
      #     language: 'ja'
```

---

# 6. 開発計画

## 6.1 チーム役割分担

| メンバー | 役割 | 担当機能 |
|---------|------|---------|
| **Dev 1** | インフラ | Action構造、GitHub API連携 |
| **Dev 2** | 複雑度 | ESLint設定、複雑度分析ロジック |
| **SF Dev 1** | AI連携 | Claude API、プロンプト設計 |
| **SF Dev 2** | 統合・発表 | コミットメッセージAI、README、プレゼン |

## 6.2 タイムライン（10時間）

```
時間       Dev 1              Dev 2              SF Dev 1           SF Dev 2
──────────────────────────────────────────────────────────────────────────────
0:00-0:30  設計・役割確認      設計・役割確認      設計・役割確認      設計・役割確認
──────────────────────────────────────────────────────────────────────────────
0:30-2:00  Action基本構造     ESLint設定         Claude API調査     コミットメッセージ設計
           action.yml作成     SonarJS設定        APIキー設定        プロンプト設計
──────────────────────────────────────────────────────────────────────────────
2:00-4:00  PR情報取得         複雑度分析実装      レビュープロンプト  メッセージ生成実装
           diff取得           結果パース         AIクライアント     Conventional形式
──────────────────────────────────────────────────────────────────────────────
4:00-6:00  コメント投稿       フォーマット実装    レビュー実装       統合作業
           エラーハンドリング  リファクタ提案     出力フォーマット   テスト
──────────────────────────────────────────────────────────────────────────────
6:00-8:00  統合テスト         統合テスト         統合テスト         README作成
           バグ修正           バグ修正           バグ修正           使用例作成
──────────────────────────────────────────────────────────────────────────────
8:00-10:00 最終テスト         デモPR作成         デモPR作成         発表資料
           リリース準備       スクリーンショット  スクリーンショット  発表練習
```

## 6.3 マイルストーン

| 時間 | マイルストーン | 完了基準 |
|------|---------------|---------|
| 2時間 | 基盤完成 | Action が動作、PR情報取得可能 |
| 4時間 | 複雑度チェック完成 | PRに複雑度レポートがコメントされる |
| 6時間 | AIレビュー完成 | PRにAIレビュー結果がコメントされる |
| 8時間 | 全機能完成 | 3機能すべてが動作 |
| 10時間 | デモ準備完了 | 発表資料、デモPR準備完了 |

---

# 7. 成功指標

## 7.1 定量的指標

| 指標 | 現状 | 目標 | 測定方法 |
|------|------|------|---------|
| PRレビュー開始時間 | 4時間 | 即時（自動） | Action実行ログ |
| 複雑度違反検出率 | 0%（手動） | 100%（自動） | Action実行結果 |
| コミットメッセージ品質 | "fix" 多数 | Conventional準拠 | メッセージ分析 |

## 7.2 ハッカソン評価基準との整合

| 評価基準 | Project-K AIの対応 |
|---------|-----------------|
| **テーマ適合性** | 「開発生産性向上」を直接解決 |
| **技術的完成度** | TDD、複雑度制限、クリーンコード |
| **実用性** | 即日導入可能、ゼロコンフィグ |
| **デモ映え** | リアルPRで即時結果表示 |
| **継続性** | GitHub Marketplace公開可能 |

---

# 8. Andrej Karpathyレビュー

## 8.1 Karpathyの視点

> Andrej Karpathy: AI研究者、Tesla AI Director、OpenAI創設メンバー
> 「Software 2.0」提唱者 - ニューラルネットワークがソフトウェアを書く時代

### 評価ポイント

#### ✅ 良い点

**1. AIを「ツール」として適切に位置づけ**
```
Karpathyの原則: "AIは人間を置き換えるのではなく、増強する"

Project-K AIの実装:
├── AIはレビューを「提案」するだけ
├── 最終判断は人間が行う
└── 人間のレビュアーの負担を軽減
```

**2. プロンプトエンジニアリングの重要性理解**
```
Karpathyの原則: "プロンプトはコードである"

Project-K AIの実装:
├── レビュー観点を明確に定義
├── 出力形式を構造化
└── 日本語/英語の切り替え対応
```

**3. 実用性重視**
```
Karpathyの原則: "Research → Production のギャップを埋める"

Project-K AIの実装:
├── 研究レベルのAIを実務ツールに変換
├── GitHubワークフローにシームレス統合
└── 開発者の日常に自然に溶け込む
```

#### ⚠️ 改善提案

**1. AI出力の不確実性への対処**
```
問題:
└── AIの提案が常に正しいとは限らない

Karpathyの提案:
├── 信頼度スコアの表示
├── "この提案は自動生成です" の明示
└── 人間レビューの重要性の強調

実装提案:
## 🤖 AI Code Review (Confidence: 85%)
> ⚠️ This is an AI-generated review. Human verification recommended.
```

**2. フィードバックループの構築**
```
問題:
└── AIの精度向上メカニズムがない

Karpathyの提案:
├── 「役に立った/立たなかった」ボタン
├── 間違った提案の報告機能
└── 将来的なファインチューニング用データ収集

実装提案:
> Was this review helpful? 👍 👎
```

**3. コンテキストウィンドウの制限**
```
問題:
└── 大きなPRでトークン制限に達する

Karpathyの提案:
├── チャンキング戦略の実装
├── 重要度に基づくファイル優先順位付け
└── 差分サマリー生成

実装提案:
// 大きなPRの場合
if (diffTokens > MAX_TOKENS) {
  // 変更の大きいファイルを優先
  // または複数回に分けてレビュー
}
```

### 8.2 Karpathy流改善版アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Project-K AI v2 (Karpathy Edition)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  入力: PR diff                                               │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────┐                                        │
│  │ プリプロセッサ   │ ← トークン最適化、チャンキング          │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ AI レビュー     │ ← 信頼度スコア付き                      │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ 人間フィードバック│ ← 👍/👎 ボタン                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ 学習データ収集   │ ← 将来の改善用                         │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 9. Kent Beckレビュー

## 9.1 Kent Beckの視点

> Kent Beck: XP創始者、TDD提唱者、JUnit作者
> 「Make it work, make it right, make it fast」

### 評価ポイント

#### ✅ 良い点

**1. TDDの原則に沿った設計**
```
Beckの原則: "Test First"

Project-K AIの実装:
├── すべての機能にテストを先行
├── Red-Green-Refactor サイクル
└── テストがドキュメントになる

// 例: checker.test.ts
describe('ComplexityChecker', () => {
  it('should detect CC > 10', () => { ... });
  it('should detect CoC > 15', () => { ... });
  it('should pass valid code', () => { ... });
});
```

**2. シンプルさの追求**
```
Beckの原則: "Do the simplest thing that could possibly work"

Project-K AIの実装:
├── 3つの明確な機能のみ
├── 各機能が独立
└── 設定はオプション（デフォルトで動作）
```

**3. 継続的な改善への設計**
```
Beckの原則: "Embrace change"

Project-K AIの実装:
├── モジュラー設計で機能追加容易
├── 設定で閾値変更可能
└── 新しいAIプロバイダー追加可能
```

#### ⚠️ 改善提案

**1. より小さな関数への分割**
```
Beckの原則: "関数は1つのことだけを行う"

問題:
└── reviewer.ts が複数の責任を持つ可能性

提案:
// Before: 1つの大きな関数
async function reviewCode(diff: string): Promise<Review> {
  // diff解析
  // プロンプト構築
  // API呼び出し
  // 結果パース
  // フォーマット
}

// After: 単一責任
async function reviewCode(diff: string): Promise<Review> {
  const parsed = parseDiff(diff);
  const prompt = buildPrompt(parsed);
  const response = await callAI(prompt);
  const review = parseResponse(response);
  return formatReview(review);
}
```

**2. テストカバレッジの明示**
```
Beckの原則: "テストは安心をもたらす"

提案:
├── カバレッジ目標: 80%以上
├── クリティカルパス: 100%
└── CI/CDでカバレッジ強制

// vitest.config.ts
export default {
  coverage: {
    thresholds: {
      lines: 80,
      branches: 80,
      functions: 80,
    }
  }
};
```

**3. ペアプログラミング促進機能**
```
Beckの原則: "ペアプログラミングは知識を共有する"

提案:
└── レビュー結果を学習教材として活用

## 🤖 AI Code Review

### 📚 Learning Opportunity
この指摘はチームの他のメンバーにも役立つかもしれません。
Slackに共有しますか？ [Share to #dev-tips]
```

### 9.2 Beck流リファクタリング提案

**Before: 複雑な条件分岐**
```typescript
// 循環的複雑度: 12
function determineAction(result: AnalysisResult): Action {
  if (result.complexity.cc > 10) {
    if (result.complexity.coc > 15) {
      if (result.security.critical > 0) {
        return Action.BlockMerge;
      } else {
        return Action.RequestChanges;
      }
    } else {
      return Action.Warning;
    }
  } else if (result.security.critical > 0) {
    return Action.BlockMerge;
  } else if (result.security.warning > 0) {
    return Action.Warning;
  } else {
    return Action.Approve;
  }
}
```

**After: Kent Beck スタイル**
```typescript
// 循環的複雑度: 4
function determineAction(result: AnalysisResult): Action {
  if (hasCriticalSecurityIssue(result)) return Action.BlockMerge;
  if (exceedsComplexityThresholds(result)) return Action.RequestChanges;
  if (hasWarnings(result)) return Action.Warning;
  return Action.Approve;
}

// 単一責任の述語関数
const hasCriticalSecurityIssue = (r: AnalysisResult) => 
  r.security.critical > 0;

const exceedsComplexityThresholds = (r: AnalysisResult) =>
  r.complexity.cc > 10 && r.complexity.coc > 15;

const hasWarnings = (r: AnalysisResult) =>
  r.security.warning > 0 || r.complexity.cc > 10;
```

---

# 10. 最終評価・改善提案

## 10.1 総合評価

| 評価者 | スコア | コメント |
|--------|--------|---------|
| **Andrej Karpathy** | 8/10 | AI活用は適切。信頼度表示とフィードバックループを追加すれば完璧 |
| **Kent Beck** | 8.5/10 | TDD精神に沿っている。関数分割をさらに徹底すれば模範的 |

## 10.2 v1.0 での実装優先度

### 必須（ハッカソン当日）

| 機能 | 理由 |
|------|------|
| 複雑度チェック | コア機能、デモ必須 |
| AIコードレビュー | 差別化ポイント |
| 基本的なコメント投稿 | 動作確認に必要 |

### Nice to Have（時間があれば）

| 機能 | 理由 |
|------|------|
| コミットメッセージ生成 | 追加価値 |
| 日本語/英語切り替え | 国際化 |
| 信頼度スコア表示 | Karpathy提案 |

### 将来バージョン

| 機能 | 理由 |
|------|------|
| フィードバックボタン | 継続的改善 |
| 学習データ収集 | AI精度向上 |
| Slack連携 | チーム共有 |

## 10.3 リスクと対策

| リスク | 確率 | 対策 |
|--------|------|------|
| AI API障害 | 中 | フォールバック（複雑度チェックのみ実行） |
| トークン制限超過 | 中 | 大きなPRは分割処理 |
| GitHub API レート制限 | 低 | キャッシュ、バッチ処理 |
| レビュー精度不足 | 中 | 「AI生成」明示、人間レビュー推奨 |

## 10.4 成功の定義

### ハッカソン当日

```
✅ 成功基準:
├── 3つの機能がすべて動作
├── 実際のPRでデモ可能
├── 5分以内にセットアップ完了
└── 審査員が「使いたい」と言う
```

### 継続的成功

```
✅ 長期成功基準:
├── GitHub Marketplace公開
├── 100+ Star獲得
├── 実際のチームで採用
└── フィードバックによる継続改善
```

---

# 付録

## A. 参考資料

| トピック | リソース |
|---------|---------|
| Kent Beck TDD | [Test Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) |
| Andrej Karpathy | [Software 2.0](https://karpathy.medium.com/software-2-0-a64152b37c35) |
| ESLint Complexity | [ESLint complexity rule](https://eslint.org/docs/latest/rules/complexity) |
| SonarJS | [eslint-plugin-sonarjs](https://github.com/SonarSource/eslint-plugin-sonarjs) |
| GitHub Actions | [Creating actions](https://docs.github.com/en/actions/creating-actions) |

## B. 用語集

| 用語 | 説明 |
|------|------|
| CC | Cyclomatic Complexity（循環的複雑度） |
| CoC | Cognitive Complexity（認知的複雑度） |
| TDD | Test-Driven Development（テスト駆動開発） |
| PR | Pull Request |
| LLM | Large Language Model |

---

**PRD作成日**: 2026年2月5日  
**レビュアー**: Andrej Karpathy視点、Kent Beck視点  
**次回更新**: ハッカソン後の振り返り
