import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reviewPullRequest, type PRReviewResponse, type PRReviewError } from '../pr-review-api'

describe('pr-review-api', () => {
  const mockFetch = vi.fn()
  
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })
  
  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockReset()
  })

  const mockSuccessResponse: PRReviewResponse = {
    pr: {
      title: 'feat: add new feature',
      body: 'This PR adds a new feature',
      additions: 100,
      deletions: 20,
      filesChanged: 5,
    },
    files: [
      { filename: 'src/feature.ts', status: 'added', additions: 80, deletions: 0 },
      { filename: 'src/utils.ts', status: 'modified', additions: 20, deletions: 20 },
    ],
    review: {
      summary: 'Overall the PR looks good with minor issues.',
      issues: [
        { path: 'src/feature.ts', line: 10, message: 'Consider error handling', severity: 'warning' },
      ],
      suggestions: ['Add unit tests', 'Consider edge cases'],
      recommendation: 'COMMENT',
      complexityScore: 4,
    },
  }

  describe('reviewPullRequest', () => {
    it('should call API with correct endpoint and PR URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      })

      const prUrl = 'https://github.com/owner/repo/pull/123'
      await reviewPullRequest(prUrl)

      expect(mockFetch).toHaveBeenCalledWith('/api/pr-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl }),
      })
    })

    it('should return parsed response on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      })

      const result = await reviewPullRequest('https://github.com/owner/repo/pull/123')

      expect(result).toEqual(mockSuccessResponse)
      expect(result.pr.title).toBe('feat: add new feature')
      expect(result.review.issues).toHaveLength(1)
      expect(result.review.recommendation).toBe('COMMENT')
    })

    it('should throw error for invalid PR URL format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid PR URL format' }),
      })

      await expect(reviewPullRequest('invalid-url')).rejects.toThrow('Invalid PR URL format')
    })

    it('should throw error when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'PR review failed' }),
      })

      await expect(
        reviewPullRequest('https://github.com/owner/repo/pull/123')
      ).rejects.toThrow('PR review failed')
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        reviewPullRequest('https://github.com/owner/repo/pull/123')
      ).rejects.toThrow('Network error')
    })

    it('should parse all review severity levels correctly', async () => {
      const responseWithAllSeverities: PRReviewResponse = {
        ...mockSuccessResponse,
        review: {
          ...mockSuccessResponse.review,
          issues: [
            { path: 'file1.ts', line: 1, message: 'Error', severity: 'error' },
            { path: 'file2.ts', line: 2, message: 'Warning', severity: 'warning' },
            { path: 'file3.ts', line: 3, message: 'Info', severity: 'info' },
          ],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithAllSeverities),
      })

      const result = await reviewPullRequest('https://github.com/owner/repo/pull/123')

      expect(result.review.issues).toHaveLength(3)
      expect(result.review.issues[0].severity).toBe('error')
      expect(result.review.issues[1].severity).toBe('warning')
      expect(result.review.issues[2].severity).toBe('info')
    })

    it('should handle APPROVE recommendation', async () => {
      const approveResponse: PRReviewResponse = {
        ...mockSuccessResponse,
        review: {
          ...mockSuccessResponse.review,
          recommendation: 'APPROVE',
          issues: [],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(approveResponse),
      })

      const result = await reviewPullRequest('https://github.com/owner/repo/pull/123')
      expect(result.review.recommendation).toBe('APPROVE')
    })

    it('should handle REQUEST_CHANGES recommendation', async () => {
      const requestChangesResponse: PRReviewResponse = {
        ...mockSuccessResponse,
        review: {
          ...mockSuccessResponse.review,
          recommendation: 'REQUEST_CHANGES',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(requestChangesResponse),
      })

      const result = await reviewPullRequest('https://github.com/owner/repo/pull/123')
      expect(result.review.recommendation).toBe('REQUEST_CHANGES')
    })
  })
})
