import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateTicketBreakdown, 
  generateEnrichedTicketBreakdown,
  detectLanguage,
  extractSearchKeywords,
} from '../src/plugins/jira-automation/ticket-generator.js';
import type { GeminiClient } from '../src/shared/clients/gemini-client.js';
import type { JiraClient } from '../src/shared/clients/jira-client.js';
import type { ConfluenceClient } from '../src/shared/clients/confluence-client.js';

describe('generateTicketBreakdown', () => {
  let mockGemini: GeminiClient;

  beforeEach(() => {
    mockGemini = {
      generateText: vi.fn(),
      chat: vi.fn(),
      classifyText: vi.fn(),
    } as unknown as GeminiClient;
  });

  it('should parse valid Gemini response into TicketBreakdown', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'Bug',
          summary: 'Fix login button not responding',
          description: '## Overview\nLogin button click handler is broken',
          priority: 'High',
          labels: ['auth', 'frontend'],
          estimatedHours: 4,
          confidenceScore: 90,
        },
        {
          issueType: 'Bug',
          summary: 'Fix password reset flow',
          description: '## Overview\nPassword reset email not sending',
          priority: 'Medium',
          labels: ['auth', 'backend'],
          estimatedHours: 6,
          confidenceScore: 85,
        },
      ],
      analysisNotes: 'Two separate auth issues identified',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(
      mockGemini,
      'Login button not working and password reset is broken'
    );

    expect(result.tickets).toHaveLength(2);
    expect(result.tickets[0].issueType).toBe('Bug');
    expect(result.tickets[0].summary).toBe('Fix login button not responding');
    expect(result.tickets[0].draftId).toMatch(/^draft-\d+-1$/);
    expect(result.tickets[1].draftId).toMatch(/^draft-\d+-2$/);
    expect(result.totalEstimatedHours).toBe(10);
    expect(result.parentTicket).toBeNull();
  });

  it('should create parent ticket for complex requests', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: {
        issueType: 'Epic',
        summary: 'Authentication System Overhaul',
        description: 'Complete auth system refactoring',
        priority: 'High',
        labels: ['auth'],
        estimatedHours: 0,
        confidenceScore: 95,
      },
      tickets: [
        {
          issueType: 'Story',
          summary: 'Implement OAuth2 login',
          description: 'Add Google/GitHub OAuth',
          priority: 'High',
          labels: ['auth'],
          estimatedHours: 16,
          confidenceScore: 88,
        },
      ],
      analysisNotes: 'Complex auth overhaul requiring parent epic',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Overhaul our auth system');

    expect(result.parentTicket).not.toBeNull();
    expect(result.parentTicket?.issueType).toBe('Epic');
    expect(result.parentTicket?.draftId).toMatch(/^draft-\d+-0$/);
  });

  it('should return fallback breakdown when Gemini response is invalid', async () => {
    vi.mocked(mockGemini.generateText).mockResolvedValue('Invalid response, not JSON');

    const message = 'Fix the login bug';
    const result = await generateTicketBreakdown(mockGemini, message);

    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0].issueType).toBe('Task');
    expect(result.tickets[0].summary).toBe(message);
    expect(result.tickets[0].confidenceScore).toBe(50);
    expect(result.analysisNotes).toContain('Fallback');
  });

  it('should validate and sanitize invalid issue types', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'InvalidType',
          summary: 'Test ticket',
          description: 'Description',
          priority: 'High',
          labels: [],
          estimatedHours: 2,
          confidenceScore: 80,
        },
      ],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Test');

    expect(result.tickets[0].issueType).toBe('Task');
  });

  it('should validate and sanitize invalid priorities', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'Bug',
          summary: 'Test ticket',
          description: 'Description',
          priority: 'SuperHigh',
          labels: [],
          estimatedHours: 2,
          confidenceScore: 80,
        },
      ],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Test');

    expect(result.tickets[0].priority).toBe('Medium');
  });

  it('should limit labels to 3 per ticket', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'Task',
          summary: 'Test ticket',
          description: 'Description',
          priority: 'Medium',
          labels: ['a', 'b', 'c', 'd', 'e'],
          estimatedHours: 2,
          confidenceScore: 80,
        },
      ],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Test');

    expect(result.tickets[0].labels).toHaveLength(3);
    expect(result.tickets[0].labels).toEqual(['a', 'b', 'c']);
  });

  it('should truncate summary to 100 characters', async () => {
    const longSummary = 'A'.repeat(150);
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'Task',
          summary: longSummary,
          description: 'Description',
          priority: 'Medium',
          labels: [],
          estimatedHours: 2,
          confidenceScore: 80,
        },
      ],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Test');

    expect(result.tickets[0].summary.length).toBe(100);
  });

  it('should store original request in breakdown', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [
        {
          issueType: 'Task',
          summary: 'Test',
          description: 'Desc',
          priority: 'Medium',
          labels: [],
          estimatedHours: 1,
          confidenceScore: 90,
        },
      ],
      analysisNotes: 'Simple task',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const originalRequest = 'Create a simple task for testing';
    const result = await generateTicketBreakdown(mockGemini, originalRequest);

    expect(result.originalRequest).toBe(originalRequest);
  });

  it('should handle Gemini response with extra text around JSON', async () => {
    const geminiResponse = `Here is the breakdown:
{
  "parentTicket": null,
  "tickets": [{"issueType": "Task", "summary": "Test", "description": "D", "priority": "Low", "labels": [], "estimatedHours": 1, "confidenceScore": 70}],
  "analysisNotes": "Parsed from mixed content"
}
Let me know if you need more details.`;

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateTicketBreakdown(mockGemini, 'Test');

    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0].summary).toBe('Test');
  });
});

describe('detectLanguage', () => {
  it('should detect Japanese text', () => {
    expect(detectLanguage('ログイン機能を実装してください')).toBe('ja');
    expect(detectLanguage('バグを修正する')).toBe('ja');
    expect(detectLanguage('テスト')).toBe('ja');
  });

  it('should detect English text', () => {
    expect(detectLanguage('Implement login feature')).toBe('en');
    expect(detectLanguage('Fix the bug')).toBe('en');
    expect(detectLanguage('Test')).toBe('en');
  });

  it('should detect Japanese when mixed with English', () => {
    expect(detectLanguage('Fix the ログイン bug')).toBe('ja');
    expect(detectLanguage('APIのエラーハンドリング')).toBe('ja');
  });
});

describe('extractSearchKeywords', () => {
  it('should extract keywords from request and summaries', () => {
    const keywords = extractSearchKeywords(
      'Implement user authentication',
      ['Add login form', 'Create auth middleware']
    );
    expect(keywords).toContain('authentication');
    expect(keywords).toContain('middleware');
  });

  it('should filter out stop words', () => {
    const keywords = extractSearchKeywords(
      'The user should be able to login',
      ['Add the login button']
    );
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('should');
    expect(keywords).not.toContain('be');
  });

  it('should handle Japanese text', () => {
    const keywords = extractSearchKeywords(
      'ログイン機能を実装する',
      ['認証ミドルウェアを追加']
    );
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should limit to 5 keywords', () => {
    const keywords = extractSearchKeywords(
      'authentication authorization validation sanitization serialization',
      ['implementation configuration initialization']
    );
    const keywordCount = keywords.split(' ').length;
    expect(keywordCount).toBeLessThanOrEqual(5);
  });
});

describe('generateEnrichedTicketBreakdown', () => {
  let mockGemini: GeminiClient;
  let mockJiraClient: JiraClient;
  let mockConfluenceClient: ConfluenceClient;

  beforeEach(() => {
    mockGemini = {
      generateText: vi.fn(),
      chat: vi.fn(),
      classifyText: vi.fn(),
    } as unknown as GeminiClient;

    mockJiraClient = {
      searchInProject: vi.fn().mockResolvedValue([
        { key: 'KWA-123', summary: 'Related issue', url: 'https://example.com/KWA-123', status: 'Open' }
      ]),
    } as unknown as JiraClient;

    mockConfluenceClient = {
      searchInSpace: vi.fn().mockResolvedValue([
        { id: '123', title: 'Related doc', url: 'https://example.com/doc', excerpt: 'Some excerpt' }
      ]),
    } as unknown as ConfluenceClient;
  });

  it('should enrich breakdown with related resources', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [{
        issueType: 'Task',
        summary: 'Implement feature',
        description: '## Overview\nImplement the feature',
        priority: 'Medium',
        labels: [],
        estimatedHours: 4,
        confidenceScore: 85,
      }],
      analysisNotes: 'Simple task',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateEnrichedTicketBreakdown(
      mockGemini,
      mockJiraClient,
      mockConfluenceClient,
      'Implement the new feature',
      {
        jiraProjectKey: 'KWA',
        confluenceSpaceKey: 'G2',
        searchResultLimit: 3,
        language: 'auto',
      }
    );

    expect(result.relatedResources.length).toBeGreaterThan(0);
    expect(result.detectedLanguage).toBe('en');
    expect(result.tickets[0].description).toContain('## Resources');
  });

  it('should detect Japanese language and use Japanese headers', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [{
        issueType: 'Task',
        summary: 'ログイン実装',
        description: '## 概要\n機能を実装する',
        priority: 'Medium',
        labels: [],
        estimatedHours: 4,
        confidenceScore: 85,
      }],
      analysisNotes: 'タスク',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateEnrichedTicketBreakdown(
      mockGemini,
      mockJiraClient,
      mockConfluenceClient,
      'ログイン機能を実装してください',
      {
        jiraProjectKey: 'KWA',
        confluenceSpaceKey: 'G2',
        searchResultLimit: 3,
        language: 'auto',
      }
    );

    expect(result.detectedLanguage).toBe('ja');
    expect(result.tickets[0].description).toContain('## 参考資料');
  });

  it('should work without Jira/Confluence clients', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [{
        issueType: 'Task',
        summary: 'Test',
        description: '## Overview\nTest',
        priority: 'Medium',
        labels: [],
        estimatedHours: 2,
        confidenceScore: 80,
      }],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);

    const result = await generateEnrichedTicketBreakdown(
      mockGemini,
      null,
      null,
      'Test task',
      {
        jiraProjectKey: 'KWA',
        confluenceSpaceKey: 'G2',
        searchResultLimit: 3,
      }
    );

    expect(result.relatedResources).toHaveLength(0);
    expect(result.tickets).toHaveLength(1);
  });

  it('should handle search errors gracefully', async () => {
    const geminiResponse = JSON.stringify({
      parentTicket: null,
      tickets: [{
        issueType: 'Task',
        summary: 'Test',
        description: '## Overview\nTest',
        priority: 'Medium',
        labels: [],
        estimatedHours: 2,
        confidenceScore: 80,
      }],
      analysisNotes: 'Test',
    });

    vi.mocked(mockGemini.generateText).mockResolvedValue(geminiResponse);
    vi.mocked(mockJiraClient.searchInProject).mockRejectedValue(new Error('API Error'));
    vi.mocked(mockConfluenceClient.searchInSpace).mockRejectedValue(new Error('API Error'));

    const result = await generateEnrichedTicketBreakdown(
      mockGemini,
      mockJiraClient,
      mockConfluenceClient,
      'Test task',
      {
        jiraProjectKey: 'KWA',
        confluenceSpaceKey: 'G2',
        searchResultLimit: 3,
      }
    );

    expect(result.relatedResources).toHaveLength(0);
    expect(result.tickets).toHaveLength(1);
  });
});
