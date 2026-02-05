# Backend Architecture

> Plugins, shared clients, and utility modules

## Directory Structure

```
src/
├── index.ts                    # Entry point (exports all modules)
│
├── shared/
│   ├── types/
│   │   └── index.ts            # Shared type definitions
│   │
│   ├── clients/                # API client implementations
│   │   ├── index.ts            # Client exports
│   │   ├── jira-client.ts      # JIRA REST API v3
│   │   ├── confluence-client.ts # Confluence REST API v2
│   │   ├── gemini-client.ts    # Google Generative AI
│   │   └── github-client.ts    # GitHub REST API
│   │
│   └── utils/
│       └── query-escape.ts     # Query escaping utilities
│
└── plugins/                    # Feature modules
    ├── dashboard/
    │   ├── index.ts
    │   └── router.ts
    │
    ├── jira-automation/
    │   ├── index.ts
    │   └── ticket-generator.ts
    │
    ├── knowledge-search/
    │   ├── index.ts
    │   └── searcher.ts
    │
    ├── pr-review/
    │   ├── index.ts
    │   └── reviewer.ts
    │
    └── error-log-search/
        ├── index.ts
        ├── classifier.ts
        └── searcher.ts
```

---

## Shared Clients

### JiraClient

JIRA REST API v3 wrapper.

```typescript
// src/shared/clients/jira-client.ts

interface JiraClientConfig {
  domain: string
  email: string
  apiToken: string
}

class JiraClient {
  constructor(private config: JiraClientConfig) {}

  async searchIssues(jql: string): Promise<JiraIssue[]>
  async createIssue(issue: CreateIssueInput): Promise<JiraIssue>
  async searchInProject(projectKey: string, query: string): Promise<JiraIssue[]>
}
```

**Key Features:**
- Basic auth with API token
- JQL query building
- Query escaping for special characters

### ConfluenceClient

Confluence REST API v2 wrapper.

```typescript
// src/shared/clients/confluence-client.ts

interface ConfluenceClientConfig {
  domain: string
  email: string
  apiToken: string
}

class ConfluenceClient {
  constructor(private config: ConfluenceClientConfig) {}

  async searchPages(cql: string): Promise<ConfluencePage[]>
  async searchInSpace(spaceKey: string, query: string): Promise<ConfluencePage[]>
  async createPage(input: CreatePageInput): Promise<ConfluencePage>
  async upsertPage(input: UpsertPageInput): Promise<ConfluencePage>
}
```

**Key Features:**
- CQL query support
- Page creation with ADF (Atlassian Document Format)
- Upsert pattern (create or update)

### GeminiClient

Google Generative AI wrapper.

```typescript
// src/shared/clients/gemini-client.ts

interface GeminiClientConfig {
  apiKey: string
  model?: string  // default: 'gemini-2.5-flash'
}

class GeminiClient {
  constructor(private config: GeminiClientConfig) {}

  async generateText(prompt: string): Promise<string>
  async chat(messages: ChatMessage[]): Promise<string>
  async generateJSON<T>(prompt: string, schema?: ZodSchema): Promise<T>
}
```

**Key Features:**
- Text generation
- Chat conversation
- JSON structured output with Zod validation

### GithubClient

GitHub REST API wrapper.

```typescript
// src/shared/clients/github-client.ts

interface GithubClientConfig {
  token: string
}

class GithubClient {
  constructor(private config: GithubClientConfig) {}

  async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest>
  async getPullRequestFiles(owner: string, repo: string, number: number): Promise<PRFile[]>
  async getPullRequestDiff(owner: string, repo: string, number: number): Promise<string>
}
```

---

## Plugins

### Plugin Pattern

Each plugin follows a consistent structure:

```
plugin-name/
├── index.ts          # Public exports
└── implementation.ts # Core logic
```

**Dependency Injection:**

```typescript
interface PluginConfig {
  jira: JiraClient
  confluence: ConfluenceClient
  gemini: GeminiClient
}

export async function executePlugin(
  config: PluginConfig,
  input: PluginInput
): Promise<PluginOutput> {
  // Implementation
}
```

### JIRA Automation Plugin

Generates JIRA tickets from natural language.

```typescript
// src/plugins/jira-automation/ticket-generator.ts

interface TicketGeneratorConfig {
  gemini: GeminiClient
  projectKey: string
}

export async function generateTickets(
  config: TicketGeneratorConfig,
  request: string
): Promise<TicketDraft[]>
```

**Features:**
- Bilingual support (Japanese/English)
- Automatic task breakdown
- Priority and type inference

### Knowledge Search Plugin

Unified search across multiple sources.

```typescript
// src/plugins/knowledge-search/searcher.ts

interface KnowledgeSearchConfig {
  jira: JiraClient
  confluence: ConfluenceClient
  gemini: GeminiClient
}

export async function searchKnowledge(
  config: KnowledgeSearchConfig,
  query: string
): Promise<KnowledgeSearchResult>
```

**Features:**
- Parallel search execution
- Result merging and ranking
- AI synthesis

### PR Review Plugin

AI-powered code review.

```typescript
// src/plugins/pr-review/reviewer.ts

interface PRReviewConfig {
  github: GithubClient
  gemini: GeminiClient
}

export async function reviewPullRequest(
  config: PRReviewConfig,
  prUrl: string
): Promise<PRReviewResult>
```

**Features:**
- PR metadata extraction
- Diff analysis
- Issue detection (security, performance, best practices)

### Error Log Plugin

Error classification and solution finding.

```typescript
// src/plugins/error-log-search/classifier.ts

interface ErrorLogConfig {
  jira: JiraClient
  gemini: GeminiClient
}

export async function classifyError(
  config: ErrorLogConfig,
  errorLog: string
): Promise<ErrorClassification>
```

---

## Utilities

### Query Escaping

```typescript
// src/shared/utils/query-escape.ts

/**
 * Escape special characters for JQL/CQL queries
 */
export function escapeSearchQuery(query: string): string {
  return query
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    // ... more escapes
}
```

**Usage:**

```typescript
const safeQuery = escapeSearchQuery(userInput)
const jql = `text ~ "${safeQuery}"`
```

---

## Type Definitions

### Shared Types

```typescript
// src/shared/types/index.ts

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  url: string
  source: 'jira' | 'confluence' | 'teams' | 'web'
  score?: number
}

export interface TicketDraft {
  title: string
  description: string
  type: 'Task' | 'Story' | 'Bug' | 'Epic'
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'
  labels?: string[]
}

export interface PRReviewResult {
  summary: string
  issues: ReviewIssue[]
  suggestions: string[]
  recommendation: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  complexityScore: number
}
```

---

## Testing

Tests are in the root `tests/` directory.

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/jira-client.test.ts

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
tests/
├── jira-client.test.ts        # JIRA client tests
├── confluence-client.test.ts  # Confluence client tests
├── ticket-generator.test.ts   # Ticket generation tests
├── knowledge-searcher.test.ts # Search tests
├── query-escape.test.ts       # Utility tests
└── ...
```

---

## Related Documentation

- [Frontend Architecture](FRONTEND.md) - React/Vite details
- [API Reference](API.md) - Endpoint specifications
- [Architecture Overview](OVERVIEW.md) - System design
