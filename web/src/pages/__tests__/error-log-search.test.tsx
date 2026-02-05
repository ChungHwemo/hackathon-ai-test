import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyzeErrorLog, parseErrorLogResponse } from '../../services/error-log-api'

const mockResponse = {
  classification: {
    type: 'NullPointerException',
    category: 'Runtime Error',
    severity: 'high',
  },
  rootCause: 'User session was null during validation',
  solutions: [
    {
      title: 'Add null checks',
      description: 'Ensure session exists before access',
      code: 'if (session) { /* ... */ }',
    },
  ],
  relatedIssues: [
    {
      key: 'PROJ-567',
      title: 'Handle missing session token',
      status: 'Done',
      similarity: 92,
    },
  ],
}

describe('ErrorLogSearch API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('should call /api/error-log with error message', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    await analyzeErrorLog('Something failed')

    expect(fetchMock).toHaveBeenCalledWith('/api/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorLog: 'Something failed' }),
    })
  })

  it('should parse response correctly', () => {
    const parsed = parseErrorLogResponse(mockResponse)

    expect(parsed.classification.type).toBe('NullPointerException')
    expect(parsed.rootCause).toBe('User session was null during validation')
    expect(parsed.solutions[0]?.title).toBe('Add null checks')
    expect(parsed.relatedIssues[0]?.key).toBe('PROJ-567')
  })
})
