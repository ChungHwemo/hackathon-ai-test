# Architecture Overview

> High-level system design for Project-K AI Platform

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Project-K AI Platform                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     Frontend (React + Vite + TypeScript)                │ │
│  │  /web                                                                   │ │
│  │  ├── Dashboard         - System overview & config status               │ │
│  │  ├── JIRA Automation   - Natural language → JIRA tickets               │ │
│  │  ├── Knowledge Search  - Unified search (4 sources)                    │ │
│  │  ├── PR Review         - AI-powered code review                        │ │
│  │  └── Error Log Search  - Error analysis & solutions                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Vite Dev Server Middleware                           │ │
│  │  /web/vite.config.ts                                                   │ │
│  │  ├── /api/search      → Confluence + JIRA + Teams search               │ │
│  │  ├── /api/jira        → Ticket creation + Confluence pages             │ │
│  │  ├── /api/pr-review   → GitHub PR + Gemini review                      │ │
│  │  └── /api/error-log   → Error analysis + JIRA search                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         External Services                               │ │
│  │  ├── Atlassian Cloud (JIRA REST v3 + Confluence REST v2)               │ │
│  │  ├── Microsoft Teams (Graph API)                                       │ │
│  │  ├── GitHub API (REST v3)                                              │ │
│  │  ├── Google Gemini AI                                                  │ │
│  │  └── Serper (Web Search)                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
hackathon-ai-test/
├── web/                        # Frontend Application
│   ├── src/
│   │   ├── App.tsx             # React Router setup
│   │   ├── main.tsx            # Entry point
│   │   ├── pages/              # Page components (5 pages)
│   │   ├── services/           # API clients
│   │   ├── hooks/              # Custom React hooks
│   │   ├── components/         # UI components (shadcn/ui)
│   │   ├── types/              # TypeScript types
│   │   └── locales/            # i18n (ja/en)
│   └── vite.config.ts          # Vite + API middleware
│
├── src/                        # Backend Library
│   ├── index.ts                # Entry point (exports)
│   ├── shared/
│   │   ├── types/              # Shared type definitions
│   │   ├── clients/            # API client implementations
│   │   └── utils/              # Utility functions
│   └── plugins/                # Feature modules
│       ├── dashboard/
│       ├── jira-automation/
│       ├── knowledge-search/
│       ├── pr-review/
│       └── error-log-search/
│
├── tests/                      # Test files (Vitest)
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── package.json                # Root package
```

---

## Tech Stack

### Frontend Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 7.x | Build tool + Dev server |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Component library |
| React Router | 7.x | Client-side routing |
| Lucide React | latest | Icons |

### Backend Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.6 | Type safety |
| Zod | 3.x | Runtime validation |
| @google/generative-ai | 0.21 | Gemini API client |

### External Services
| Service | API Version | Purpose |
|---------|-------------|---------|
| Atlassian Cloud | JIRA v3, Confluence v2 | Issue tracking, Documentation |
| GitHub | REST API v3 | PR data, Diffs |
| Microsoft Teams | Graph API | Message search |
| Google Gemini | v1beta | AI text generation |
| Serper | REST | Web search |

---

## Design Patterns

### 1. Vite Middleware Pattern

API requests are handled by Vite dev server middleware plugins.

```typescript
// web/vite.config.ts
{
  name: 'api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/search', async (req, res) => {
      // Direct external API calls
    })
  }
}
```

**Advantages:**
- Simple setup for prototyping
- No separate backend process
- Hot reload for API changes

**Limitations:**
- Dev-only (won't work in production build)
- No authentication layer
- No rate limiting

### 2. Plugin Architecture

Backend features are modular plugins with dependency injection.

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
  return mergeResults(jiraResults, confluenceResults);
}
```

### 3. Shared Clients

Reusable API clients with consistent interfaces.

| Client | File | Key Methods |
|--------|------|-------------|
| JiraClient | `jira-client.ts` | `searchIssues()`, `createIssue()` |
| ConfluenceClient | `confluence-client.ts` | `searchPages()`, `createPage()` |
| GeminiClient | `gemini-client.ts` | `generateText()`, `chat()` |
| GithubClient | `github-client.ts` | `getPullRequest()`, `getPullRequestFiles()` |

---

## Data Flow Examples

### Knowledge Search Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────┐
│ Frontend: useParallelSearch hook        │
│ 1. Fire 4 parallel searches             │
│    ├── Confluence (CQL)                 │
│    ├── JIRA (JQL)                       │
│    ├── Teams (Graph API)                │
│    └── Web (Serper)                     │
│ 2. Merge results progressively          │
│ 3. AI synthesis on completion           │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Vite Middleware: /api/search            │
│ - Route to appropriate external APIs    │
│ - Handle authentication                 │
│ - Normalize response format             │
└─────────────────────────────────────────┘
```

### JIRA Automation Flow

```
Natural Language Request
    │
    ▼
┌─────────────────────────────────────────┐
│ Frontend: Direct Gemini Call            │
│ 1. Detect language (bilingual support)  │
│ 2. Build prompt with JIRA format        │
│ 3. Parse JSON → TicketDraft[]           │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ User Review & Edit                      │
│ 1. Edit ticket drafts                   │
│ 2. Select tickets to create             │
│ 3. Click "Create in JIRA"               │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Vite Middleware: /api/jira              │
│ 1. Create JIRA issues                   │
│ 2. Optionally create Confluence page    │
│ 3. Return created ticket URLs           │
└─────────────────────────────────────────┘
```

---

## Related Documentation

- [Frontend Architecture](FRONTEND.md) - React/Vite details
- [Backend Architecture](BACKEND.md) - Plugins/Clients details
- [API Reference](API.md) - Endpoint specifications
