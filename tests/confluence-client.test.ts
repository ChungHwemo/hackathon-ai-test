import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfluenceClient } from '../src/shared/clients/confluence-client.js';

describe('ConfluenceClient', () => {
  const config = {
    domain: 'test',
    email: 'test@example.com',
    apiToken: 'token',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchInSpace - query escaping', () => {
    it('should escape double quotes in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new ConfluenceClient(config);
      await client.searchInSpace('SPACE', 'test "value"');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('\\"value\\"');
    });

    it('should escape backslashes in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new ConfluenceClient(config);
      await client.searchInSpace('SPACE', 'path\\to\\file');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('path\\\\to\\\\file');
    });

    it('should escape square brackets in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new ConfluenceClient(config);
      await client.searchInSpace('SPACE', 'array[0]');

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('array\\[0\\]');
    });

    it('should use title OR text pattern', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const client = new ConfluenceClient(config);
      await client.searchInSpace('SPACE', 'search');

      const url = fetchMock.mock.calls[0][0] as string;
      const decodedUrl = decodeURIComponent(url).replace(/\+/g, ' ');
      expect(decodedUrl).toContain('title ~ "search"');
      expect(decodedUrl).toContain('text ~ "search"');
    });
  });
});
