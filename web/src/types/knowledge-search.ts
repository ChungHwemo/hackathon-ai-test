/**
 * Knowledge Search Types
 * 3-stage search system: Internal (Confluence/JIRA) -> Web (Google) -> AI (Gemini)
 */

/** Search source identifier */
export type SearchSource = 'confluence' | 'jira' | 'google' | 'gemini' | 'teams'

/** Search stage status */
export type SearchStageStatus = 'idle' | 'loading' | 'success' | 'error' | 'no-results'

/** Individual search result */
export interface SearchResult {
  id: string
  title: string
  source: SearchSource
  snippet: string
  url: string
  relevance: number
  metadata?: SearchResultMetadata
}

/** Additional metadata for search results */
export interface SearchResultMetadata {
  space?: string
  issueKey?: string
  pageId?: string
  updatedAt?: string
  author?: string
  suggestions?: string
}

/** Confluence API response types */
export interface ConfluenceSearchResponse {
  results: ConfluenceResult[]
  totalSize: number
  start: number
  limit: number
}

export interface ConfluenceResult {
  id: string
  type: string
  title: string
  excerpt: string
  url: string
  lastModified: string
  space?: { key: string; name: string }
}

/** JIRA API response types */
export interface JiraSearchResponse {
  issues: JiraIssue[]
  total: number
  startAt: number
  maxResults: number
}

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description?: string
    updated: string
    status: { name: string }
    issuetype: { name: string }
  }
}

/** Search stage state */
export interface SearchStage {
  sources: SearchSource[]
  status: SearchStageStatus
  results: SearchResult[]
  error?: string
}

/** Overall knowledge search state */
export interface KnowledgeSearchState {
  query: string
  stages: {
    internal: SearchStage
    web: SearchStage
    ai: SearchStage
  }
  currentStage: 'idle' | 'internal' | 'web' | 'ai' | 'complete'
}

/** Search request payload */
export interface SearchRequest {
  query: string
  sources?: SearchSource[]
  limit?: number
}

/** Combined search response */
export interface SearchResponse {
  results: SearchResult[]
  source: SearchSource
  total: number
  hasMore: boolean
}
