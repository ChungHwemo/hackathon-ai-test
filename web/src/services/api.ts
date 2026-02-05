const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
}

export const ATLASSIAN_CONFIG = {
  domain: import.meta.env.VITE_ATLASSIAN_DOMAIN || '',
  email: import.meta.env.VITE_ATLASSIAN_EMAIL || '',
  apiToken: import.meta.env.VITE_ATLASSIAN_API_TOKEN || '',
  confluenceSpaceId: import.meta.env.VITE_CONFLUENCE_SPACE_ID || '',
}

export type IssueType = 'Bug' | 'Task' | 'Story' | 'Epic' | 'Sub-task'
export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'

export interface TicketDraft {
  draftId: string
  issueType: IssueType
  summary: string
  description: string
  priority: Priority
  labels: string[]
  component?: string
  estimatedHours?: number
  confidenceScore: number
}

export interface TicketBreakdown {
  originalRequest: string
  parentTicket: TicketDraft | null
  tickets: TicketDraft[]
  totalEstimatedHours: number
  analysisNotes: string
}

interface CreatedTicket {
  draftId: string
  jiraKey: string
  url: string
  confluenceUrl?: string
}

interface BulkCreateResult {
  createdTickets: CreatedTicket[]
  errors: Array<{ draftId: string; error: string }>
}

interface CreateTicketsOptions {
  createConfluencePages?: boolean
}

export interface SimilarDocument {
  id: string
  title: string
  url: string
  excerpt: string
  similarity: number
}

export async function searchSimilarDocuments(query: string, spaceKey?: string): Promise<SimilarDocument[]> {
  const domain = import.meta.env.VITE_ATLASSIAN_DOMAIN
  const email = import.meta.env.VITE_ATLASSIAN_EMAIL
  const apiToken = import.meta.env.VITE_ATLASSIAN_API_TOKEN
  
  if (!domain || !email || !apiToken) return []
  
  const escaped = query.replace(/\\/g, '').replace(/"/g, '')
  const conditions: string[] = []
  if (spaceKey) conditions.push(`space = "${spaceKey}"`)
  conditions.push(`(title ~ "${escaped}" OR text ~ "${escaped}")`)
  const cql = conditions.join(' AND ') + ' ORDER BY lastModified DESC'
  
  const authHeader = `Basic ${btoa(`${email}:${apiToken}`)}`
  const url = `https://${domain}.atlassian.net/wiki/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=5&excerpt=highlight`
  
  try {
    const response = await fetch(url, {
      headers: { Authorization: authHeader, Accept: 'application/json' }
    })
    
    if (!response.ok) return []
    
    const data = await response.json() as { 
      results: Array<{ id: string; title: string; excerpt?: string; _links: { webui: string } }> 
    }
    
    return data.results.map((r, i) => ({
      id: r.id,
      title: r.title,
      url: `https://${domain}.atlassian.net/wiki${r._links.webui}`,
      excerpt: r.excerpt?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
      similarity: 95 - i * 10
    }))
  } catch {
    return []
  }
}

function detectBilingualRequest(text: string): boolean {
  const bilingualPatterns = [
    /英語でも/i,
    /英語も/i,
    /英訳も/i,
    /in english/i,
    /english too/i,
    /also in english/i,
    /bilingual/i,
    /both languages/i,
  ]
  return bilingualPatterns.some(pattern => pattern.test(text))
}

const BREAKDOWN_PROMPT_JA = `あなたはシニアレベルのJIRAチケット作成エキスパートです。リクエストを分析し、実行可能なチケットに分解してください。

【重要】すべての出力は日本語で記述してください。

【ルール】
1. 各チケットは1つの明確な成果物を表す（2-8時間の作業）
2. 適切に分類: Bug（不具合）, Task（技術作業）, Story（ユーザー価値）, Epic（グループ化）
3. 影響度と緊急度に基づいて優先度を設定
4. 関連ラベルを抽出（最大3つ）
5. 複雑なリクエストは親Epic/Storyとサブチケットを作成
6. シンプルなリクエストは個別チケットのみ

【説明文のテンプレート - 必須セクション】
各チケットの description は以下の構造で記述すること：

## 概要
{問題や機能の簡潔な説明}

## 背景・経緯
{なぜこの作業が必要なのか、ビジネス的な文脈}

## 受け入れ条件
- [ ] {条件1}
- [ ] {条件2}
- [ ] {条件3}

## 技術的考慮事項
- {実装時の注意点、アーキテクチャ上の考慮}
- {パフォーマンス、セキュリティ面での考慮}

## テスト観点
- [ ] {テストケース1}
- [ ] {テストケース2}

## 参考資料
- {関連ドキュメント、設計書、Confluenceリンクなど}

【出力形式（厳密なJSON）】
{
  "parentTicket": null | {
    "issueType": "Epic" | "Story",
    "summary": "簡潔なタイトル（最大80文字）",
    "description": "上記テンプレートに従った説明文",
    "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
    "labels": ["..."],
    "estimatedHours": 0,
    "confidenceScore": 85
  },
  "tickets": [
    {
      "issueType": "Bug" | "Task" | "Story" | "Sub-task",
      "summary": "簡潔なタイトル（最大80文字）",
      "description": "上記テンプレートに従った説明文",
      "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
      "labels": ["frontend", "auth"],
      "component": "モジュール名（任意）",
      "estimatedHours": 4,
      "confidenceScore": 90
    }
  ],
  "analysisNotes": "分解ロジックの簡単な説明（日本語）"
}

リクエスト:
`

const BREAKDOWN_PROMPT_BILINGUAL = `あなたはシニアレベルのJIRAチケット作成エキスパートです。リクエストを分析し、実行可能なチケットに分解してください。

【重要】すべての出力は日本語と英語の両方で記述してください（バイリンガル形式）。

【ルール】
1. 各チケットは1つの明確な成果物を表す（2-8時間の作業）
2. 適切に分類: Bug（不具合）, Task（技術作業）, Story（ユーザー価値）, Epic（グループ化）
3. 影響度と緊急度に基づいて優先度を設定
4. 関連ラベルを抽出（最大3つ）
5. 複雑なリクエストは親Epic/Storyとサブチケットを作成
6. シンプルなリクエストは個別チケットのみ

【説明文のテンプレート - バイリンガル形式】
各チケットの description は以下の構造で記述すること：

---
# 🇯🇵 日本語 / Japanese

## 概要
{問題や機能の簡潔な説明 - 日本語}

## 背景・経緯
{なぜこの作業が必要なのか、ビジネス的な文脈 - 日本語}

## 受け入れ条件
- [ ] {条件1 - 日本語}
- [ ] {条件2 - 日本語}

## 技術的考慮事項
- {実装時の注意点 - 日本語}

## テスト観点
- [ ] {テストケース1 - 日本語}

---
# 🇺🇸 English

## Overview
{Brief description of the problem or feature - English}

## Background
{Why this work is needed, business context - English}

## Acceptance Criteria
- [ ] {Criterion 1 - English}
- [ ] {Criterion 2 - English}

## Technical Considerations
- {Implementation notes - English}

## Test Cases
- [ ] {Test case 1 - English}

【出力形式（厳密なJSON）】
{
  "parentTicket": null | {
    "issueType": "Epic" | "Story",
    "summary": "日本語タイトル / English Title",
    "description": "上記バイリンガルテンプレートに従った説明文",
    "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
    "labels": ["..."],
    "estimatedHours": 0,
    "confidenceScore": 85
  },
  "tickets": [
    {
      "issueType": "Bug" | "Task" | "Story" | "Sub-task",
      "summary": "日本語タイトル / English Title",
      "description": "上記バイリンガルテンプレートに従った説明文",
      "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
      "labels": ["frontend", "auth"],
      "component": "モジュール名（任意）",
      "estimatedHours": 4,
      "confidenceScore": 90
    }
  ],
  "analysisNotes": "分解ロジックの簡単な説明（日本語と英語）"
}

リクエスト:
`

function generateDraftId(index: number): string {
  return `draft-${Date.now()}-${index}`
}

function validateTicketDraft(
  draft: Omit<TicketDraft, 'draftId'>
): Omit<TicketDraft, 'draftId'> {
  const validIssueTypes: IssueType[] = [
    'Bug',
    'Task',
    'Story',
    'Epic',
    'Sub-task',
  ]
  const validPriorities: Priority[] = [
    'Highest',
    'High',
    'Medium',
    'Low',
    'Lowest',
  ]

  return {
    issueType: validIssueTypes.includes(draft.issueType)
      ? draft.issueType
      : 'Task',
    summary: String(draft.summary ?? '').substring(0, 100),
    description: String(draft.description ?? ''),
    priority: validPriorities.includes(draft.priority)
      ? draft.priority
      : 'Medium',
    labels: Array.isArray(draft.labels) ? draft.labels.slice(0, 3) : [],
    component: draft.component,
    estimatedHours:
      typeof draft.estimatedHours === 'number' ? draft.estimatedHours : 4,
    confidenceScore:
      typeof draft.confidenceScore === 'number' ? draft.confidenceScore : 70,
  }
}

export async function analyzeRequest(
  request: string
): Promise<TicketBreakdown> {
  const { apiKey, model, baseUrl } = GEMINI_CONFIG

  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  // Select prompt based on whether bilingual output is requested
  const isBilingual = detectBilingualRequest(request)
  const prompt = isBilingual ? BREAKDOWN_PROMPT_BILINGUAL : BREAKDOWN_PROMPT_JA

  const response = await fetch(
    `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + request }] }],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Gemini API request failed')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return createFallbackBreakdown(request)
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return assignDraftIds(parsed, request)
  } catch {
    return createFallbackBreakdown(request)
  }
}

function createFallbackBreakdown(message: string): TicketBreakdown {
  return {
    originalRequest: message,
    parentTicket: null,
    tickets: [
      {
        draftId: generateDraftId(1),
        issueType: 'Task',
        summary: message.substring(0, 80),
        description: message,
        priority: 'Medium',
        labels: [],
        estimatedHours: 4,
        confidenceScore: 50,
      },
    ],
    totalEstimatedHours: 4,
    analysisNotes: 'Fallback: Could not parse response',
  }
}

function assignDraftIds(
  response: {
    parentTicket: Omit<TicketDraft, 'draftId'> | null
    tickets: Array<Omit<TicketDraft, 'draftId'>>
    analysisNotes: string
  },
  originalRequest: string
): TicketBreakdown {
  const parentTicket = response.parentTicket
    ? { ...validateTicketDraft(response.parentTicket), draftId: generateDraftId(0) }
    : null

  const tickets = response.tickets.map((ticket, index) => ({
    ...validateTicketDraft(ticket),
    draftId: generateDraftId(index + 1),
  }))

  const totalEstimatedHours = tickets.reduce(
    (sum, t) => sum + (t.estimatedHours ?? 0),
    0
  )

  return {
    originalRequest,
    parentTicket,
    tickets,
    totalEstimatedHours,
    analysisNotes: String(response.analysisNotes ?? ''),
  }
}

export async function createJiraTickets(
  tickets: TicketDraft[],
  options: CreateTicketsOptions = {}
): Promise<BulkCreateResult> {
  const response = await fetch('/api/jira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      tickets, 
      createConfluencePages: options.createConfluencePages ?? false,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create tickets')
  }

  return response.json()
}

export interface DashboardStats {
  ticketsCreated: { value: number; change: string }
  openIssues: { value: number; change: string }
  resolvedIssues: { value: number; change: string }
  inProgress: { value: number; change: string }
  highPriority: { value: number; change: string }
  bugs: { value: number; change: string }
  dueToday: { value: number; change: string }
  overdue: { value: number; change: string }
  updatedToday: { value: number; change: string }
  projectKey: string
  lastUpdated: string
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch dashboard stats')
  }

  return response.json()
}

export interface JiraTask {
  key: string
  summary: string
  status: string
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'
  assignee: { displayName: string; avatarUrl: string } | null
  dueDate: string | null
  issueType: string
  url: string
}

export interface DashboardTasks {
  inProgress: JiraTask[]
  todo: JiraTask[]
  highPriority: JiraTask[]
  dueOrOverdue: JiraTask[]
  lastUpdated: string
}

export async function fetchDashboardTasks(): Promise<DashboardTasks> {
  const response = await fetch('/api/dashboard/tasks')

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch dashboard tasks')
  }

  return response.json()
}
