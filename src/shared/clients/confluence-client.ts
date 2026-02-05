import type { ConfluenceConfig, ConfluencePage, ConfluenceSearchResult, CreateConfluencePageParams } from '../types/index.js';
import { escapeSearchQuery } from '../utils/query-escape.js';

function createAuthHeader(email: string, apiToken: string): string {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
}

export class ConfluenceClient {
  private readonly baseUrl: string;
  private readonly legacyBaseUrl: string;
  private readonly domain: string;
  private readonly headers: Record<string, string>;

  constructor(config: ConfluenceConfig) {
    this.domain = config.domain;
    this.baseUrl = `https://${config.domain}.atlassian.net/wiki/api/v2`;
    this.legacyBaseUrl = `https://${config.domain}.atlassian.net/wiki/rest/api`;
    this.headers = {
      Authorization: createAuthHeader(config.email, config.apiToken),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async searchPages(query: string, limit = 25): Promise<ConfluenceSearchResult> {
    const params = new URLSearchParams({
      title: query,
      limit: String(limit),
      'body-format': 'storage',
    });
    const response = await fetch(`${this.baseUrl}/pages?${params}`, {
      headers: this.headers,
    });
    return response.json() as Promise<ConfluenceSearchResult>;
  }

  async searchInSpace(spaceKey: string, query: string, limit = 10): Promise<Array<{ id: string; title: string; url: string; excerpt: string }>> {
    const escapedQuery = escapeSearchQuery(query);
    const cql = `space = "${spaceKey}" AND (title ~ "${escapedQuery}" OR text ~ "${escapedQuery}") ORDER BY lastModified DESC`;
    const params = new URLSearchParams({
      cql,
      limit: String(limit),
      excerpt: 'highlight',
    });
    const response = await fetch(`${this.legacyBaseUrl}/content/search?${params}`, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json() as { results: Array<{ id: string; title: string; excerpt?: string; _links: { webui: string } }> };
    return data.results.map(result => ({
      id: result.id,
      title: result.title,
      url: `https://${this.domain}.atlassian.net/wiki${result._links.webui}`,
      excerpt: result.excerpt ?? '',
    }));
  }

  async getPage(pageId: string): Promise<ConfluencePage> {
    const params = new URLSearchParams({ 'body-format': 'storage' });
    const response = await fetch(`${this.baseUrl}/pages/${pageId}?${params}`, {
      headers: this.headers,
    });
    return response.json() as Promise<ConfluencePage>;
  }

  async createPage(params: CreateConfluencePageParams): Promise<ConfluencePage> {
    const body = {
      spaceId: params.spaceId,
      title: params.title,
      parentId: params.parentId,
      body: { representation: 'storage', value: params.body },
    };
    const response = await fetch(`${this.baseUrl}/pages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json() as Promise<ConfluencePage>;
  }

  async updatePage(pageId: string, title: string, body: string, version: number): Promise<ConfluencePage> {
    const requestBody = {
      id: pageId,
      title,
      body: { representation: 'storage', value: body },
      version: { number: version + 1 },
    };
    const response = await fetch(`${this.baseUrl}/pages/${pageId}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(requestBody),
    });
    return response.json() as Promise<ConfluencePage>;
  }
}
