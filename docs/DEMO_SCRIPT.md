# Project-K Demo Script

> CAINZ Hackathon 2026 - Developer Productivity Platform
> Presentation Time: 5-7 minutes

---

## Demo Overview

| Phase | Duration | Content |
|-------|----------|---------|
| 1. Problem Statement | 1 min | Pain points in development workflow |
| 2. Solution Overview | 1 min | Project-K value proposition |
| 3. Live Demo | 3-4 min | 4 feature demonstrations |
| 4. Q&A | 1 min | Questions |

---

# Phase 1: Problem Statement (1 min)

## Script

> **[Show Dashboard]**

"Every day, developers face these common challenges:

1. **Manual Ticket Creation** - Converting requirements to JIRA tickets takes 15-30 minutes
2. **Scattered Knowledge** - Information spread across Confluence, JIRA, Teams, and the web
3. **Slow Code Reviews** - Waiting 4+ hours for PR reviews
4. **Repetitive Error Analysis** - Same error patterns consume debugging time

Today, we present **Project-K** - an AI-powered platform that addresses all these pain points."

---

# Phase 2: Solution Overview (1 min)

## Script

> **[Show Dashboard with 4 feature cards]**

"Project-K integrates 4 powerful AI-driven features:

| Feature | Problem Solved | Time Saved |
|---------|---------------|------------|
| **JIRA Automation** | Manual ticket creation | 15 min → 30 sec |
| **Knowledge Search** | Scattered information | 10 min → 10 sec |
| **PR Review** | Slow code reviews | 4 hours → instant |
| **Error Log Analysis** | Repetitive debugging | 30 min → 1 min |

All powered by **Google Gemini AI** with **zero API cost** using the free tier."

---

# Phase 3: Live Demo (3-4 min)

---

## Demo 1: JIRA Automation (1 min)

> **[Navigate to JIRA Automation page]**

### Input Example
```
Users report that login fails on mobile Safari.
Error message shows "Session expired" after 
entering correct credentials.
Need to investigate and fix by next sprint.
```

### Demo Steps

1. **Paste** the natural language request
2. **Click** "Analyze" button
3. **Show** AI-generated results:
   - Epic breakdown
   - Story with acceptance criteria
   - Technical tasks
   - Estimated story points
4. **Highlight** "Similar Documents" section (G2 Confluence search)
5. **Click** "Create Ticket" to show JIRA integration

### Key Talking Points

- "Just paste a Slack message or email - AI converts it to structured tickets"
- "Similar documents prevent duplicate work"
- "One-click creation in JIRA"

---

## Demo 2: Knowledge Search (45 sec)

> **[Navigate to Knowledge Search page]**

### Input Example
```
How to handle CloudWatch alarms for FIC?
```

### Demo Steps

1. **Type** the search query
2. **Show** unified results from:
   - Confluence pages
   - JIRA tickets
   - Web results (Serper)
3. **Click** a result to show preview
4. **Highlight** source badges

### Key Talking Points

- "One search, multiple sources"
- "No more switching between Confluence, JIRA, and Google"
- "Includes external web results for broader context"

---

## Demo 3: PR Review (45 sec)

> **[Navigate to PR Review page]**

### Input Example
```
https://github.com/cainz/project-k/pull/42
```

### Demo Steps

1. **Paste** GitHub PR URL
2. **Click** "Review" button
3. **Show** AI analysis:
   - Code quality assessment
   - Security concerns
   - Performance suggestions
   - Best practices recommendations
4. **Highlight** severity levels (Critical/Warning/Info)

### Key Talking Points

- "Instant code review feedback"
- "Catches security issues and performance problems"
- "Frees up senior developers for complex reviews"

---

## Demo 4: Error Log Analysis (30 sec)

> **[Navigate to Error Log page]**

### Input Example
```
2026-02-05 10:23:45 ERROR [FIC-cloudwatch-alarm-009] 
Connection timeout to RDS instance db-prod-01
Retry attempt 3/3 failed
java.sql.SQLException: Connection timed out
```

### Demo Steps

1. **Paste** error log
2. **Click** "Analyze" button
3. **Show** AI-generated:
   - Error classification
   - Root cause analysis
   - Solution suggestions
   - Related documentation links

### Key Talking Points

- "Paste any error log - AI identifies the issue"
- "Get actionable solutions, not just descriptions"
- "Links to relevant Confluence documentation"

---

# Phase 4: Closing & Q&A (1 min)

## Script

> **[Return to Dashboard]**

"To summarize, Project-K transforms developer productivity:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Ticket Creation | 15 min | 30 sec | **30x faster** |
| Knowledge Search | 10 min | 10 sec | **60x faster** |
| Code Review Wait | 4 hours | Instant | **480x faster** |
| Error Analysis | 30 min | 1 min | **30x faster** |

**Tech Stack**: React + Vite + TypeScript + Google Gemini (Free Tier)

**Questions?**"

---

# Technical Backup Information

## If Demo Fails

Have these screenshots ready:
- `docs/screenshots/jira-analysis-result.png`
- `docs/screenshots/knowledge-results.png`
- `docs/screenshots/pr-review-result.png`
- `docs/screenshots/error-log-result.png`

## Quick Commands

```bash
# Start dev server
cd web && npm run dev

# Server URL
http://localhost:5173
```

## Environment Check

Before demo, verify:
- [ ] Dev server running
- [ ] Network connection stable
- [ ] Atlassian credentials valid
- [ ] GitHub token valid
- [ ] Gemini API key valid

---

# Demo Script (Japanese Version)

## 日本語デモスクリプト

### Phase 1: 問題提起

> **[ダッシュボード表示]**

「開発者は毎日、これらの課題に直面しています：

1. **手動チケット作成** - 要件をJIRAチケットに変換するのに15-30分
2. **散在する情報** - Confluence、JIRA、Teams、Webに分散
3. **遅いコードレビュー** - PRレビューに4時間以上待機
4. **繰り返しのエラー分析** - 同じエラーパターンのデバッグに時間消費

今日は**Project-K**を紹介します - これらすべての課題を解決するAI統合プラットフォームです。」

### Phase 2: ソリューション概要

> **[4つの機能カード表示]**

「Project-Kは4つの強力なAI機能を統合：

| 機能 | 解決する課題 | 時間短縮 |
|------|------------|---------|
| **JIRA自動化** | 手動チケット作成 | 15分 → 30秒 |
| **ナレッジ検索** | 散在する情報 | 10分 → 10秒 |
| **PRレビュー** | 遅いコードレビュー | 4時間 → 即時 |
| **エラーログ分析** | 繰り返しデバッグ | 30分 → 1分 |

すべて**Google Gemini AI**の**無料ティア**で動作 - APIコストゼロ！」

### Phase 3: ライブデモ

(Same demo steps as English version)

### Phase 4: クロージング

> **[ダッシュボードに戻る]**

「まとめると、Project-Kは開発者の生産性を劇的に向上：

| 指標 | Before | After | 改善 |
|------|--------|-------|------|
| チケット作成 | 15分 | 30秒 | **30倍高速** |
| ナレッジ検索 | 10分 | 10秒 | **60倍高速** |
| コードレビュー待ち | 4時間 | 即時 | **480倍高速** |
| エラー分析 | 30分 | 1分 | **30倍高速** |

**技術スタック**: React + Vite + TypeScript + Google Gemini (無料ティア)

**ご質問は？**」

---

# Appendix: Demo Data

## JIRA Automation Sample Input

### Japanese
```
モバイルSafariでログインが失敗する問題が報告されています。
正しい認証情報を入力しても「セッション期限切れ」エラーが表示されます。
次スプリントまでに調査・修正が必要です。
```

### English
```
Users report that login fails on mobile Safari.
Error message shows "Session expired" after 
entering correct credentials.
Need to investigate and fix by next sprint.
```

## Knowledge Search Sample Queries

- `How to handle CloudWatch alarms?`
- `JIRA workflow best practices`
- `Authentication token refresh`

## PR Review Sample URLs

- Use any public GitHub PR URL
- Or create a demo PR in the project repo

## Error Log Sample

```
2026-02-05 10:23:45 ERROR [FIC-cloudwatch-alarm-009] 
Connection timeout to RDS instance db-prod-01
Retry attempt 3/3 failed
java.sql.SQLException: Connection timed out
  at com.mysql.jdbc.ConnectionImpl.connect(ConnectionImpl.java:1234)
  at com.cainz.service.DatabaseService.getConnection(DatabaseService.java:45)
```
