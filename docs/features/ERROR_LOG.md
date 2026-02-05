# Error Log Analysis Feature

> AI-powered error classification and solution finding

## Overview

Analyze error logs to classify errors, suggest solutions, and find related JIRA issues.

```
Error Log Input
    │
    ▼
┌─────────────────────────────────────┐
│         Gemini AI Analysis          │
│  ├── Parse error structure          │
│  ├── Classify error type            │
│  ├── Identify root cause            │
│  └── Generate solutions             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│           JIRA Search               │
│  ├── Find similar issues            │
│  ├── Match error patterns           │
│  └── Link related tickets           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│            Results                   │
│  ├── Error Classification           │
│  ├── Root Cause Analysis            │
│  ├── Suggested Solutions            │
│  └── Related JIRA Issues            │
└─────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| Error Classification | Type, category, severity |
| Root Cause Analysis | AI-identified probable cause |
| Solution Suggestions | Actionable fix recommendations |
| Related Issues | JIRA tickets with similar errors |

---

## User Interface

### Input Section

| Element | Description |
|---------|-------------|
| Text Area | Paste error log/stack trace |
| Analyze Button | Trigger analysis |
| Clear Button | Reset form |

### Results Section

| Element | Description |
|---------|-------------|
| Classification Card | Error type and severity |
| Analysis Card | Root cause explanation |
| Solutions List | Ordered fix suggestions |
| Related Issues | JIRA ticket links |

---

## Usage

### Step 1: Paste Error Log

Paste your error log or stack trace:

```
TypeError: Cannot read property 'map' of undefined
    at UserList.render (UserList.tsx:25:18)
    at renderWithHooks (react-dom.development.js:14985:18)
    at mountIndeterminateComponent (react-dom.development.js:17811:13)
    at beginWork (react-dom.development.js:19049:16)
```

### Step 2: Analyze

Click "Analyze" to process the error.

### Step 3: Review Results

**Classification:**
| Field | Value |
|-------|-------|
| Type | TypeError |
| Category | Null Reference |
| Severity | Medium |

**Analysis:**
> The error occurs when attempting to call `.map()` on an undefined value. The `users` variable is undefined when the component renders, likely due to async data loading.

**Solutions:**
1. Add null check: `users && users.map(...)`
2. Use optional chaining: `users?.map(...)`
3. Initialize with empty array: `useState<User[]>([])`
4. Add loading state before data arrives

**Related Issues:**
- [PROJ-100](link) - Fix null pointer in UserList
- [PROJ-98](link) - UserList crashes on empty data

---

## Error Classification

### Error Types

| Type | Examples |
|------|----------|
| TypeError | Null reference, undefined property |
| SyntaxError | Parse errors, invalid JSON |
| ReferenceError | Undefined variables |
| NetworkError | API failures, timeouts |
| ValidationError | Input validation failures |

### Categories

| Category | Description |
|----------|-------------|
| Null Reference | Accessing undefined/null |
| Type Mismatch | Wrong data type |
| Network | Connection issues |
| Authentication | Auth failures |
| Validation | Input errors |
| Configuration | Config issues |

### Severity Levels

| Severity | Impact |
|----------|--------|
| Critical | Application crash |
| High | Feature broken |
| Medium | Degraded functionality |
| Low | Minor issue |

---

## API Endpoint

### POST /api/error-log

**Request:**
```json
{
  "errorLog": "TypeError: Cannot read property 'map' of undefined\n    at UserList.render..."
}
```

**Response:**
```json
{
  "classification": {
    "type": "TypeError",
    "category": "null-reference",
    "severity": "medium"
  },
  "analysis": "The error occurs when...",
  "suggestions": [
    "Add null check before mapping",
    "Use optional chaining",
    "Initialize with empty array"
  ],
  "relatedIssues": [
    {
      "key": "PROJ-100",
      "title": "Fix null pointer in UserList",
      "url": "https://..."
    }
  ]
}
```

---

## Configuration

### Required

| Variable | Purpose |
|----------|---------|
| `VITE_GEMINI_API_KEY` | AI analysis |
| `VITE_ATLASSIAN_*` | JIRA search |

---

## File Locations

| Purpose | File |
|---------|------|
| Page Component | `web/src/pages/error-log-search.tsx` |
| Backend Plugin | `src/plugins/error-log-search/` |
| Classifier | `src/plugins/error-log-search/classifier.ts` |
| Searcher | `src/plugins/error-log-search/searcher.ts` |

---

## Supported Log Formats

### JavaScript/TypeScript
```
TypeError: Cannot read property 'x' of undefined
    at Object.<anonymous> (file.ts:10:5)
```

### Python
```
Traceback (most recent call last):
  File "app.py", line 42, in <module>
    result = process(data)
TypeError: 'NoneType' object is not subscriptable
```

### Java
```
java.lang.NullPointerException
    at com.example.App.main(App.java:15)
```

### Generic
```
[ERROR] 2026-02-05 10:30:00 - Connection refused
```

---

## Implementation Status

| Component | Status |
|-----------|--------|
| UI Page | ✅ Complete |
| Backend Plugin | ✅ Complete |
| API Endpoint | ⚠️ Partial |
| JIRA Integration | ⚠️ Partial |

**Note:** Currently uses mock data. Full API integration planned.

---

## Troubleshooting

### No classification returned

- Error format may not be recognized
- Try including full stack trace
- Check Gemini API key

### No related issues found

- JIRA project may have no similar issues
- Try broader error terms
- Check JIRA API connection

### Analysis taking too long

- Long error logs take more time
- Consider trimming to relevant portion
- Check network connectivity

---

## Related Documentation

- [PR Review](PR_REVIEW.md) - Code review with AI
- [Knowledge Search](KNOWLEDGE_SEARCH.md) - Search for solutions
- [API Reference](../architecture/API.md) - Endpoint details
