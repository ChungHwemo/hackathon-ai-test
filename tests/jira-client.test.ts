import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraClient } from '../src/shared/clients/jira-client.js';

describe('JiraClient', () => {
  const config = {
    domain: 'test',
    email: 'test@example.com',
    apiToken: 'token',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchInProject - query escaping', () => {
    it('should escape double quotes in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ issues: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new JiraClient(config);
      await client.searchInProject('PROJ', 'test "value"');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('\\"value\\"');
    });

    it('should escape backslashes in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ issues: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new JiraClient(config);
      await client.searchInProject('PROJ', 'path\\to\\file');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('path\\\\to\\\\file');
    });

    it('should escape square brackets in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ issues: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new JiraClient(config);
      await client.searchInProject('PROJ', 'error[0]');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('error\\[0\\]');
    });

    it('should use summary OR description pattern', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ issues: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new JiraClient(config);
      await client.searchInProject('PROJ', 'search');

      const url = fetchMock.mock.calls[0][0] as string;
      const decodedUrl = decodeURIComponent(url).replace(/\+/g, ' ');
      expect(decodedUrl).toContain('summary ~ "search"');
      expect(decodedUrl).toContain('description ~ "search"');
    });
  });
});
