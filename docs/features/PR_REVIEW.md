# PR Review Feature

> AI-powered code review for GitHub Pull Requests

## Overview

Analyze GitHub Pull Requests with Google Gemini AI to identify issues, provide suggestions, and generate review recommendations.

```
GitHub PR URL
    │
    ▼
┌─────────────────────────────────────┐
│          GitHub API                  │
│  ├── Get PR metadata                │
│  ├── Get file changes               │
│  └── Get diff content               │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│          Gemini AI                   │
│  ├── Analyze code changes           │
│  ├── Detect issues                  │
│  ├── Generate suggestions           │
│  └── Compute complexity score       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│          Review Results              │
│  ├── Summary                        │
│  ├── Issues (error/warning/info)    │
│  ├── Suggestions                    │
│  └── Recommendation                 │
└─────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| Issue Detection | Security, performance, best practices |
| Severity Levels | Error, Warning, Info |
| Line-level Feedback | Specific file and line references |
| Complexity Score | 0-100 complexity rating |
| Recommendations | APPROVE, REQUEST_CHANGES, COMMENT |

---

## User Interface

### Dashboard Section

| Element | Description |
|---------|-------------|
| Active PRs | Count of open PRs |
| Avg Merge Time | Average time to merge |
| Quality Rate | Percentage of clean PRs |
| Complexity Issues | Count of high-complexity PRs |

### Review Section

| Element | Description |
|---------|-------------|
| URL Input | GitHub PR URL field |
| Review Button | Trigger analysis |
| Loading State | Progress indicator |
| Results Display | Review findings |

### Results Display

| Element | Description |
|---------|-------------|
| PR Info | Title, additions, deletions |
| Issue Cards | Severity, file, line, message |
| Suggestions | Improvement recommendations |
| Recommendation | Final verdict badge |

---

## Usage

### Step 1: Enter PR URL

Paste a GitHub PR URL:
```
https://github.com/owner/repo/pull/123
```

### Step 2: Wait for Analysis

The system will:
1. Fetch PR metadata from GitHub
2. Retrieve file changes and diffs
3. Analyze with Gemini AI
4. Generate review results

### Step 3: Review Results

**Summary:**
> Overall good implementation with some security concerns in authentication handling.

**Issues:**
| Severity | File | Line | Message |
|----------|------|------|---------|
| Error | auth/login.ts | 45 | Hardcoded secret detected |
| Warning | utils/api.ts | 23 | Missing error handling |
| Info | types/user.ts | 12 | Consider stricter types |

**Suggestions:**
- Add unit tests for error cases
- Use environment variables for secrets
- Add input validation

**Recommendation:** REQUEST_CHANGES

---

## Issue Severities

| Severity | Icon | Color | Meaning |
|----------|------|-------|---------|
| Error | ⚠️ | Red | Must fix before merge |
| Warning | ⚡ | Yellow | Should fix |
| Info | ℹ️ | Blue | Optional improvement |

---

## Complexity Score

| Score | Rating | Meaning |
|-------|--------|---------|
| 0-30 | Low | Simple changes |
| 31-60 | Medium | Moderate complexity |
| 61-80 | High | Complex changes |
| 81-100 | Very High | Major refactoring |

---

## Recommendations

| Value | Meaning |
|-------|---------|
| APPROVE | Ready to merge |
| COMMENT | Optional improvements |
| REQUEST_CHANGES | Must address issues |

---

## API Endpoint

### POST /api/pr-review

**Request:**
```json
{
  "prUrl": "https://github.com/owner/repo/pull/123"
}
```

**Response:**
```json
{
  "pr": {
    "title": "Add user authentication",
    "body": "Implements OAuth 2.0...",
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
    "summary": "...",
    "issues": [...],
    "suggestions": [...],
    "recommendation": "APPROVE",
    "complexityScore": 65
  }
}
```

---

## Configuration

### Required

| Variable | Purpose |
|----------|---------|
| `VITE_GITHUB_TOKEN` | GitHub API access |
| `VITE_GEMINI_API_KEY` | AI analysis |
| `VITE_GEMINI_MODEL` | Gemini model |

### GitHub Token Permissions

| Scope | Purpose |
|-------|---------|
| `repo` | Access private repos |
| `public_repo` | Access public repos only |

---

## File Locations

| Purpose | File |
|---------|------|
| Page Component | `web/src/pages/pr-review.tsx` |
| API Service | `web/src/services/pr-review-api.ts` |
| API Tests | `web/src/services/__tests__/pr-review-api.test.ts` |
| Backend Plugin | `src/plugins/pr-review/` |

---

## Issue Categories

The AI detects various issue types:

### Security
- Hardcoded secrets
- SQL injection risks
- XSS vulnerabilities
- Insecure dependencies

### Performance
- N+1 queries
- Memory leaks
- Unnecessary re-renders
- Heavy computations

### Best Practices
- Missing error handling
- Code duplication
- Incomplete types
- Missing tests

### Code Quality
- Complex functions
- Long methods
- Deep nesting
- Poor naming

---

## Troubleshooting

### "Invalid PR URL"

- Ensure URL format: `https://github.com/owner/repo/pull/123`
- Check repository exists
- Verify PR number is correct

### "401 Unauthorized"

- GitHub token may be expired
- Token missing required scopes
- Repository is private and token can't access

### "No issues found"

- PR may be very simple
- AI analysis may have succeeded (no issues = good!)
- Check review summary for details

### Analysis taking too long

- Large PRs take longer
- Check network connectivity
- Consider PR size limits

---

## GitHub Action Integration

For CI/CD integration, add to your workflow:

```yaml
- uses: devflow-ai/action@v1
  with:
    api-key: ${{ secrets.DF_KEY }}
```

---

## Related Documentation

- [Error Log Analysis](ERROR_LOG.md) - Error debugging
- [Environment Setup](../setup/ENVIRONMENT.md) - API configuration
- [API Reference](../architecture/API.md) - Endpoint details
