# Frontend Architecture

> React + Vite + TypeScript frontend structure

## Directory Structure

```
web/
├── src/
│   ├── App.tsx                 # React Router configuration
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles (Tailwind)
│   │
│   ├── pages/                  # Page components
│   │   ├── dashboard.tsx       # Dashboard with config status
│   │   ├── jira-automation.tsx # JIRA ticket generation
│   │   ├── knowledge-search.tsx # Unified search
│   │   ├── pr-review.tsx       # PR code review
│   │   └── error-log-search.tsx # Error log analysis
│   │
│   ├── services/               # API clients
│   │   ├── api.ts              # JIRA automation API
│   │   ├── knowledge-api.ts    # Knowledge search API
│   │   ├── pr-review-api.ts    # PR review API
│   │   ├── teams-api.ts        # Microsoft Teams API
│   │   └── serper-api.ts       # Web search API
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useI18n.ts          # Internationalization
│   │   └── useParallelSearch.ts # Parallel search orchestration
│   │
│   ├── components/             # UI components
│   │   ├── layout/             # App shell
│   │   │   ├── sidebar.tsx     # Navigation sidebar
│   │   │   └── app-layout.tsx  # Main layout wrapper
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.ts              # API response types
│   │   ├── search.ts           # Search result types
│   │   └── teams.ts            # Teams integration types
│   │
│   ├── locales/                # i18n translations
│   │   ├── ja.json             # Japanese
│   │   └── en.json             # English
│   │
│   └── lib/                    # Utilities
│       └── utils.ts            # cn() helper for Tailwind
│
├── vite.config.ts              # Vite config + API middleware
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## Pages Overview

### Dashboard (`dashboard.tsx`)

| Component | Description |
|-----------|-------------|
| Config Status Card | Shows unconfigured integrations (Teams, Confluence) |
| Stats Grid | Ticket counts, search queries, etc. |
| Feature Cards | Links to each feature |
| External Links | Quick links to JIRA, Confluence, GitHub |

### JIRA Automation (`jira-automation.tsx`)

| Component | Description |
|-----------|-------------|
| Input Area | Natural language feature request |
| Settings Panel | Scope, type, priority configuration |
| Ticket Preview | Generated ticket drafts with edit capability |
| Create Button | Submit to JIRA API |

### Knowledge Search (`knowledge-search.tsx`)

| Component | Description |
|-----------|-------------|
| Search Input | Query with search button |
| Source Tabs | Filter by Confluence/JIRA/Teams/Web |
| Results List | Cards with title, excerpt, source |
| AI Summary | Gemini-generated synthesis |

### PR Review (`pr-review.tsx`)

| Component | Description |
|-----------|-------------|
| URL Input | GitHub PR URL |
| Stats Dashboard | Active PRs, quality metrics |
| Recent PRs | List with complexity badges |
| Review Results | Issues, suggestions, recommendation |

### Error Log Search (`error-log-search.tsx`)

| Component | Description |
|-----------|-------------|
| Log Input | Paste error log text |
| Classification | Error type detection |
| Solutions | AI-suggested fixes |
| Related Issues | JIRA issues with similar errors |

---

## Key Hooks

### useParallelSearch

Orchestrates parallel searches across multiple sources.

```typescript
const {
  results,           // SearchResult[]
  isLoading,         // boolean
  progress,          // { confluence, jira, teams, web }
  aiSummary,         // string | null
  search,            // (query: string) => void
} = useParallelSearch()
```

**Behavior:**
1. Fires 4 parallel API calls
2. Updates results progressively as each completes
3. Triggers AI synthesis when all complete

### useI18n

Simple internationalization hook.

```typescript
const { t, language, setLanguage } = useI18n()

// Usage
t('dashboard.title')  // Returns localized string
```

---

## Services Architecture

### API Client Pattern

```typescript
// services/pr-review-api.ts
export interface PRReviewResponse {
  pr: PRInfo
  files: PRFile[]
  review: ReviewResult
}

export async function reviewPullRequest(prUrl: string): Promise<PRReviewResponse> {
  const response = await fetch('/api/pr-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prUrl }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}
```

### Service Files

| Service | Endpoint | Purpose |
|---------|----------|---------|
| `api.ts` | `/api/jira` | JIRA ticket creation |
| `knowledge-api.ts` | `/api/search` | Knowledge search |
| `pr-review-api.ts` | `/api/pr-review` | PR code review |
| `teams-api.ts` | `/api/teams` | Teams message search |
| `serper-api.ts` | `/api/web-search` | Web search |

---

## Component Library

Using **shadcn/ui** with Tailwind CSS.

### Available Components

| Component | Usage |
|-----------|-------|
| `Button` | Actions, submissions |
| `Card` | Content containers |
| `Input` | Text input fields |
| `Badge` | Status labels |
| `Tabs` | Content organization |
| `Dialog` | Modal dialogs |
| `Select` | Dropdown selection |

### Styling Pattern

```tsx
import { cn } from '@/lib/utils'

<Card className={cn(
  'border-amber-300',
  configIssues.length > 0 && 'bg-amber-50/50'
)}>
```

---

## Routing

Using React Router v7.

```tsx
// App.tsx
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="jira-automation" element={<JiraAutomationPage />} />
    <Route path="knowledge-search" element={<KnowledgeSearchPage />} />
    <Route path="pr-review" element={<PrReviewPage />} />
    <Route path="error-log-search" element={<ErrorLogSearchPage />} />
  </Route>
</Routes>
```

---

## Internationalization

### Structure

```
locales/
├── ja.json    # Japanese (default)
└── en.json    # English
```

### Keys Pattern

```json
{
  "dashboard": {
    "title": "ダッシュボード",
    "configStatus": "設定状態",
    "teamsNotConfigured": "Teams API未設定"
  },
  "jira": {
    "title": "JIRA自動化",
    "placeholder": "機能リクエストを入力..."
  }
}
```

---

## Build Configuration

### Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    // API middleware plugins
    {
      name: 'api-search',
      configureServer(server) {
        server.middlewares.use('/api/search', handler)
      }
    }
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### Path Aliases

| Alias | Path |
|-------|------|
| `@/` | `web/src/` |
| `@/components` | `web/src/components/` |
| `@/services` | `web/src/services/` |
| `@/hooks` | `web/src/hooks/` |

---

## Related Documentation

- [Backend Architecture](BACKEND.md) - Server-side structure
- [API Reference](API.md) - Endpoint details
- [Architecture Overview](OVERVIEW.md) - System design
