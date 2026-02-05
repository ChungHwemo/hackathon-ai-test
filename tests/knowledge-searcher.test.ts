import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/shared/clients/jira-client.js', () => ({
  JiraClient: vi.fn().mockImplementation(() => ({
    searchIssues: vi.fn(),
  })),
}));

vi.mock('../src/shared/clients/confluence-client.js', () => ({
  ConfluenceClient: vi.fn().mockImplementation(() => ({
    searchPages: vi.fn().mockResolvedValue({ results: [] }),
  })),
}));

vi.mock('../src/shared/clients/gemini-client.js', () => ({
  GeminiClient: vi.fn().mockImplementation(() => ({
    generateText: vi.fn().mockResolvedValue('AI answer'),
  })),
}));

import { JiraClient } from '../src/shared/clients/jira-client.js';

describe('Knowledge Search - Query Building', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build JQL with summary OR description pattern', async () => {
    const mockSearchIssues = vi.fn().mockResolvedValue({ issues: [] });
    vi.mocked(JiraClient).mockImplementation(() => ({
      searchIssues: mockSearchIssues,
      searchInProject: vi.fn(),
      getMyself: vi.fn(),
      createIssue: vi.fn(),
      addComment: vi.fn(),
    }) as unknown as JiraClient);

    const { searchKnowledge } = await import('../src/plugins/knowledge-search/searcher.js');
    
    const jiraClient = new JiraClient({ domain: 'test', email: 'test@test.com', apiToken: 'token' });
    const confluenceClient = { searchPages: vi.fn().mockResolvedValue({ results: [] }) };
    const geminiClient = { generateText: vi.fn().mockResolvedValue('answer') };

    await searchKnowledge({
      jira: jiraClient as any,
      confluence: confluenceClient as any,
      gemini: geminiClient as any,
    }, 'test query');

    expect(mockSearchIssues).toHaveBeenCalled();
    const jql = mockSearchIssues.mock.calls[0][0] as string;
    expect(jql).toContain('summary ~');
    expect(jql).toContain('description ~');
  });

  it('should escape special characters in search query', async () => {
    const mockSearchIssues = vi.fn().mockResolvedValue({ issues: [] });
    vi.mocked(JiraClient).mockImplementation(() => ({
      searchIssues: mockSearchIssues,
      searchInProject: vi.fn(),
      getMyself: vi.fn(),
      createIssue: vi.fn(),
      addComment: vi.fn(),
    }) as unknown as JiraClient);

    const { searchKnowledge } = await import('../src/plugins/knowledge-search/searcher.js');
    
    const jiraClient = new JiraClient({ domain: 'test', email: 'test@test.com', apiToken: 'token' });
    const confluenceClient = { searchPages: vi.fn().mockResolvedValue({ results: [] }) };
    const geminiClient = { generateText: vi.fn().mockResolvedValue('answer') };

    await searchKnowledge({
      jira: jiraClient as any,
      confluence: confluenceClient as any,
      gemini: geminiClient as any,
    }, 'error "test"');

    expect(mockSearchIssues).toHaveBeenCalled();
    const jql = mockSearchIssues.mock.calls[0][0] as string;
    expect(jql).toContain('\\"test\\"');
  });
});
