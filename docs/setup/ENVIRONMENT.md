# Environment Variables Reference

> Complete guide to configuring Project-K integrations

All environment variables are prefixed with `VITE_` for Vite bundler access.

---

## ⚠️ Security Guidelines

### Critical Rules

1. **NEVER commit `.env` files** - They are gitignored for a reason
2. **NEVER share API tokens** in chat, email, or documentation
3. **NEVER hardcode secrets** in source code files
4. **Rotate tokens regularly** - Especially if accidentally exposed
5. **Use minimal permissions** - Only grant required scopes

### If Credentials Are Exposed

1. **Immediately revoke** the exposed token/key
2. **Generate new credentials** from the respective service
3. **Update your `.env`** with new values
4. **Check git history** - Use `git filter-branch` or BFG to remove if committed

### Token Revocation Links

| Service | Revoke URL |
|---------|------------|
| Atlassian | https://id.atlassian.com/manage-profile/security/api-tokens |
| GitHub | https://github.com/settings/tokens |
| Google AI | https://aistudio.google.com/app/apikey |
| Azure/Teams | https://portal.azure.com/ → App registrations |

---

## Quick Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ATLASSIAN_DOMAIN` | Yes | Atlassian Cloud domain |
| `VITE_ATLASSIAN_EMAIL` | Yes | Atlassian account email |
| `VITE_ATLASSIAN_API_TOKEN` | Yes | Atlassian API token |
| `VITE_JIRA_PROJECT_KEY` | Yes | Target JIRA project |
| `VITE_CONFLUENCE_SPACE_ID` | No | Confluence space for auto-create |
| `VITE_GITHUB_TOKEN` | Yes* | GitHub personal access token |
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key |
| `VITE_GEMINI_MODEL` | Yes | Gemini model name |
| `VITE_TEAMS_*` | No | Microsoft Teams integration |
| `VITE_SERPER_API_KEY` | No | Serper web search API |

*Required for PR Review feature

---

## Atlassian Configuration

### Required Variables

```bash
# Your Atlassian Cloud domain
# Example: if URL is https://cainz.atlassian.net → use "cainz"
VITE_ATLASSIAN_DOMAIN=your-domain

# Email associated with your Atlassian account
VITE_ATLASSIAN_EMAIL=your-email@example.com

# API token (NOT password)
VITE_ATLASSIAN_API_TOKEN=your-api-token

# JIRA project key for ticket creation
# Example: KWA, PROJ, DEV
VITE_JIRA_PROJECT_KEY=KWA
```

### How to Get API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Enter label (e.g., "Project-K")
4. Copy the generated token

### Optional: Confluence Space

```bash
# Required for auto-creating Confluence pages with JIRA tickets
# Get from Confluence space settings → Space details → Space ID
VITE_CONFLUENCE_SPACE_ID=your-space-id
```

---

## Google Gemini Configuration

### Required Variables

```bash
# API key from Google AI Studio
VITE_GEMINI_API_KEY=your-gemini-key

# Model name (recommended: gemini-2.5-flash for speed)
VITE_GEMINI_MODEL=gemini-2.5-flash
```

### How to Get API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Select or create a Google Cloud project
4. Copy the generated key

### Available Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `gemini-2.5-flash` | Fast | Good | Default, most tasks |
| `gemini-2.5-pro` | Slow | Best | Complex analysis |
| `gemini-2.0-flash` | Fastest | Basic | Simple tasks |

---

## GitHub Configuration

### Required for PR Review

```bash
# Personal access token with repo scope
VITE_GITHUB_TOKEN=ghp_xxxxx
```

### How to Get Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org membership) - if needed
4. Copy the generated token

### Required Permissions

| Scope | Purpose |
|-------|---------|
| `repo` | Access private repos, read PR data |
| `public_repo` | Access public repos only (alternative) |

---

## Microsoft Teams Configuration (Optional)

### Azure AD App Registration Required

```bash
# Azure AD tenant ID
VITE_TEAMS_TENANT_ID=your-tenant-id

# Application (client) ID
VITE_TEAMS_CLIENT_ID=your-client-id

# Client secret
VITE_TEAMS_CLIENT_SECRET=your-client-secret

# Target team ID for searching
VITE_TEAMS_TEAM_ID=your-team-id
```

### How to Configure

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Create new registration
3. Add API permissions:
   - `ChannelMessage.Read.All`
   - `Team.ReadBasic.All`
4. Create client secret
5. Get Team ID from Teams URL or Graph Explorer

**Note**: This requires Azure AD admin access.

---

## Web Search Configuration (Optional)

### Serper API (Google Search)

```bash
# Serper.dev API key
VITE_SERPER_API_KEY=your-serper-key
```

Get key at https://serper.dev/

---

## Current Configuration Status

Check your current status in the Dashboard at http://localhost:5173/

| Integration | Status | Indicator |
|-------------|--------|-----------|
| Atlassian | Configured | Green checkmark |
| Gemini | Configured | Features work |
| GitHub | Configured | PR Review works |
| Teams | Not configured | Warning card |
| Confluence Space | Not set | Warning card |

---

## Example .env File

```bash
# ========================================
# Project-K Environment Configuration
# ========================================

# --- Atlassian (Required) ---
VITE_ATLASSIAN_DOMAIN=cainz
VITE_ATLASSIAN_EMAIL=developer@cainz.co.jp
VITE_ATLASSIAN_API_TOKEN=ATATT3xFf...
VITE_JIRA_PROJECT_KEY=KWA

# --- Confluence (Optional) ---
VITE_CONFLUENCE_SPACE_ID=123456

# --- GitHub (Required for PR Review) ---
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# --- Google Gemini (Required) ---
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GEMINI_MODEL=gemini-2.5-flash

# --- Microsoft Teams (Optional) ---
# VITE_TEAMS_TENANT_ID=
# VITE_TEAMS_CLIENT_ID=
# VITE_TEAMS_CLIENT_SECRET=
# VITE_TEAMS_TEAM_ID=

# --- Web Search (Optional) ---
# VITE_SERPER_API_KEY=
```

---

## Troubleshooting

### "401 Unauthorized" from Atlassian

- Verify API token is correct (not password)
- Check email matches the token owner
- Ensure domain is just the subdomain (not full URL)

### "403 Forbidden" from GitHub

- Token may have expired
- Check required scopes are enabled
- Verify repo access permissions

### Gemini errors

- Check API key is valid
- Verify model name is correct
- Check quota limits at https://aistudio.google.com/

---

## Related Documentation

- [Quick Start](QUICKSTART.md) - Basic installation
- [API Reference](../architecture/API.md) - Endpoint details
- [Current Status](../status/CURRENT.md) - What's working
