export interface ConfluencePageResult {
  id: string;
  title: string;
  url: string;
}

export interface ConfluenceIntegrationConfig {
  domain: string;
  email: string;
  apiToken: string;
  spaceId: string;
}

export function buildPageTitle(jiraKey: string, summary: string): string {
  return `[${jiraKey}] ${summary}`;
}

const ACCEPTANCE_CRITERIA_HTML = '<h3>Acceptance Criteria</h3><ul><li>Criterion 1</li><li>Criterion 2</li></ul>';

const DESCRIPTION_LABEL = 'Confluence Page';
const RELATED_LABEL = 'Related Documents';

export function buildPageContent(description: string): string {
  return `<p>${description}</p>${ACCEPTANCE_CRITERIA_HTML}`;
}

function createAuthHeader(email: string, apiToken: string): string {
  return `Basic ${btoa(`${email}:${apiToken}`)}`;
}

function buildConfluenceUrl(domain: string, webui: string): string {
  return `https://${domain}.atlassian.net/wiki${webui}`;
}

function getHeaders(config: ConfluenceIntegrationConfig): Record<string, string> {
  return {
    Authorization: createAuthHeader(config.email, config.apiToken),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function buildCreatePageBody(config: ConfluenceIntegrationConfig, title: string, content: string): string {
  return JSON.stringify({
    spaceId: config.spaceId,
    title,
    body: { representation: 'storage', value: content },
  });
}

function parsePageResponse(
  config: ConfluenceIntegrationConfig,
  data: { id: string; title: string; _links: { webui: string } }
): ConfluencePageResult {
  return {
    id: data.id,
    title: data.title,
    url: buildConfluenceUrl(config.domain, data._links.webui),
  };
}

export async function createConfluencePage(
  config: ConfluenceIntegrationConfig,
  title: string,
  content: string
): Promise<ConfluencePageResult> {
  const response = await fetch(`https://${config.domain}.atlassian.net/wiki/api/v2/pages`, {
    method: 'POST',
    headers: getHeaders(config),
    body: buildCreatePageBody(config, title, content),
  });

  if (!response.ok) {
    throw new Error('Confluence page creation failed');
  }

  const data = await response.json() as { id: string; title: string; _links: { webui: string } };
  return parsePageResponse(config, data);
}

function buildSearchUrl(config: ConfluenceIntegrationConfig, query: string): string {
  const params = new URLSearchParams({
    cql: `text~\"${query}\"`,
  });
  return `https://${config.domain}.atlassian.net/wiki/rest/api/content/search?${params}`;
}

function mapSearchResults(
  config: ConfluenceIntegrationConfig,
  results: Array<{ id: string; title: string; _links: { webui: string } }>
): ConfluencePageResult[] {
  return results.map((result) => ({
    id: result.id,
    title: result.title,
    url: buildConfluenceUrl(config.domain, result._links.webui),
  }));
}

export async function searchRelatedPages(
  config: ConfluenceIntegrationConfig,
  keywords: string[]
): Promise<ConfluencePageResult[]> {
  if (keywords.length === 0) {
    return [];
  }

  const response = await fetch(buildSearchUrl(config, keywords[0]), { headers: getHeaders(config) });

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as { results: Array<{ id: string; title: string; _links: { webui: string } }> };
  return mapSearchResults(config, data.results);
}

function buildRelatedSection(pages: ConfluencePageResult[]): string {
  if (pages.length === 0) {
    return '';
  }

  const items = pages.map((page) => `- ${page.title}: ${page.url}`).join('\n');
  return `\n\n${RELATED_LABEL}\n${items}`;
}

export function buildDescriptionWithLinks(
  original: string,
  pageUrl: string,
  relatedPages: ConfluencePageResult[]
): string {
  const pageLine = `\n\n${DESCRIPTION_LABEL}: ${pageUrl}`;
  return `${original}${pageLine}${buildRelatedSection(relatedPages)}`;
}

interface ConfluencePageData {
  id: string;
  title: string;
  version: { number: number };
  _links: { webui: string };
}

export async function findPageByTitle(
  config: ConfluenceIntegrationConfig,
  title: string
): Promise<ConfluencePageData | null> {
  const params = new URLSearchParams({ title, limit: '1' });
  const url = `https://${config.domain}.atlassian.net/wiki/api/v2/pages?${params}`;
  const response = await fetch(url, { headers: getHeaders(config) });

  if (!response.ok) return null;

  const data = await response.json() as { results: ConfluencePageData[] };
  return data.results.find((p) => p.title === title) ?? null;
}

export async function updateConfluencePage(
  config: ConfluenceIntegrationConfig,
  pageId: string,
  title: string,
  content: string,
  currentVersion: number
): Promise<ConfluencePageResult> {
  const url = `https://${config.domain}.atlassian.net/wiki/api/v2/pages/${pageId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(config),
    body: JSON.stringify({
      id: pageId,
      title,
      body: { representation: 'storage', value: content },
      version: { number: currentVersion + 1 },
    }),
  });

  if (!response.ok) {
    throw new Error('Confluence page update failed');
  }

  const data = await response.json() as ConfluencePageData;
  return {
    id: data.id,
    title: data.title,
    url: buildConfluenceUrl(config.domain, data._links.webui),
  };
}

export async function upsertConfluencePage(
  config: ConfluenceIntegrationConfig,
  title: string,
  content: string
): Promise<ConfluencePageResult> {
  const existingPage = await findPageByTitle(config, title);

  if (existingPage) {
    return updateConfluencePage(
      config,
      existingPage.id,
      title,
      content,
      existingPage.version.number
    );
  }

  return createConfluencePage(config, title, content);
}
