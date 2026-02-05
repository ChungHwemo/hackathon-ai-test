# JIRA Automation Feature

> Natural language to JIRA tickets with AI-powered breakdown

## Overview

Convert natural language feature requests into structured JIRA tickets using Google Gemini AI.

```
"ユーザー認証機能を追加してください"
        │
        ▼
┌─────────────────────────┐
│ Gemini AI Processing    │
│ - Analyze requirements  │
│ - Break down into tasks │
│ - Generate structure    │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ Generated Tickets       │
│ ├── Story: User Login   │
│ ├── Task: OAuth Setup   │
│ ├── Task: UI Forms      │
│ └── Task: Tests         │
└─────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| Bilingual Support | Japanese and English output |
| Task Breakdown | Automatically split into subtasks |
| Type Detection | Story, Task, Bug, Epic inference |
| Priority Inference | Based on urgency keywords |
| Confluence Integration | Auto-create linked pages |

---

## User Interface

### Input Section

| Element | Description |
|---------|-------------|
| Text Area | Natural language feature request |
| Language Toggle | Switch output language |
| Settings Panel | Scope, type, priority options |

### Output Section

| Element | Description |
|---------|-------------|
| Ticket Cards | Editable draft tickets |
| Preview | Full ticket details |
| Create Button | Submit to JIRA |

---

## Usage

### Step 1: Enter Request

Write your feature request in natural language:

```
ユーザーログイン機能を実装してください。
OAuth 2.0でGoogleログインをサポートし、
セッション管理も含めてください。
```

### Step 2: Configure Settings

Optional settings:
- **Scope**: Components affected
- **Type**: Default ticket type
- **Priority**: Default priority

### Step 3: Review Generated Tickets

AI generates structured tickets:

| Field | Example |
|-------|---------|
| Title | OAuth 2.0 Googleログイン実装 |
| Type | Story |
| Priority | High |
| Description | Detailed requirements... |
| Labels | backend, authentication |

### Step 4: Edit & Create

1. Edit any ticket details
2. Select tickets to create
3. Click "Create in JIRA"
4. View created tickets in JIRA

---

## Bilingual Mode

Trigger bilingual output with keywords:
- `英語でも` / `in English too`
- `日本語と英語` / `Japanese and English`

**Example Output:**

```
Title: ユーザー認証の実装 / Implement User Authentication
Description:
【日本語】
ユーザー認証機能を実装します...

【English】
Implement user authentication feature...
```

---

## API Flow

```
Frontend                    Vite Middleware              External
   │                             │                          │
   │ generateTickets(request)    │                          │
   │─────────────────────────────▶                          │
   │                             │ Gemini AI               │
   │                             │──────────────────────────▶
   │                             │◀──────────────────────────
   │◀─────────────────────────────                          │
   │ TicketDraft[]               │                          │
   │                             │                          │
   │ createTickets(tickets)      │                          │
   │─────────────────────────────▶                          │
   │                             │ JIRA API                │
   │                             │──────────────────────────▶
   │                             │◀──────────────────────────
   │                             │ Confluence API          │
   │                             │──────────────────────────▶
   │                             │◀──────────────────────────
   │◀─────────────────────────────                          │
   │ Created ticket URLs         │                          │
```

---

## Confluence Integration

When enabled, creates a linked Confluence page:

```
JIRA Ticket: PROJ-123
    │
    └── Linked Confluence Page
        ├── Feature Overview
        ├── Requirements
        ├── Technical Details
        └── Related Tickets
```

**Requirements:**
- `VITE_CONFLUENCE_SPACE_ID` must be set
- User must have Confluence permissions

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_JIRA_PROJECT_KEY` | Yes | Target project |
| `VITE_CONFLUENCE_SPACE_ID` | No | For page creation |
| `VITE_GEMINI_API_KEY` | Yes | AI processing |

### Prompt Customization

The AI prompt can be customized in `api.ts`:

```typescript
const SYSTEM_PROMPT = `
You are a JIRA ticket generator.
Given a feature request, generate structured tickets.
...
`
```

---

## File Locations

| Purpose | File |
|---------|------|
| Page Component | `web/src/pages/jira-automation.tsx` |
| API Service | `web/src/services/api.ts` |
| Backend Plugin | `src/plugins/jira-automation/` |
| i18n Keys | `web/src/locales/{ja,en}.json` |

---

## Troubleshooting

### Tickets not generating

1. Check Gemini API key is valid
2. Verify network connectivity
3. Check browser console for errors

### JIRA creation fails

1. Verify JIRA project key exists
2. Check API token permissions
3. Ensure required fields are filled

### Confluence page not created

1. Set `VITE_CONFLUENCE_SPACE_ID`
2. Verify space permissions
3. Check space exists and is accessible

---

## Related Documentation

- [Knowledge Search](KNOWLEDGE_SEARCH.md) - Search JIRA issues
- [Environment Setup](../setup/ENVIRONMENT.md) - API configuration
- [API Reference](../architecture/API.md) - Endpoint details
