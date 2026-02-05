import type { JiraConfig, JiraIssue, JiraSearchResult, JiraUser, CreateJiraIssueParams } from '../types/index.js';
import { escapeSearchQuery } from '../utils/query-escape.js';

export class JiraError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly isRetryable: boolean
  ) {
    super(message);
    this.name = 'JiraError';
  }
}

function createAuthHeader(email: string, apiToken: string): string {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
}

function buildJiraDocument(text: string): object {
  return {
    type: 'doc',
    version: 1,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

async function handleResponse<T>(response: Response, context: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const isRetryable = response.status === 429 || response.status >= 500;
  let errorMessage = `${context} failed: ${response.status} ${response.statusText}`;

  try {
    const errorBody = await response.json() as { errorMessages?: string[]; errors?: Record<string, string> };
    if (errorBody.errorMessages?.length) {
      errorMessage = `${context}: ${errorBody.errorMessages.join(', ')}`;
    } else if (errorBody.errors) {
      errorMessage = `${context}: ${Object.values(errorBody.errors).join(', ')}`;
    }
  } catch {
    // Use default error message if JSON parsing fails
  }

  throw new JiraError(errorMessage, response.status, isRetryable);
}

export class JiraClient {
  private readonly baseUrl: string;
  private readonly domain: string;
  private readonly headers: Record<string, string>;

  constructor(config: JiraConfig) {
    if (!config.domain?.trim()) {
      throw new JiraError('Domain is required', 0, false);
    }
    if (!config.email?.trim()) {
      throw new JiraError('Email is required', 0, false);
    }
    if (!config.apiToken?.trim()) {
      throw new JiraError('API token is required', 0, false);
    }
    this.domain = config.domain;
    this.baseUrl = `https://${config.domain}.atlassian.net/rest/api/3`;
    this.headers = {
      Authorization: createAuthHeader(config.email, config.apiToken),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async getMyself(): Promise<JiraUser> {
    const response = await fetch(`${this.baseUrl}/myself`, {
      headers: this.headers,
    });
    return handleResponse<JiraUser>(response, 'Get current user');
  }

  async searchIssues(jql: string, maxResults = 50): Promise<JiraSearchResult> {
    if (!jql?.trim()) {
      throw new JiraError('JQL query is required', 0, false);
    }
    const params = new URLSearchParams({
      jql,
      maxResults: String(maxResults),
      fields: 'summary,status,priority,assignee,labels,issuetype,created,updated',
    });
    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      headers: this.headers,
    });
    return handleResponse<JiraSearchResult>(response, 'Search issues');
  }

  async searchInProject(projectKey: string, query: string, limit = 10): Promise<Array<{ key: string; summary: string; url: string; status: string }>> {
    const escapedQuery = escapeSearchQuery(query);
    const jql = `project = "${projectKey}" AND (summary ~ "${escapedQuery}" OR description ~ "${escapedQuery}") ORDER BY updated DESC`;
    try {
      const result = await this.searchIssues(jql, limit);
      return result.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        url: `https://${this.domain}.atlassian.net/browse/${issue.key}`,
        status: issue.fields.status.name,
      }));
    } catch {
      return [];
    }
  }

  async createIssue(params: CreateJiraIssueParams): Promise<JiraIssue> {
    if (!params.projectKey?.trim()) {
      throw new JiraError('Project key is required', 0, false);
    }
    if (!params.summary?.trim()) {
      throw new JiraError('Summary is required', 0, false);
    }
    const body = {
      fields: {
        project: { key: params.projectKey },
        issuetype: { name: params.issueType },
        summary: params.summary,
        description: buildJiraDocument(params.description),
        priority: params.priority ? { name: params.priority } : undefined,
        assignee: params.assignee ? { accountId: params.assignee } : undefined,
        labels: params.labels ?? [],
      },
    };
    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return handleResponse<JiraIssue>(response, 'Create issue');
  }

  async addComment(issueKey: string, text: string): Promise<void> {
    if (!issueKey?.trim()) {
      throw new JiraError('Issue key is required', 0, false);
    }
    if (!text?.trim()) {
      throw new JiraError('Comment text is required', 0, false);
    }
    const response = await fetch(`${this.baseUrl}/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ body: buildJiraDocument(text) }),
    });
    if (!response.ok) {
      await handleResponse<void>(response, 'Add comment');
    }
  }
}
