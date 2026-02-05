# API Reference

> REST endpoint specifications for Project-K

All endpoints are served by Vite middleware in development.

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Knowledge search across sources |
| `/api/jira` | POST | Create JIRA tickets |
| `/api/pr-review` | POST | Review GitHub PR |
| `/api/error-log` | POST | Analyze error logs |
| `/api/teams` | POST | Search Teams messages |
| `/api/web-search` | POST | Web search via Serper |

---

## POST /api/search

Search across Confluence, JIRA, and Teams.

### Request

```json
{
  "query": "authentication flow",
  "sources": ["confluence", "jira", "teams"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `sources` | string[] | No | Sources to search (default: all) |

### Response

```json
{
  "results": [
    {
      "id": "12345",
      "title": "Authentication Architecture",
      "excerpt": "This document describes the OAuth 2.0 flow...",
      "url": "https://domain.atlassian.net/wiki/spaces/...",
      "source": "confluence",
      "score": 0.95
    },
    {
      "id": "PROJ-123",
      "title": "Implement SSO login",
      "excerpt": "As a user, I want to login with SSO...",
      "url": "https://domain.atlassian.net/browse/PROJ-123",
      "source": "jira",
      "score": 0.82
    }
  ],
  "totalCount": 15
}
```

### Error Response

```json
{
  "error": "Search failed",
  "message": "Invalid CQL query syntax"
}
```

---

## POST /api/jira

Create JIRA tickets with optional Confluence page.

### Request

```json
{
  "tickets": [
    {
      "title": "Implement user authentication",
      "description": "Add OAuth 2.0 login flow with Google provider",
      "type": "Story",
      "priority": "High",
      "labels": ["backend", "security"]
    }
  ],
  "projectKey": "PROJ",
  "createConfluencePage": true,
  "confluenceSpaceId": "123456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tickets` | TicketDraft[] | Yes | Tickets to create |
| `projectKey` | string | Yes | JIRA project key |
| `createConfluencePage` | boolean | No | Create linked Confluence page |
| `confluenceSpaceId` | string | No* | Required if createConfluencePage is true |

### Response

```json
{
  "created": [
    {
      "key": "PROJ-456",
      "url": "https://domain.atlassian.net/browse/PROJ-456",
      "confluenceUrl": "https://domain.atlassian.net/wiki/spaces/..."
    }
  ],
  "failed": []
}
```

---

## POST /api/pr-review

Review a GitHub Pull Request with AI.

### Request

```json
{
  "prUrl": "https://github.com/owner/repo/pull/123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prUrl` | string | Yes | GitHub PR URL |

### Response

```json
{
  "pr": {
    "title": "Add user authentication",
    "body": "This PR implements OAuth 2.0...",
    "additions": 234,
    "deletions": 45,
    "filesChanged": 12
  },
  "files": [
    {
      "filename": "src/auth/login.ts",
      "status": "added",
      "additions": 120,
      "deletions": 0
    }
  ],
  "review": {
    "summary": "Overall good implementation with minor suggestions",
    "issues": [
      {
        "path": "src/auth/login.ts",
        "line": 45,
        "message": "Consider using environment variable for secret",
        "severity": "warning"
      }
    ],
    "suggestions": [
      "Add unit tests for error cases",
      "Consider rate limiting for login endpoint"
    ],
    "recommendation": "APPROVE",
    "complexityScore": 65
  }
}
```

### Error Response

```json
{
  "error": "Invalid PR URL format"
}
```

---

## POST /api/error-log

Analyze error logs and find solutions.

### Request

```json
{
  "errorLog": "TypeError: Cannot read property 'map' of undefined\n    at UserList.render (UserList.tsx:25)"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `errorLog` | string | Yes | Error log text |

### Response

```json
{
  "classification": {
    "type": "TypeError",
    "category": "null-reference",
    "severity": "medium"
  },
  "analysis": "The error occurs when trying to call .map() on an undefined variable...",
  "suggestions": [
    "Add null check before mapping",
    "Use optional chaining: users?.map()",
    "Ensure data is loaded before rendering"
  ],
  "relatedIssues": [
    {
      "key": "PROJ-100",
      "title": "Fix null pointer in UserList",
      "url": "https://domain.atlassian.net/browse/PROJ-100"
    }
  ]
}
```

---

## POST /api/teams

Search Microsoft Teams messages.

### Request

```json
{
  "query": "deployment schedule",
  "teamId": "team-id-here"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `teamId` | string | No | Specific team to search |

### Response

```json
{
  "results": [
    {
      "id": "msg-123",
      "content": "Deployment scheduled for Friday 3pm",
      "sender": "john.doe@company.com",
      "timestamp": "2026-02-05T15:30:00Z",
      "channelName": "dev-ops",
      "url": "https://teams.microsoft.com/..."
    }
  ],
  "totalCount": 5
}
```

### Error Response

```json
{
  "error": "Teams API not configured",
  "message": "Missing VITE_TEAMS_* environment variables"
}
```

---

## POST /api/web-search

Search the web via Serper API.

### Request

```json
{
  "query": "react useEffect cleanup best practices"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |

### Response

```json
{
  "results": [
    {
      "title": "React useEffect Cleanup Function - Complete Guide",
      "snippet": "Learn how to properly clean up effects in React...",
      "url": "https://example.com/react-useeffect-cleanup",
      "source": "example.com"
    }
  ]
}
```

---

## Common Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Short error code",
  "message": "Detailed error description"
}
```

---

## Rate Limiting

Currently no rate limiting in development mode.

**Production Considerations:**
- Implement rate limiting per endpoint
- Add request queuing for external APIs
- Cache frequently accessed data

---

## Authentication

All endpoints use environment variables for authentication:

| Service | Auth Method |
|---------|-------------|
| Atlassian | Basic Auth (email:token) |
| GitHub | Bearer Token |
| Teams | OAuth 2.0 (client credentials) |
| Gemini | API Key |
| Serper | API Key |

---

## Related Documentation

- [Environment Setup](../setup/ENVIRONMENT.md) - Configure API keys
- [Backend Architecture](BACKEND.md) - Implementation details
- [Architecture Overview](OVERVIEW.md) - System design
