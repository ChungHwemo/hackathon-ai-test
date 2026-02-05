/**
 * PR Review API Service
 * Handles communication with the /api/pr-review endpoint
 */

export interface PRInfo {
  title: string
  body: string
  additions: number
  deletions: number
  filesChanged: number
}

export interface PRFile {
  filename: string
  status: string
  additions: number
  deletions: number
}

export interface ReviewIssue {
  path: string
  line: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ReviewResult {
  summary: string
  issues: ReviewIssue[]
  suggestions: string[]
  recommendation: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  complexityScore: number
}

export interface PRReviewResponse {
  pr: PRInfo
  files: PRFile[]
  review: ReviewResult
}

export interface PRReviewError {
  error: string
}

/**
 * Submit a PR URL for AI-powered code review
 * @param prUrl - GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
 * @returns Promise with review results
 * @throws Error if the API call fails or returns an error
 */
export async function reviewPullRequest(prUrl: string): Promise<PRReviewResponse> {
  const response = await fetch('/api/pr-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prUrl }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorData = data as PRReviewError
    throw new Error(errorData.error || 'PR review failed')
  }

  return data as PRReviewResponse
}
