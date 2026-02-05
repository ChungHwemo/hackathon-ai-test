# Project-K AI - Architecture Document

> CAINZ Hackathon - Unified Development Platform
> Last Updated: 2026-02-05

## Overview

Project-K AI is a developer productivity platform that integrates Atlassian (JIRA/Confluence), GitHub, and Google Gemini AI to automate common development workflows.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Project-K AI Platform                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend (React + Vite)                       │   │
│  │  /web                                                                │   │
│  │  ├── Dashboard        - System overview & metrics                   │   │
│  │  ├── JIRA Automation  - AI-powered ticket generation                │   │
│  │  ├── Knowledge Search - Unified search across sources              │   │
│  │  ├── PR Review        - Automated code review                       │   │
│  │  └── Error Log Search - Error analysis & solutions                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Vite Dev Server Middleware                        │   │
│  │  /web/vite.config.ts                                                │   │
│  │  ├── /api/search     → Confluence + JIRA search                     │   │
│  │  ├── /api/jira       → Ticket creation                              │   │
│  │  ├── /api/pr-review  → GitHub PR + Gemini review                    │   │
│  │  └── /api/error-log  → Error analysis + JIRA search                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      External Services                               │   │
│  │  ├── Atlassian Cloud (JIRA + Confluence)                            │   │
│  │  ├── GitHub API                                                      │   │
│  │  └── Google Gemini AI                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
hackathon-ai-test/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # This file
│   ├── DevFlow_AI_PRD.md          # Product Requirements
│   └── 統合プラットフォーム_設計書.md  # Design spec (Japanese)
│
├── src/                           # Backend Library (TypeScript)
│   ├── index.ts                   # Entry point (exports all modules)
│   ├── shared/
│   │   ├── types/index.ts         # Shared type definitions
│   │   └── clients/               # API client implementations
│   │       ├── jira-client.ts     # JIRA REST API v3
│   │       ├── confluence-client.ts # Confluence REST API v2
│   │       ├── gemini-client.ts   # Google Generative AI
│   │       └── github-client.ts   # GitHub REST API
│   │
│   └── plugins/                   # Feature modules
│       ├── dashboard/             # Dashboard data aggregation
│       ├── jira-automation/       # Ticket generation from natural language
│       ├── knowledge-search/      # Unified knowledge search
│       ├── error-log-search/      # Error log analysis
│       └── pr-review/             # PR code review
│
├── web/                           # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx               # React Router setup
│   │   ├── main.tsx              # Entry point
│   │   ├── pages/                # Page components
│   │   │   ├── dashboard.tsx
│   │   │   ├── jira-automation.tsx
│   │   │   ├── knowledge-search.tsx
│   │   │   ├── pr-review.tsx
│   │   │   └── error-log-search.tsx
│   │   ├── services/             # API service layer
│   │   │   ├── api.ts            # JIRA automation API
│   │   │   └── knowledge-api.ts  # Knowledge search API
│   │   ├── components/           # Reusable UI components
│   │   │   ├── layout/           # App shell (sidebar, layout)
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # Frontend-specific types
│   │   └── locales/              # i18n translations (ja/en)
│   │
│   └── vite.config.ts            # Vite config + API middleware
│
├── scripts/                       # Utility scripts
│   └── seed-confluence-docs.ts   # Seed test data
│
├── package.json                   # Root package (backend)
└── .env                          # Environment variables
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 7.x | Build tool + Dev server |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | - | Component library |
| React Router | 7.x | Client-side routing |
| Lucide React | - | Icons |

### Backend (Library)
| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.6 | Type safety |
| Zod | 3.x | Runtime validation |
| @google/generative-ai | 0.21 | Gemini API client |
| LangChain | 0.3 | AI orchestration (optional) |

### External Services
| Service | API Version | Purpose |
|---------|-------------|---------|
| Atlassian Cloud | REST API v3 (JIRA), v2 (Confluence) | Issue tracking, Documentation |
| GitHub | REST API v3 | PR data, Diffs |
| Google Gemini | v1beta | AI text generation |

---

## Architecture Patterns

### 1. Vite Middleware Pattern (Current)

The frontend dev server handles API requests directly via custom middleware plugins in `vite.config.ts`.

```typescript
// web/vite.config.ts
{
  name: 'api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/search', async (req, res, next) => {
      // Direct Atlassian API calls
    })
  }
}
```

**Pros:**
- Simple setup for hackathon/prototyping
- No separate backend process needed
- Hot reload for API changes

**Cons:**
- Not production-ready (no clustering, rate limiting)
- Backend library in `src/` is not used by frontend
- Duplicate logic between `vite.config.ts` and `src/plugins/`

### 2. Plugin Architecture (Backend Library)

Plugins are functional modules that export async functions with dependency injection.

```typescript
// src/plugins/knowledge-search/searcher.ts
interface KnowledgeSearchConfig {
  jira: JiraClient;
  confluence: ConfluenceClient;
  gemini: GeminiClient;
}

export async function searchKnowledge(
  config: KnowledgeSearchConfig,
  query: string
): Promise<KnowledgeSearchResult> {
  const [jiraResults, confluenceResults] = await Promise.all([
    searchJiraKnowledge(config.jira, query),
    searchConfluenceKnowledge(config.confluence, query),
  ]);
  // ...
}
```

**Pattern:**
- Each plugin is a directory with `index.ts` (exports) and implementation files
- Dependencies (clients) are injected via config object
- Parallel execution with `Promise.all` for performance

### 3. Shared Clients

Reusable API clients in `src/shared/clients/`:

| Client | File | Methods |
|--------|------|---------|
| JiraClient | `jira-client.ts` | `searchIssues()`, `createIssue()`, `searchInProject()` |
| ConfluenceClient | `confluence-client.ts` | `searchPages()`, `searchInSpace()`, `createPage()` |
| GeminiClient | `gemini-client.ts` | `generateText()`, `chat()` |
| GithubClient | `github-client.ts` | `getPullRequest()`, `getPullRequestFiles()` |

---

## Data Flow

### Knowledge Search Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: knowledge-search.tsx                              │
│ 1. User enters query                                        │
│ 2. Calls searchInternal() → /api/search                     │
│ 3. If no results, calls searchWeb() → Gemini (fake web)     │
│ 4. Finally calls searchWithAI() → Gemini synthesis          │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Vite Middleware: /api/search                                │
│ 1. Parse query + sources                                    │
│ 2. Parallel: Confluence CQL search + JIRA JQL search        │
│ 3. Merge & return results                                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ External APIs                                               │
│ - Confluence: /wiki/rest/api/content/search?cql=...         │
│ - JIRA: /rest/api/3/search?jql=...                          │
└─────────────────────────────────────────────────────────────┘
```

### JIRA Automation Flow

```
User Request (Natural Language)
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: jira-automation.tsx                               │
│ 1. User enters feature request                              │
│ 2. Detects bilingual request (英語でも, in English)          │
│ 3. Calls generateTickets() → Gemini                         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: api.ts (direct Gemini call)                       │
│ 1. Build prompt with JIRA ticket format                     │
│ 2. Add bilingual instructions if detected                   │
│ 3. Parse JSON response → TicketDraft[]                      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ User Review                                                 │
│ 1. Edit ticket drafts                                       │
│ 2. Select tickets to create                                 │
│ 3. Click "Create in JIRA"                                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Vite Middleware: /api/jira                                  │
│ 1. Receive selected tickets                                 │
│ 2. Loop: Create each issue via JIRA API                     │
│ 3. Return created ticket keys + URLs                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```bash
# Atlassian Cloud
VITE_ATLASSIAN_DOMAIN=your-domain      # e.g., "cainz"
VITE_ATLASSIAN_EMAIL=user@example.com
VITE_ATLASSIAN_API_TOKEN=xxx
VITE_JIRA_PROJECT_KEY=KWA
VITE_CONFLUENCE_SPACE_KEY=G2

# GitHub
VITE_GITHUB_TOKEN=ghp_xxx

# Google Gemini
VITE_GEMINI_API_KEY=xxx
VITE_GEMINI_MODEL=gemini-2.5-flash

# Future: Teams Integration
# AZURE_TENANT_ID=xxx
# AZURE_CLIENT_ID=xxx
# AZURE_CLIENT_SECRET=xxx

# Future: Real Web Search
# SERPER_API_KEY=xxx
# or GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_ENGINE_ID
```

---

## Current Implementation Status

| Feature | Frontend | Backend API | External Integration | Status |
|---------|----------|-------------|---------------------|--------|
| Dashboard | ✅ UI | ❌ Mock | - | 🟡 Partial |
| JIRA Automation | ✅ Full | ✅ /api/jira | ✅ JIRA + Gemini | ✅ Complete |
| Knowledge Search | ✅ UI | ✅ /api/search | ✅ Confluence + JIRA | 🟡 Partial |
| - Web Search | ❌ Fake | - | ❌ Gemini fake | ❌ Not real |
| - AI Synthesis | ✅ | - | ✅ Gemini | ✅ |
| PR Review | ✅ UI | ✅ /api/pr-review | ✅ GitHub + Gemini | ✅ Complete |
| Error Log | ✅ UI | ⚠️ Not connected | Backend exists | 🟡 Partial |

### Known Gaps

1. **Web Search is Fake**: `knowledge-api.ts` asks Gemini to "pretend" to be web search results
2. **Error Log Page Uses Mock**: Frontend (`error-log-search.tsx`) uses mock data instead of `/api/error-log`
3. **Backend Library Unused**: `src/plugins/*` are well-structured but not called by frontend
4. **No Teams Integration**: Design exists in `統合プラットフォーム_設計書.md` but not implemented

---

## Extension Guide

### Adding a New Search Source (e.g., Teams, Google)

**Step 1: Create Shared Client**
```typescript
// src/shared/clients/teams-client.ts
export class TeamsClient {
  constructor(private config: TeamsConfig) {}
  
  async searchMessages(query: string): Promise<TeamsMessage[]> {
    // Microsoft Graph API call
  }
}
```

**Step 2: Update Types**
```typescript
// src/shared/types/index.ts
export interface SearchResult {
  source: 'jira' | 'confluence' | 'vector' | 'teams' | 'google';  // Add here
  // ...
}
```

**Step 3: Add to Vite Middleware**
```typescript
// web/vite.config.ts - inside /api/search handler
if (sources.includes('teams')) {
  const teamsResults = await searchTeams(query);
  results.push(...teamsResults);
}
```

**Step 4: Update Frontend**
```typescript
// web/src/services/knowledge-api.ts
export async function searchInternal(query: string): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    body: JSON.stringify({ query, sources: ['confluence', 'jira', 'teams'] }),  // Add teams
  });
}
```

---

## Production Considerations

### Current Limitations (Hackathon Mode)
- Vite middleware is dev-only (won't work in production build)
- No authentication/authorization
- No rate limiting
- No error retry logic
- API keys exposed via VITE_ prefix

### Recommended Production Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│   API Gateway   │────▶│  Backend API    │
│  (Static Host)  │     │  (Auth, Rate)   │     │  (Node/Express) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  src/plugins/*  │
                                              │  (Reuse code)   │
                                              └─────────────────┘
```

---

## References

- [JIRA REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Confluence REST API v2](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Microsoft Graph - Teams](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview)
