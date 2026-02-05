import type { SearchResponse, SearchResult, SearchSource } from '@/types/knowledge-search'
import type { GraphMessage, TeamsConfig } from '@/types/teams'

type GraphSearchResponse = {
  value?: Array<{ hitsContainers?: Array<{ hits?: Array<{ resource?: GraphMessage }> }> }>
}

const TEAMS_SOURCE: SearchSource = 'teams'

export async function getAccessToken(config: TeamsConfig): Promise<string | null> {
  if (!config.tenantId || !config.clientId || !config.clientSecret) {
    return null
  }

  const tokenUrl = buildTokenUrl(config.tenantId)
  const body = buildTokenRequestBody(config)
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await response.json() as { access_token?: string }
  return data.access_token ?? null
}

export function mapTeamsMessage(msg: GraphMessage): SearchResult {
  const rawContent = msg.body?.content ?? ''
  const snippet = sanitizeHtml(rawContent).slice(0, 200)
  const author = msg.from?.user?.displayName

  return {
    id: `teams-${msg.id}`,
    title: extractFirstLine(rawContent),
    source: TEAMS_SOURCE,
    snippet,
    url: msg.webUrl,
    relevance: 80,
    metadata: { author, updatedAt: msg.createdDateTime },
  }
}

export async function searchTeamsMessages(query: string): Promise<SearchResponse> {
  const config = getTeamsConfig()
  const token = await getAccessToken(config)

  if (!token) {
    return { results: [], source: TEAMS_SOURCE, total: 0, hasMore: false }
  }

  const messages = await fetchTeamsMessages(token, query)
  const results = messages.map(mapTeamsMessage)
  return { results, source: TEAMS_SOURCE, total: results.length, hasMore: false }
}

function getTeamsConfig(): TeamsConfig {
  return {
    tenantId: import.meta.env.VITE_TEAMS_TENANT_ID || '',
    clientId: import.meta.env.VITE_TEAMS_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_TEAMS_CLIENT_SECRET || '',
    teamId: import.meta.env.VITE_TEAMS_TEAM_ID || undefined,
  }
}

function buildTokenUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
}

function buildTokenRequestBody(config: TeamsConfig): string {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  })
  return params.toString()
}

async function fetchTeamsMessages(token: string, query: string): Promise<GraphMessage[]> {
  const response = await fetch('https://graph.microsoft.com/v1.0/search/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: buildSearchBody(query),
  })

  return response.ok ? parseSearchResponse(response) : []
}

function buildSearchBody(query: string): string {
  return JSON.stringify({
    requests: [{
      entityTypes: ['chatMessage'],
      query: { queryString: query },
    }],
  })
}

async function parseSearchResponse(response: Response): Promise<GraphMessage[]> {
  const data = await response.json() as GraphSearchResponse
  return extractMessages(data)
}

function extractMessages(data: GraphSearchResponse): GraphMessage[] {
  return (
    data.value?.flatMap((container) =>
      container.hitsContainers?.flatMap((hitContainer) =>
        hitContainer.hits?.flatMap((hit) => (hit.resource ? [hit.resource] : [])) ?? []
      ) ?? []
    ) ?? []
  )
}

function sanitizeHtml(content: string): string {
  return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function extractFirstLine(content: string): string {
  const firstLine = content.split(/\r?\n/)[0] || ''
  return sanitizeHtml(firstLine).slice(0, 120)
}
