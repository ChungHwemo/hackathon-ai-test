import type { SearchResult, SearchSource, SearchResponse } from '@/types/knowledge-search'

const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
}

export async function searchInternal(query: string): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, sources: ['confluence', 'jira'] }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Internal search failed')
  }

  const data = await response.json() as { results: SearchResult[]; total: number }
  return {
    results: data.results,
    source: 'confluence',
    total: data.total,
    hasMore: false,
  }
}

export async function searchWeb(query: string): Promise<SearchResponse> {
  const { apiKey, model, baseUrl } = GEMINI_CONFIG
  if (!apiKey) throw new Error('Gemini API key not configured')

  const prompt = `You are a web search assistant. The user wants to find information about: "${query}"

Since you cannot access the web directly, provide helpful information based on your knowledge.
Format your response as JSON array of search-like results:
[
  {
    "title": "Result title",
    "snippet": "Brief description or excerpt",
    "url": "https://example.com (suggested reference URL)",
    "relevance": 80
  }
]

Provide 3-5 relevant results. Return ONLY the JSON array, no other text.`

  const response = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })

  if (!response.ok) throw new Error('Web search failed')

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)

  if (!jsonMatch) return { results: [], source: 'google', total: 0, hasMore: false }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Array<{ title: string; snippet: string; url: string; relevance: number }>
    const results: SearchResult[] = parsed.map((r, i) => ({
      id: `web-${Date.now()}-${i}`,
      title: r.title,
      source: 'google' as SearchSource,
      snippet: r.snippet,
      url: r.url,
      relevance: r.relevance || 70,
    }))
    return { results, source: 'google', total: results.length, hasMore: false }
  } catch {
    return { results: [], source: 'google', total: 0, hasMore: false }
  }
}

const SERPER_ENDPOINT = 'https://google.serper.dev/search'
const SERPER_SOURCE: SearchSource = 'google'

interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
}

interface SerperSearchResponse {
  organic?: SerperResult[]
}

export function mapSerperToSearchResult(result: SerperResult, index: number): SearchResult {
  return {
    id: `web-${Date.now()}-${index}`,
    title: result.title,
    source: SERPER_SOURCE,
    snippet: result.snippet,
    url: result.link,
    relevance: 100 - (result.position * 5),
  }
}

export async function searchWebReal(query: string): Promise<SearchResponse> {
  const apiKey = getSerperApiKey()
  if (!apiKey) return fallbackToFakeWebSearch(query)

  const data = await fetchSerperResults(query, apiKey, 5)
  const results = mapSerperResults(data.organic)
  return buildSearchResponse(results)
}

async function fetchSerperResults(query: string, apiKey: string, limit: number): Promise<SerperSearchResponse> {
  try {
    const response = await fetch(SERPER_ENDPOINT, {
      method: 'POST',
      headers: buildSerperHeaders(apiKey),
      body: buildSerperBody(query, limit),
    })
    if (!response.ok) return { organic: [] }
    return await response.json() as SerperSearchResponse
  } catch {
    return { organic: [] }
  }
}

function buildSerperHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
  }
}

function buildSerperBody(query: string, limit: number): string {
  return JSON.stringify({ q: query, num: limit })
}

function mapSerperResults(results: SerperResult[] | undefined): SearchResult[] {
  return (results ?? []).map(mapSerperToSearchResult)
}

function getSerperApiKey(): string | null {
  return import.meta.env.VITE_SERPER_API_KEY || null
}

async function fallbackToFakeWebSearch(query: string): Promise<SearchResponse> {
  try {
    return await searchWeb(query)
  } catch {
    return buildEmptySearchResponse()
  }
}

function buildSearchResponse(results: SearchResult[]): SearchResponse {
  return {
    results,
    source: SERPER_SOURCE,
    total: results.length,
    hasMore: false,
  }
}

function buildEmptySearchResponse(): SearchResponse {
  return {
    results: [],
    source: SERPER_SOURCE,
    total: 0,
    hasMore: false,
  }
}

export async function searchWithAI(query: string, previousResults: SearchResult[]): Promise<SearchResponse> {
  const { apiKey, model, baseUrl } = GEMINI_CONFIG
  if (!apiKey) throw new Error('Gemini API key not configured')

  const contextSummary = previousResults.length > 0
    ? `Previous search found these results:\n${previousResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}\n\n`
    : ''

  const prompt = `${contextSummary}User question: "${query}"

Based on the context above and your knowledge, provide a comprehensive answer.
If previous results exist, synthesize and explain them.
If no previous results, provide your best answer.

Format as JSON:
{
  "title": "Answer summary (short title)",
  "answer": "Detailed answer with explanation",
  "suggestions": ["Follow-up question 1", "Follow-up question 2"]
}

Return ONLY the JSON, no other text.`

  const response = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })

  if (!response.ok) throw new Error('AI search failed')

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)

  if (!jsonMatch) return { results: [], source: 'gemini', total: 0, hasMore: false }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { title: string; answer: string; suggestions?: string[] }
    const result: SearchResult = {
      id: `ai-${Date.now()}`,
      title: parsed.title || 'AI Answer',
      source: 'gemini',
      snippet: parsed.answer,
      url: '',
      relevance: 100,
      metadata: { suggestions: parsed.suggestions?.join(', ') || '' },
    }
    return { results: [result], source: 'gemini', total: 1, hasMore: false }
  } catch {
    return { results: [], source: 'gemini', total: 0, hasMore: false }
  }
}
