# Project-K

> CAINZ Hackathon 2026 - Developer Productivity Platform

AI-powered unified platform integrating Atlassian (JIRA/Confluence), Microsoft Teams, GitHub, and Google Gemini to automate development workflows.

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **JIRA Automation** | Natural language → JIRA tickets with AI breakdown | ✅ Complete |
| **Knowledge Search** | Unified search across Confluence, JIRA, Teams, Web | ✅ Complete |
| **PR Review** | Automated code review with Gemini AI | ✅ Complete |
| **Error Log Analysis** | Error classification and solution suggestions | ✅ Complete |
| **Confluence Integration** | Auto-create pages when creating JIRA tickets | ✅ Complete |

## Quick Start

### Prerequisites

- Node.js 20+ (use `nvm use`)
- npm 10+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hackathon-ai-test

# Install dependencies
npm install
cd web && npm install && cd ..

# Configure environment
cp web/.env.example web/.env
# Edit web/.env with your API keys
```

### Environment Variables

```bash
# Atlassian (Required)
VITE_ATLASSIAN_DOMAIN=your-domain
VITE_ATLASSIAN_EMAIL=your-email@example.com
VITE_ATLASSIAN_API_TOKEN=your-api-token
VITE_JIRA_PROJECT_KEY=YOUR_PROJECT

# Confluence (Optional - for auto page creation)
VITE_CONFLUENCE_SPACE_ID=your-space-id

# GitHub (Required for PR Review)
VITE_GITHUB_TOKEN=ghp_xxxxx

# Google Gemini (Required)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_GEMINI_MODEL=gemini-2.5-flash

# Microsoft Teams (Optional)
VITE_TEAMS_TENANT_ID=your-tenant-id
VITE_TEAMS_CLIENT_ID=your-client-id
VITE_TEAMS_CLIENT_SECRET=your-client-secret
VITE_TEAMS_TEAM_ID=your-team-id
```

### Development

```bash
# Start development server
cd web && npm run dev

# Run tests
npm test

# Build for production
cd web && npm run build
```

Open http://localhost:5173 in your browser.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Project-K Platform                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + TypeScript)                        │
│  ├── Dashboard        - System overview                      │
│  ├── JIRA Automation  - AI ticket generation                 │
│  ├── Knowledge Search - Unified search (4 sources)           │
│  ├── PR Review        - Code review with AI                  │
│  └── Error Log Search - Error analysis                       │
├─────────────────────────────────────────────────────────────┤
│  Vite Middleware API                                         │
│  ├── /api/search     → Confluence + JIRA + Teams             │
│  ├── /api/jira       → Ticket creation + Confluence pages    │
│  ├── /api/pr-review  → GitHub PR + Gemini review             │
│  └── /api/error-log  → Error analysis                        │
├─────────────────────────────────────────────────────────────┤
│  External Services                                           │
│  ├── Atlassian Cloud (JIRA + Confluence)                     │
│  ├── Microsoft Teams (Graph API)                             │
│  ├── GitHub API                                              │
│  └── Google Gemini AI                                        │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
hackathon-ai-test/
├── web/                    # Frontend application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── locales/        # i18n (ja/en)
│   │   └── types/          # TypeScript types
│   └── vite.config.ts      # Vite + API middleware
├── src/                    # Backend library
│   ├── shared/clients/     # Reusable API clients
│   └── plugins/            # Feature modules
├── tests/                  # Test files
├── docs/                   # Documentation
└── package.json
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, Vite 7, TypeScript 5.9 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Testing | Vitest |
| AI | Google Gemini (gemini-2.5-flash) |
| APIs | Atlassian REST, Microsoft Graph, GitHub REST |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flows
- [PRD (日本語)](docs/DevFlow_AI_PRD.md) - Product requirements
- [Design Spec (日本語)](docs/統合プラットフォーム_設計書.md) - Detailed design

## License

Private - CAINZ Hackathon 2026
