# Project Handoff

## Current Status
- Version: 1.0.0
- Build: ✅ passing (98 tests)
- Last Updated: 2026-02-06

## Recent Work
### [2026-02-06] Deprecated JIRA API Fix & Dashboard Compact Layout
- **Fixed Deprecated JIRA API**: Migrated from `/rest/api/3/search?jql=...` to new POST `/rest/api/3/search/jql`
  - Line 179: Knowledge Search (`/api/search` endpoint)
  - Line 396: Error Log Analysis (`/api/error-log` endpoint)
- **Dashboard Ultra-Compact Layout**: Optimized for 1800x1000px viewport
  - Stats: 8-column grid on large screens (`lg:grid-cols-8`)
  - Feature cards: Horizontal layout (icon left, text center, button right)
  - External links: Compact 3-column grid
  - Reduced all spacing (`space-y-4`, `gap-3`, smaller padding)
  - Smaller typography and icons throughout

### [2026-02-06] Demo Materials & Dashboard Optimization
- **Confluence Pages Created** (under ハッカソンAチーム):
  - [Project-K - AI Developer Productivity Platform](https://cainz.atlassian.net/wiki/spaces/G2/pages/4552491060)
  - [Demo Script & Presentation Guide](https://cainz.atlassian.net/wiki/spaces/G2/pages/4552228921)
  - [Screenshots Gallery](https://cainz.atlassian.net/wiki/spaces/G2/pages/4552687672)
- **Demo Materials Created**:
  - `docs/DEMO_SCRIPT.md` - Korean/English presentation script
  - `docs/PRESENTATION_OUTLINE.md` - Slide structure
  - `docs/DEMO_SAMPLE_DATA.md` - Sample inputs for demo

### Changed Files
- `web/vite.config.ts` - Fixed deprecated JIRA API (lines 179, 396)
- `web/src/pages/dashboard.tsx` - Ultra-compact responsive layout
- `docs/DEMO_SCRIPT.md` - New demo script
- `docs/PRESENTATION_OUTLINE.md` - New slide outline
- `docs/DEMO_SAMPLE_DATA.md` - New sample data

## Known Issues
- [ ] Teams API requires Azure AD app registration (user lacks portal access)

## Next TODO
- [ ] Take new dashboard screenshot (after responsive update)
- [ ] Prepare hackathon demo/presentation
- [ ] Azure AD app registration for Teams (when user has portal access)

## Quick Reference
- Test: `npm test` (98 tests passing)
- Dev: `cd web && npm run dev`
- Build: `cd web && npm run build`
- Server: http://localhost:5173

## Confluence Pages
| Page | URL |
|------|-----|
| Main Docs | https://cainz.atlassian.net/wiki/spaces/G2/pages/4552491060 |
| Demo Script | https://cainz.atlassian.net/wiki/spaces/G2/pages/4552228921 |
| Screenshots | https://cainz.atlassian.net/wiki/spaces/G2/pages/4552687672 |
| Parent | https://cainz.atlassian.net/wiki/spaces/G2/pages/4547837967 (ハッカソンAチーム) |

## Features Summary
| Feature | Status |
|---------|--------|
| Dashboard (responsive) | ✅ |
| JIRA Automation | ✅ |
| Knowledge Search | ✅ |
| PR Review | ✅ |
| Error Log Analysis | ✅ |
| Confluence Auto-Create | ✅ |
| i18n (ja/en) | ✅ |

## Environment Variables Status
### ✅ Configured
- VITE_ATLASSIAN_DOMAIN, EMAIL, API_TOKEN
- VITE_JIRA_PROJECT_KEY=KWA
- VITE_CONFLUENCE_SPACE_KEY=G2
- VITE_CONFLUENCE_SPACE_ID=2653685546
- VITE_CONFLUENCE_PARENT_PAGE_ID=4547837967
- VITE_GITHUB_TOKEN
- VITE_GEMINI_API_KEY
- VITE_GEMINI_MODEL=gemini-2.5-flash

### ❌ Not Configured
- VITE_TEAMS_TENANT_ID, CLIENT_ID, CLIENT_SECRET, TEAM_ID
