import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAccessToken, mapTeamsMessage, searchTeamsMessages } from '../teams-api'

describe('Teams API', () => {
  describe('mapTeamsMessage', () => {
    it('should map Graph message to SearchResult', () => {
      const graphMessage = {
        id: '123',
        body: { content: 'Error in production' },
        from: { user: { displayName: 'John' } },
        createdDateTime: '2026-02-01T10:00:00Z',
        webUrl: 'https://teams.microsoft.com/...',
      }

      const result = mapTeamsMessage(graphMessage)

      expect(result.source).toBe('teams')
      expect(result.snippet).toContain('Error in production')
    })

    it('should use first line for title', () => {
      const graphMessage = {
        id: '456',
        body: { content: 'First line\nSecond line' },
        from: { user: { displayName: 'Jane' } },
        createdDateTime: '2026-02-02T10:00:00Z',
        webUrl: 'https://teams.microsoft.com/...',
      }

      const result = mapTeamsMessage(graphMessage)

      expect(result.title).toBe('First line')
    })

    it('should handle empty message content', () => {
      const graphMessage = {
        id: '789',
        body: { content: '' },
        from: { user: { displayName: 'Alice' } },
        createdDateTime: '2026-02-03T10:00:00Z',
        webUrl: 'https://teams.microsoft.com/...',
      }

      const result = mapTeamsMessage(graphMessage)

      expect(result.title).toBe('')
      expect(result.snippet).toBe('')
    })

    it('should handle missing body', () => {
      const graphMessage = {
        id: '101',
        body: undefined as unknown as { content: string },
        from: { user: { displayName: 'Bob' } },
        createdDateTime: '2026-02-04T10:00:00Z',
        webUrl: 'https://teams.microsoft.com/...',
      }

      const result = mapTeamsMessage(graphMessage)

      expect(result.title).toBe('')
      expect(result.snippet).toBe('')
    })
  })

  describe('getAccessToken', () => {
    it('should return null when credentials missing', async () => {
      const token = await getAccessToken({
        tenantId: '',
        clientId: '',
        clientSecret: '',
      })

      expect(token).toBeNull()
    })
  })

  describe('searchTeamsMessages - empty results', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return empty results when no token available', async () => {
      vi.stubEnv('VITE_TEAMS_TENANT_ID', '')
      vi.stubEnv('VITE_TEAMS_CLIENT_ID', '')
      vi.stubEnv('VITE_TEAMS_CLIENT_SECRET', '')

      const result = await searchTeamsMessages('test query')

      expect(result.results).toHaveLength(0)
      expect(result.source).toBe('teams')
      expect(result.total).toBe(0)
    })

    it('should return empty results when Graph API returns empty hits', async () => {
      vi.stubEnv('VITE_TEAMS_TENANT_ID', 'tenant')
      vi.stubEnv('VITE_TEAMS_CLIENT_ID', 'client')
      vi.stubEnv('VITE_TEAMS_CLIENT_SECRET', 'secret')

      vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ value: [{ hitsContainers: [{ hits: [] }] }] }),
        }))

      const result = await searchTeamsMessages('no results')

      expect(result.results).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should return results when Graph API returns messages', async () => {
      vi.stubEnv('VITE_TEAMS_TENANT_ID', 'tenant')
      vi.stubEnv('VITE_TEAMS_CLIENT_ID', 'client')
      vi.stubEnv('VITE_TEAMS_CLIENT_SECRET', 'secret')

      vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            value: [{
              hitsContainers: [{
                hits: [{
                  resource: {
                    id: 'msg1',
                    body: { content: 'Found message' },
                    from: { user: { displayName: 'User' } },
                    createdDateTime: '2026-02-05T10:00:00Z',
                    webUrl: 'https://teams.microsoft.com/msg1',
                  },
                }],
              }],
            }],
          }),
        }))

      const result = await searchTeamsMessages('found query')

      expect(result.results).toHaveLength(1)
      expect(result.results[0].snippet).toContain('Found message')
      expect(result.total).toBe(1)
    })

    it('should return empty results when Graph API returns error', async () => {
      vi.stubEnv('VITE_TEAMS_TENANT_ID', 'tenant')
      vi.stubEnv('VITE_TEAMS_CLIENT_ID', 'client')
      vi.stubEnv('VITE_TEAMS_CLIENT_SECRET', 'secret')

      vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }))

      const result = await searchTeamsMessages('unauthorized')

      expect(result.results).toHaveLength(0)
    })
  })
})
