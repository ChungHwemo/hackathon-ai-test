import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const escapeSearchQuery = (query: string): string => {
    if (!query) return ''
    return query
      .replace(/\\/g, '')
      .replace(/"/g, '')
  }

  const buildConfluenceCQL = (query: string, spaceKey?: string): string => {
    const escaped = escapeSearchQuery(query)
    const conditions: string[] = []
    if (spaceKey) conditions.push(`space = "${spaceKey}"`)
    conditions.push(`(title ~ "${escaped}" OR text ~ "${escaped}")`)
    return conditions.join(' AND ') + ' ORDER BY lastModified DESC'
  }

  const buildJiraJQL = (query: string, projectKey?: string): string => {
    const escaped = escapeSearchQuery(query)
    const conditions: string[] = []
    if (projectKey) conditions.push(`project = "${projectKey}"`)
    conditions.push(`(summary ~ "${escaped}" OR description ~ "${escaped}")`)
    return conditions.join(' AND ') + ' ORDER BY updated DESC'
  }
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/dashboard/stats', async (req, res, next) => {
            if (req.method !== 'GET') return next()

            const domain = env.VITE_ATLASSIAN_DOMAIN
            const email = env.VITE_ATLASSIAN_EMAIL
            const apiToken = env.VITE_ATLASSIAN_API_TOKEN
            const projectKey = env.VITE_JIRA_PROJECT_KEY || 'KWA'
            const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

            try {
              const today = new Date()
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
              const formatDate = (d: Date) => d.toISOString().split('T')[0]

              const queries = {
                ticketsThisWeek: `project = "${projectKey}" AND created >= "${formatDate(weekAgo)}"`,
                ticketsLastWeek: `project = "${projectKey}" AND created >= "${formatDate(twoWeeksAgo)}" AND created < "${formatDate(weekAgo)}"`,
                openIssues: `project = "${projectKey}" AND status != Done AND status != Closed`,
                resolvedThisWeek: `project = "${projectKey}" AND status IN (Done, Closed) AND resolved >= "${formatDate(weekAgo)}"`,
                resolvedLastWeek: `project = "${projectKey}" AND status IN (Done, Closed) AND resolved >= "${formatDate(twoWeeksAgo)}" AND resolved < "${formatDate(weekAgo)}"`,
                inProgress: `project = "${projectKey}" AND status = "In Progress"`,
                highPriority: `project = "${projectKey}" AND priority IN (Highest, High) AND status NOT IN (Done, Closed)`,
                bugs: `project = "${projectKey}" AND issuetype = Bug AND status NOT IN (Done, Closed)`,
                dueToday: `project = "${projectKey}" AND duedate = "${formatDate(today)}" AND status NOT IN (Done, Closed)`,
                overdue: `project = "${projectKey}" AND duedate < "${formatDate(today)}" AND status NOT IN (Done, Closed)`,
                updatedToday: `project = "${projectKey}" AND updated >= "${formatDate(today)}"`,
              }

              const fetchCount = async (jql: string): Promise<number> => {
                const url = `https://${domain}.atlassian.net/rest/api/3/search/jql`
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                  },
                  body: JSON.stringify({ jql, maxResults: 1, fields: ['summary'] })
                })
                if (!response.ok) return 0
                const data = await response.json() as { issues: unknown[], isLast: boolean, nextPageToken?: string }
                if (data.isLast) {
                  return data.issues.length
                }
                const countUrl = `https://${domain}.atlassian.net/rest/api/3/search/jql`
                const countResponse = await fetch(countUrl, {
                  method: 'POST',
                  headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                  },
                  body: JSON.stringify({ jql, maxResults: 5000, fields: ['key'] })
                })
                if (!countResponse.ok) return data.issues.length
                const countData = await countResponse.json() as { issues: unknown[] }
                return countData.issues.length
              }

              const [
                ticketsThisWeek, ticketsLastWeek, openIssues, resolvedThisWeek, resolvedLastWeek,
                inProgress, highPriority, bugs, dueToday, overdue, updatedToday
              ] = await Promise.all([
                fetchCount(queries.ticketsThisWeek),
                fetchCount(queries.ticketsLastWeek),
                fetchCount(queries.openIssues),
                fetchCount(queries.resolvedThisWeek),
                fetchCount(queries.resolvedLastWeek),
                fetchCount(queries.inProgress),
                fetchCount(queries.highPriority),
                fetchCount(queries.bugs),
                fetchCount(queries.dueToday),
                fetchCount(queries.overdue),
                fetchCount(queries.updatedToday),
              ])

              const calcChange = (current: number, previous: number): string => {
                if (previous === 0) return current > 0 ? '+100%' : '0%'
                const change = ((current - previous) / previous) * 100
                return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                ticketsCreated: { value: ticketsThisWeek, change: calcChange(ticketsThisWeek, ticketsLastWeek) },
                openIssues: { value: openIssues, change: '' },
                resolvedIssues: { value: resolvedThisWeek, change: calcChange(resolvedThisWeek, resolvedLastWeek) },
                inProgress: { value: inProgress, change: '' },
                highPriority: { value: highPriority, change: '' },
                bugs: { value: bugs, change: '' },
                dueToday: { value: dueToday, change: '' },
                overdue: { value: overdue, change: '' },
                updatedToday: { value: updatedToday, change: '' },
                projectKey,
                lastUpdated: new Date().toISOString(),
              }))
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch stats' }))
            }
          })

          server.middlewares.use('/api/dashboard/tasks', async (req, res, next) => {
            if (req.method !== 'GET') return next()

            const domain = env.VITE_ATLASSIAN_DOMAIN
            const email = env.VITE_ATLASSIAN_EMAIL
            const apiToken = env.VITE_ATLASSIAN_API_TOKEN
            const projectKey = env.VITE_JIRA_PROJECT_KEY || 'KWA'

            if (!domain || !email || !apiToken) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Atlassian credentials not configured' }))
              return
            }

            const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`
            const today = new Date()
            const formatDate = (d: Date) => d.toISOString().split('T')[0]

            interface JiraIssue {
              key: string
              fields: {
                summary: string
                status: { name: string }
                priority: { name: string }
                assignee: { displayName: string; avatarUrls: { '48x48': string } } | null
                duedate: string | null
                issuetype: { name: string }
              }
            }

            const fetchTasks = async (jql: string, maxResults = 5): Promise<JiraIssue[]> => {
              const url = `https://${domain}.atlassian.net/rest/api/3/search/jql`
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  Authorization: authHeader,
                  'Content-Type': 'application/json',
                  Accept: 'application/json'
                },
                body: JSON.stringify({
                  jql,
                  maxResults,
                  fields: ['summary', 'status', 'priority', 'assignee', 'duedate', 'issuetype']
                })
              })
              if (!response.ok) return []
              const data = await response.json() as { issues: JiraIssue[] }
              return data.issues || []
            }

            const mapTask = (issue: JiraIssue) => ({
              key: issue.key,
              summary: issue.fields.summary,
              status: issue.fields.status?.name || 'Unknown',
              priority: issue.fields.priority?.name || 'Medium',
              assignee: issue.fields.assignee ? {
                displayName: issue.fields.assignee.displayName,
                avatarUrl: issue.fields.assignee.avatarUrls?.['48x48'] || ''
              } : null,
              dueDate: issue.fields.duedate,
              issueType: issue.fields.issuetype?.name || 'Task',
              url: `https://${domain}.atlassian.net/browse/${issue.key}`
            })

            try {
              const queries = {
                inProgress: `project = "${projectKey}" AND status = "In Progress" ORDER BY updated DESC`,
                todo: `project = "${projectKey}" AND status = "To Do" ORDER BY priority DESC, created DESC`,
                highPriority: `project = "${projectKey}" AND priority IN (Highest, High) AND status NOT IN (Done, Closed) ORDER BY priority DESC`,
                dueOrOverdue: `project = "${projectKey}" AND (duedate = "${formatDate(today)}" OR duedate < "${formatDate(today)}") AND status NOT IN (Done, Closed) ORDER BY duedate ASC`
              }

              const [inProgressIssues, todoIssues, highPriorityIssues, dueOrOverdueIssues] = await Promise.all([
                fetchTasks(queries.inProgress, 5),
                fetchTasks(queries.todo, 5),
                fetchTasks(queries.highPriority, 5),
                fetchTasks(queries.dueOrOverdue, 5)
              ])

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                inProgress: inProgressIssues.map(mapTask),
                todo: todoIssues.map(mapTask),
                highPriority: highPriorityIssues.map(mapTask),
                dueOrOverdue: dueOrOverdueIssues.map(mapTask),
                lastUpdated: new Date().toISOString()
              }))
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' }))
            }
          })

          server.middlewares.use('/api/search', async (req, res, next) => {
            if (req.method !== 'POST') return next()

            const domain = env.VITE_ATLASSIAN_DOMAIN
            const email = env.VITE_ATLASSIAN_EMAIL
            const apiToken = env.VITE_ATLASSIAN_API_TOKEN
            const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const { query, sources } = JSON.parse(body) as { query: string; sources: string[] }
                const results: Array<{ id: string; title: string; source: string; snippet: string; url: string; relevance: number; metadata?: Record<string, string> }> = []

                if (sources.includes('confluence')) {
                  const cql = buildConfluenceCQL(query)
                  const confluenceUrl = `https://${domain}.atlassian.net/wiki/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=10&excerpt=highlight`
                  const cfRes = await fetch(confluenceUrl, { headers: { Authorization: authHeader, Accept: 'application/json' } })
                  if (cfRes.ok) {
                    const cfData = await cfRes.json() as { results: Array<{ id: string; title: string; excerpt?: string; _links: { webui: string } }> }
                    cfData.results.forEach((r, i) => results.push({
                      id: `cf-${r.id}`,
                      title: r.title,
                      source: 'confluence',
                      snippet: r.excerpt?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
                      url: `https://${domain}.atlassian.net/wiki${r._links.webui}`,
                      relevance: 90 - i * 5,
                      metadata: { pageId: r.id }
                    }))
                  }
                }

                if (sources.includes('jira')) {
                  const projectKey = env.VITE_JIRA_PROJECT_KEY || undefined
                  const jql = buildJiraJQL(query, projectKey)
                  const jiraUrl = `https://${domain}.atlassian.net/rest/api/3/search/jql`
                  const jrRes = await fetch(jiraUrl, {
                    method: 'POST',
                    headers: {
                      Authorization: authHeader,
                      'Content-Type': 'application/json',
                      Accept: 'application/json'
                    },
                    body: JSON.stringify({
                      jql,
                      maxResults: 10,
                      fields: ['summary', 'description', 'updated', 'status']
                    })
                  })
                  if (jrRes.ok) {
                    const jrData = await jrRes.json() as { issues: Array<{ id: string; key: string; fields: { summary: string; description?: { content?: Array<{ content?: Array<{ text?: string }> }> }; updated: string } }> }
                    jrData.issues.forEach((issue, i) => {
                      const descText = issue.fields.description?.content?.[0]?.content?.[0]?.text || ''
                      results.push({
                        id: `jr-${issue.id}`,
                        title: `${issue.key}: ${issue.fields.summary}`,
                        source: 'jira',
                        snippet: descText.substring(0, 200),
                        url: `https://${domain}.atlassian.net/browse/${issue.key}`,
                        relevance: 85 - i * 5,
                        metadata: { issueKey: issue.key, updatedAt: issue.fields.updated }
                      })
                    })
                  }
                }

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ results, total: results.length }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Search failed' }))
              }
            })
          })

          // PR Review API
          server.middlewares.use('/api/pr-review', async (req, res, next) => {
            if (req.method !== 'POST') return next()

            const githubToken = env.VITE_GITHUB_TOKEN
            const geminiApiKey = env.VITE_GEMINI_API_KEY
            const geminiModel = env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const { prUrl } = JSON.parse(body) as { prUrl: string }
                
                // Parse PR URL: https://github.com/owner/repo/pull/123
                const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
                if (!match) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Invalid PR URL format' }))
                  return
                }
                const [, owner, repo, prNumber] = match

                // Fetch PR info
                const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })
                const prData = await prResponse.json() as { title: string; body: string; additions: number; deletions: number; changed_files: number }

                // Fetch PR diff
                const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3.diff',
                  },
                })
                const diff = await diffResponse.text()

                // Fetch PR files
                const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                  },
                })
                const files = await filesResponse.json() as Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>

                // Call Gemini for review
                const reviewPrompt = `Review this code diff and provide feedback in JSON format:
{
  "summary": "Overall review summary",
  "issues": [{"path": "file.ts", "line": 1, "message": "Issue description", "severity": "error|warning|info"}],
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "recommendation": "APPROVE|REQUEST_CHANGES|COMMENT",
  "complexityScore": 1-10
}

Focus on:
1. Security vulnerabilities
2. Performance issues
3. Code complexity
4. Best practices violations
5. Potential bugs

Diff (truncated to first 15000 chars):
${diff.substring(0, 15000)}`

                const geminiResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: reviewPrompt }] }],
                    }),
                  }
                )
                const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
                const reviewText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

                // Parse Gemini response
                const jsonMatch = reviewText.match(/\{[\s\S]*\}/)
                let review = {
                  summary: 'Unable to parse review',
                  issues: [] as Array<{ path: string; line: number; message: string; severity: string }>,
                  suggestions: [] as string[],
                  recommendation: 'COMMENT',
                  complexityScore: 5,
                }
                if (jsonMatch) {
                  try {
                    review = JSON.parse(jsonMatch[0])
                  } catch { /* keep default */ }
                }

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  pr: {
                    title: prData.title,
                    body: prData.body,
                    additions: prData.additions,
                    deletions: prData.deletions,
                    filesChanged: prData.changed_files,
                  },
                  files: files.map(f => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions })),
                  review,
                }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'PR review failed' }))
              }
            })
          })

          // Error Log Analysis API
          server.middlewares.use('/api/error-log', async (req, res, next) => {
            if (req.method !== 'POST') return next()

            const domain = env.VITE_ATLASSIAN_DOMAIN
            const email = env.VITE_ATLASSIAN_EMAIL
            const apiToken = env.VITE_ATLASSIAN_API_TOKEN
            const geminiApiKey = env.VITE_GEMINI_API_KEY
            const geminiModel = env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'
            const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const { errorLog } = JSON.parse(body) as { errorLog: string }

                // Call Gemini to analyze error
                const analysisPrompt = `Analyze this error log and provide diagnosis in JSON format:
{
  "classification": {
    "type": "ErrorType (e.g., NullPointerException, ConnectionError)",
    "category": "Category (e.g., Runtime Error, Network Error)",
    "severity": "high|medium|low"
  },
  "rootCause": "Explanation of probable root cause",
  "solutions": [
    {
      "title": "Solution title",
      "description": "Solution description",
      "code": "Example code if applicable"
    }
  ],
  "searchKeywords": ["keyword1", "keyword2"]
}

Error Log:
${errorLog.substring(0, 5000)}`

                const geminiResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: analysisPrompt }] }],
                    }),
                  }
                )
                const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
                const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

                // Parse Gemini response
                const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
                let analysis = {
                  classification: { type: 'Unknown', category: 'Unknown', severity: 'medium' as const },
                  rootCause: 'Unable to analyze',
                  solutions: [] as Array<{ title: string; description: string; code?: string }>,
                  searchKeywords: [] as string[],
                }
                if (jsonMatch) {
                  try {
                    analysis = JSON.parse(jsonMatch[0])
                  } catch { /* keep default */ }
                }

                // Search JIRA for similar issues
                const keywords = analysis.searchKeywords.slice(0, 3).join(' ')
                const projectKey = env.VITE_JIRA_PROJECT_KEY || undefined
                const jql = buildJiraJQL(keywords, projectKey)
                const jiraUrl = `https://${domain}.atlassian.net/rest/api/3/search/jql`
                
                let relatedIssues: Array<{ key: string; title: string; status: string; similarity: number }> = []
                try {
                  const jiraRes = await fetch(jiraUrl, {
                    method: 'POST',
                    headers: {
                      Authorization: authHeader,
                      'Content-Type': 'application/json',
                      Accept: 'application/json'
                    },
                    body: JSON.stringify({
                      jql,
                      maxResults: 5,
                      fields: ['summary', 'status', 'updated']
                    })
                  })
                  if (jiraRes.ok) {
                    const jiraData = await jiraRes.json() as { issues: Array<{ key: string; fields: { summary: string; status: { name: string } } }> }
                    relatedIssues = jiraData.issues.map((issue, i) => ({
                      key: issue.key,
                      title: issue.fields.summary,
                      status: issue.fields.status.name,
                      similarity: 95 - i * 7,
                    }))
                  }
                } catch { /* no JIRA results */ }

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  classification: analysis.classification,
                  rootCause: analysis.rootCause,
                  solutions: analysis.solutions,
                  relatedIssues,
                }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Error analysis failed' }))
              }
            })
          })

          server.middlewares.use('/api/jira', async (req, res, next) => {
            if (req.method !== 'POST') {
              return next()
            }

            const domain = env.VITE_ATLASSIAN_DOMAIN
            const email = env.VITE_ATLASSIAN_EMAIL
            const apiToken = env.VITE_ATLASSIAN_API_TOKEN
            const confluenceSpaceId = env.VITE_CONFLUENCE_SPACE_ID
            const confluenceParentPageId = env.VITE_CONFLUENCE_PARENT_PAGE_ID

            let body = ''
            req.on('data', (chunk) => {
              body += chunk.toString()
            })
            req.on('end', async () => {
              try {
                const { tickets, createConfluencePages = false } = JSON.parse(body)
                const projectKey = env.VITE_JIRA_PROJECT_KEY || 'KWA'
                const baseUrl = `https://${domain}.atlassian.net/rest/api/3`
                const confluenceUrl = `https://${domain}.atlassian.net/wiki/api/v2/pages`
                const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

                const createdTickets: Array<{ draftId: string; jiraKey: string; url: string; confluenceUrl?: string }> = []
                const errors: Array<{ draftId: string; error: string }> = []

                for (const ticket of tickets) {
                  try {
                    const issueType = ticket.issueType === 'Sub-task' ? 'Task' : ticket.issueType
                    const issueBody = {
                      fields: {
                        project: { key: projectKey },
                        issuetype: { name: issueType },
                        summary: ticket.summary,
                        description: {
                          type: 'doc',
                          version: 1,
                          content: [{ type: 'paragraph', content: [{ type: 'text', text: `${ticket.description}\n\n---\n*Auto-generated by Project-K*\n*Confidence: ${ticket.confidenceScore}%*` }] }],
                        },
                        priority: { name: ticket.priority },
                        labels: ticket.labels,
                      },
                    }

                    const response = await fetch(`${baseUrl}/issue`, {
                      method: 'POST',
                      headers: {
                        Authorization: authHeader,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(issueBody),
                    })

                    if (!response.ok) {
                      const errorData = await response.json() as { errorMessages?: string[]; errors?: Record<string, string> }
                      const errorMessage = errorData.errorMessages?.join(', ') || Object.values(errorData.errors || {}).join(', ') || 'Unknown error'
                      throw new Error(errorMessage)
                    }

                    const created = await response.json() as { key: string }
                    const ticketResult: { draftId: string; jiraKey: string; url: string; confluenceUrl?: string } = {
                      draftId: ticket.draftId,
                      jiraKey: created.key,
                      url: `https://${domain}.atlassian.net/browse/${created.key}`,
                    }

                    // Create Confluence page if enabled and spaceId is configured
                    if (createConfluencePages && confluenceSpaceId) {
                      try {
                        const pageTitle = `[${created.key}] ${ticket.summary}`
                        const pageContent = `<h2>Overview</h2><p>${ticket.description}</p><h2>JIRA Ticket</h2><p><a href="${ticketResult.url}">${created.key}</a></p><h2>Acceptance Criteria</h2><ul><li>TBD</li></ul><h2>Technical Notes</h2><p>Auto-generated by Project-K</p>`
                        
                        const confluenceBody: { spaceId: string; title: string; body: { representation: string; value: string }; parentId?: string } = {
                            spaceId: confluenceSpaceId,
                            title: pageTitle,
                            body: { representation: 'storage', value: pageContent },
                          }
                          
                          // If parent page ID is configured, create as child page
                          if (confluenceParentPageId) {
                            confluenceBody.parentId = confluenceParentPageId
                          }
                        
                        const confluenceResponse = await fetch(confluenceUrl, {
                          method: 'POST',
                          headers: {
                            Authorization: authHeader,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(confluenceBody),
                        })

                        if (confluenceResponse.ok) {
                          const pageData = await confluenceResponse.json() as { _links: { webui: string } }
                          ticketResult.confluenceUrl = `https://${domain}.atlassian.net/wiki${pageData._links.webui}`
                        }
                      } catch {
                        // Confluence page creation failed, but JIRA ticket was created successfully
                        // Continue without failing the whole operation
                      }
                    }

                    createdTickets.push(ticketResult)
                  } catch (error) {
                    errors.push({
                      draftId: ticket.draftId,
                      error: error instanceof Error ? error.message : 'Unknown error',
                    })
                  }
                }

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ createdTickets, errors }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Server error' }))
              }
            })
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
