import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPageTitle,
  buildPageContent,
  createConfluencePage,
  searchRelatedPages,
  buildDescriptionWithLinks,
  findPageByTitle,
  updateConfluencePage,
  upsertConfluencePage,
} from '../web/src/services/confluence-integration.js';

describe('JIRA-Confluence Integration', () => {
  const baseConfig = {
    domain: 'example',
    email: 'user@example.com',
    apiToken: 'token',
    spaceId: 'SPACE_ID',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createConfluencePage', () => {
    it('should create page with correct title format', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', title: '[JIRA-1] Test', _links: { webui: '/wiki/test' } }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await createConfluencePage(
        baseConfig,
        buildPageTitle('JIRA-1', 'Test'),
        buildPageContent('Desc')
      );

      const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { title: string };
      expect(body.title).toBe('[JIRA-1] Test');
    });

    it('should return page URL on success', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', title: 'Title', _links: { webui: '/wiki/test' } }),
      }));

      const result = await createConfluencePage(
        baseConfig,
        'Title',
        'Content'
      );

      expect(result.url).toBe('https://example.atlassian.net/wiki/wiki/test');
    });
  });
  
  describe('searchRelatedConfluencePages', () => {
    it('should search using ticket keywords', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await searchRelatedPages(baseConfig, ['login', 'auth']);

      const url = fetchMock.mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain('text~"login"');
    });

    it('should return empty array when no matches', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      }));

      const result = await searchRelatedPages(baseConfig, ['none']);

      expect(result).toEqual([]);
    });
  });
  
  describe('buildDescriptionWithLinks', () => {
    it('should append Confluence page link', () => {
      const result = buildDescriptionWithLinks(
        'Original',
        'https://example.com/page',
        []
      );
      expect(result).toContain('https://example.com/page');
    });

    it('should append related documents section', () => {
      const result = buildDescriptionWithLinks(
        'Original',
        'https://example.com/page',
        [{ id: '1', title: 'Doc', url: 'https://example.com/doc' }]
      );
      expect(result).toContain('Related Documents');
      expect(result).toContain('https://example.com/doc');
    });
  });

  describe('upsertConfluencePage', () => {
    it('should create page when no existing page found', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '1', title: 'New', _links: { webui: '/wiki/new' } }),
        });
      vi.stubGlobal('fetch', fetchMock);

      const result = await upsertConfluencePage(baseConfig, 'New', 'Content');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('1');
    });

    it('should update page when existing page found', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [{ id: '99', title: 'Existing', version: { number: 5 }, _links: { webui: '/wiki/existing' } }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '99', title: 'Existing', _links: { webui: '/wiki/existing' } }),
        });
      vi.stubGlobal('fetch', fetchMock);

      const result = await upsertConfluencePage(baseConfig, 'Existing', 'Updated content');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const updateCall = fetchMock.mock.calls[1];
      expect(updateCall[1].method).toBe('PUT');
      const body = JSON.parse(updateCall[1].body as string) as { version: { number: number } };
      expect(body.version.number).toBe(6);
      expect(result.id).toBe('99');
    });
  });

  describe('findPageByTitle', () => {
    it('should return null when no page matches', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      }));

      const result = await findPageByTitle(baseConfig, 'NonExistent');

      expect(result).toBeNull();
    });

    it('should return page data when title matches exactly', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ id: '42', title: 'ExactMatch', version: { number: 3 }, _links: { webui: '/wiki/match' } }],
        }),
      }));

      const result = await findPageByTitle(baseConfig, 'ExactMatch');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('42');
      expect(result?.version.number).toBe(3);
    });
  });

  describe('updateConfluencePage', () => {
    it('should increment version number', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', title: 'Updated', _links: { webui: '/wiki/updated' } }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await updateConfluencePage(baseConfig, '1', 'Updated', 'New content', 10);

      const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { version: { number: number } };
      expect(body.version.number).toBe(11);
    });

    it('should use PUT method', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', title: 'Updated', _links: { webui: '/wiki/updated' } }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await updateConfluencePage(baseConfig, '1', 'Updated', 'New content', 5);

      expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
    });
  });
});
