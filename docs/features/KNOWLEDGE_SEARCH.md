# Knowledge Search Feature

> Unified search across Confluence, JIRA, Teams, and Web

## Overview

Search across multiple knowledge sources simultaneously with AI-powered synthesis.

```
Search Query: "authentication best practices"
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                  Parallel Search                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Confluence│ │   JIRA   │ │  Teams   │ │   Web    │   │
│  │   CQL    │ │   JQL    │ │  Graph   │ │  Serper  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │            │            │            │          │
│       └────────────┴────────────┴────────────┘          │
│                         │                                │
│                         ▼                                │
│              ┌──────────────────┐                       │
│              │  Merge & Rank    │                       │
│              └────────┬─────────┘                       │
│                       │                                  │
│                       ▼                                  │
│              ┌──────────────────┐                       │
│              │  AI Synthesis    │                       │
│              │    (Gemini)      │                       │
│              └──────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| Parallel Search | All sources searched simultaneously |
| Progressive Loading | Results appear as they arrive |
| Source Filtering | Filter by specific sources |
| AI Synthesis | Summarize findings with Gemini |
| Query Escaping | Safe handling of special characters |

---

## Search Sources

### Confluence

| Aspect | Details |
|--------|---------|
| Query Type | CQL (Confluence Query Language) |
| Fields Searched | Title, Body text |
| Results | Pages with excerpt |

**Example CQL:**
```
(title ~ "authentication" OR text ~ "authentication") AND type = page
```

### JIRA

| Aspect | Details |
|--------|---------|
| Query Type | JQL (JIRA Query Language) |
| Fields Searched | Summary, Description |
| Results | Issues with details |

**Example JQL:**
```
(summary ~ "authentication" OR description ~ "authentication") ORDER BY updated DESC
```

### Microsoft Teams

| Aspect | Details |
|--------|---------|
| Query Type | Graph API Search |
| Fields Searched | Message content |
| Results | Messages with context |

**Requirements:**
- Azure AD app registration
- `ChannelMessage.Read.All` permission

### Web Search

| Aspect | Details |
|--------|---------|
| Provider | Serper API |
| Query Type | Google Search |
| Results | Web pages with snippets |

---

## User Interface

### Search Input

| Element | Description |
|---------|-------------|
| Search Box | Query input field |
| Search Button | Trigger search |
| Clear Button | Reset results |

### Results Display

| Element | Description |
|---------|-------------|
| Source Tabs | Filter by source |
| Result Cards | Title, excerpt, source, link |
| Loading States | Per-source progress |
| AI Summary | Synthesized answer |

---

## Usage

### Basic Search

1. Enter search query
2. Click Search or press Enter
3. View results as they load
4. Click result to open source

### Filtered Search

1. Enter query
2. Click source tabs to filter
3. View filtered results

### AI Summary

After all sources complete:
1. AI analyzes all results
2. Generates synthesized summary
3. Displays at top of results

---

## Hook: useParallelSearch

```typescript
const {
  results,           // SearchResult[]
  isLoading,         // boolean
  progress,          // { confluence, jira, teams, web }
  aiSummary,         // string | null
  error,             // string | null
  search,            // (query: string) => void
  reset,             // () => void
} = useParallelSearch()
```

### Progress States

| State | Meaning |
|-------|---------|
| `idle` | Not started |
| `loading` | In progress |
| `complete` | Finished |
| `error` | Failed |

---

## API Endpoints

### POST /api/search

Main search endpoint.

**Request:**
```json
{
  "query": "authentication",
  "sources": ["confluence", "jira"]
}
```

**Response:**
```json
{
  "results": [...],
  "totalCount": 25
}
```

### POST /api/teams

Teams search (separate endpoint).

### POST /api/web-search

Web search via Serper.

---

## Query Escaping

Special characters are escaped to prevent query injection:

| Character | Escaped |
|-----------|---------|
| `\` | `\\` |
| `"` | `\"` |
| `[` | `\[` |
| `]` | `\]` |
| `+` | `\+` |
| `&` | `\&` |

---

## Configuration

### Required

| Variable | Purpose |
|----------|---------|
| `VITE_ATLASSIAN_DOMAIN` | Atlassian instance |
| `VITE_ATLASSIAN_EMAIL` | Auth email |
| `VITE_ATLASSIAN_API_TOKEN` | Auth token |
| `VITE_GEMINI_API_KEY` | AI synthesis |

### Optional

| Variable | Purpose |
|----------|---------|
| `VITE_TEAMS_*` | Teams search |
| `VITE_SERPER_API_KEY` | Web search |

---

## File Locations

| Purpose | File |
|---------|------|
| Page Component | `web/src/pages/knowledge-search.tsx` |
| Search Hook | `web/src/hooks/useParallelSearch.ts` |
| API Service | `web/src/services/knowledge-api.ts` |
| Teams Service | `web/src/services/teams-api.ts` |
| Web Service | `web/src/services/serper-api.ts` |
| Backend Plugin | `src/plugins/knowledge-search/` |

---

## Troubleshooting

### No results from Confluence/JIRA

1. Check API credentials
2. Verify domain is correct
3. Check content exists and is accessible

### Teams search not working

1. Verify Azure AD configuration
2. Check Teams environment variables
3. Confirm API permissions

### Web search not working

1. Set `VITE_SERPER_API_KEY`
2. Check Serper account quota
3. Verify API key is valid

### AI summary not appearing

1. Check Gemini API key
2. Wait for all sources to complete
3. Check browser console for errors

---

## Related Documentation

- [JIRA Automation](JIRA_AUTOMATION.md) - Create tickets from search
- [Environment Setup](../setup/ENVIRONMENT.md) - API configuration
- [API Reference](../architecture/API.md) - Endpoint details
