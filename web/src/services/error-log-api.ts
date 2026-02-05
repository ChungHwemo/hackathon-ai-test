export interface ErrorLogRequest {
  errorLog: string
}

export interface ErrorLogClassification {
  type: string
  category: string
  severity: 'high' | 'medium' | 'low'
}

export interface ErrorLogSolution {
  title: string
  description: string
  code?: string
}

export interface ErrorLogRelatedIssue {
  key: string
  title: string
  status: string
  similarity: number
}

export interface ErrorLogResponse {
  classification: ErrorLogClassification
  rootCause: string
  solutions: ErrorLogSolution[]
  relatedIssues: ErrorLogRelatedIssue[]
}

export function parseErrorLogResponse(data: unknown): ErrorLogResponse {
  const parsed = data as Partial<ErrorLogResponse>

  return {
    classification: {
      type: parsed.classification?.type ?? 'Unknown',
      category: parsed.classification?.category ?? 'Unknown',
      severity: parsed.classification?.severity ?? 'medium',
    },
    rootCause: parsed.rootCause ?? 'Unable to analyze',
    solutions: parsed.solutions ?? [],
    relatedIssues: parsed.relatedIssues ?? [],
  }
}

async function fetchErrorLogAnalysis(request: ErrorLogRequest): Promise<unknown> {
  const response = await fetch('/api/error-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Error log analysis failed')
  }

  return response.json()
}

export async function analyzeErrorLog(errorLog: string): Promise<ErrorLogResponse> {
  const data = await fetchErrorLogAnalysis({ errorLog })
  return parseErrorLogResponse(data)
}
