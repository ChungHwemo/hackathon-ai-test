# Quick Start Guide

> Get Project-K running in 5 minutes

## Prerequisites

- **Node.js 20+** (use `nvm use` if you have nvm)
- **npm 10+**
- API keys for:
  - Atlassian Cloud (JIRA/Confluence)
  - Google Gemini
  - GitHub (for PR Review)

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/ChungHwemo/hackathon-ai-test.git
cd hackathon-ai-test
```

### 2. Install Dependencies

```bash
# Root dependencies (backend library)
npm install

# Frontend dependencies
cd web && npm install && cd ..
```

### 3. Configure Environment

```bash
# Copy example env file
cp web/.env.example web/.env

# Edit with your API keys
vim web/.env  # or use any editor
```

Required variables (see [ENVIRONMENT.md](ENVIRONMENT.md) for details):

```bash
# Atlassian (Required)
VITE_ATLASSIAN_DOMAIN=your-domain
VITE_ATLASSIAN_EMAIL=your-email@example.com
VITE_ATLASSIAN_API_TOKEN=your-api-token
VITE_JIRA_PROJECT_KEY=YOUR_PROJECT

# Google Gemini (Required)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_GEMINI_MODEL=gemini-2.5-flash

# GitHub (Required for PR Review)
VITE_GITHUB_TOKEN=ghp_xxxxx
```

### 4. Start Development Server

```bash
cd web && npm run dev
```

Open http://localhost:5173 in your browser.

---

## Verify Installation

### Run Tests

```bash
npm test
```

Expected output:
```
 ✓ tests/... (96 tests) passed
```

### Check Features

| Feature | URL | Expected |
|---------|-----|----------|
| Dashboard | http://localhost:5173/ | Shows config status |
| JIRA Automation | http://localhost:5173/jira-automation | Text input works |
| Knowledge Search | http://localhost:5173/knowledge-search | Search UI loads |
| PR Review | http://localhost:5173/pr-review | PR URL input works |

---

## Troubleshooting

### Port 5173 in use

```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
cd web && npm run dev -- --port 3000
```

### API errors

1. Check `.env` file exists in `web/` directory
2. Verify API keys are correct
3. Check network connectivity to Atlassian/GitHub

### Node version issues

```bash
# Use correct Node version
nvm use 20
# or
nvm install 20
```

---

## Next Steps

- [Environment Variables](ENVIRONMENT.md) - Configure all integrations
- [Architecture Overview](../architecture/OVERVIEW.md) - Understand the system
- [Current Status](../status/CURRENT.md) - See what's working
