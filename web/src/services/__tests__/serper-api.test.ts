import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapSerperToSearchResult, searchWebReal, searchInternal, searchWithAI } from '../knowledge-api'

describe('Serper API', () => {
  describe('mapSerperToSearchResult', () => {
    it('should map Serper response to SearchResult', () => {
      const serperResult = {
        title: 'Test',
        link: 'http://example.com',
        snippet: 'desc',
        position: 1,
      }

      const mapped = mapSerperToSearchResult(serperResult, 0)

      expect(mapped.source).toBe('google')
      expect(mapped.title).toBe('Test')
      expect(mapped.url).toBe('http://example.com')
      expect(mapped.snippet).toBe('desc')
      expect(mapped.relevance).toBe(95)
    })

    it('should calculate relevance based on position', () => {
      const result1 = mapSerperToSearchResult({ title: 'A', link: '', snippet: '', position: 1 }, 0)
      const result5 = mapSerperToSearchResult({ title: 'B', link: '', snippet: '', position: 5 }, 4)
      const result10 = mapSerperToSearchResult({ title: 'C', link: '', snippet: '', position: 10 }, 9)

      expect(result1.relevance).toBe(95)
      expect(result5.relevance).toBe(75)
      expect(result10.relevance).toBe(50)
    })
  })

  describe('searchWebReal - empty results', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return empty results when Serper returns no organic results', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ organic: [] }),
      }))
      vi.stubEnv('VITE_SERPER_API_KEY', 'test-key')

      const result = await searchWebReal('no results query')

      expect(result.results).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.source).toBe('google')
    })

    it('should return empty results when Serper returns undefined organic', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }))
      vi.stubEnv('VITE_SERPER_API_KEY', 'test-key')

      const result = await searchWebReal('query')

      expect(result.results).toHaveLength(0)
    })
  })

  describe('searchInternal - empty results', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return empty results when API returns no matches', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [], total: 0 }),
      }))

      const result = await searchInternal('no matches')

      expect(result.results).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.source).toBe('confluence')
    })

    it('should return results when API returns matches', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: '1', title: 'Found', source: 'confluence', snippet: 'test', url: '', relevance: 90 }
          ],
          total: 1,
        }),
      }))

      const result = await searchInternal('found query')

      expect(result.results).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('searchWithAI - empty results', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return empty results when AI returns no valid JSON', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'invalid response' }] } }],
        }),
      }))
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')

      const result = await searchWithAI('query', [])

      expect(result.results).toHaveLength(0)
    })

    it('should return result when AI returns valid JSON', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: 'AI Answer',
                  answer: 'This is the answer',
                  suggestions: ['Question 1'],
                }),
              }],
            },
          }],
        }),
      }))
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')

      const result = await searchWithAI('query', [])

      expect(result.results).toHaveLength(1)
      expect(result.results[0].source).toBe('gemini')
      expect(result.results[0].snippet).toBe('This is the answer')
    })
  })
})
