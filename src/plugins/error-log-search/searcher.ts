import type { SearchResult, AggregatedSearchResult } from '../../shared/types/index.js';
import { JiraClient } from '../../shared/clients/jira-client.js';
import { ConfluenceClient } from '../../shared/clients/confluence-client.js';
import { GeminiClient } from '../../shared/clients/gemini-client.js';
import { classifyError } from './classifier.js';

interface SearcherConfig {
  jira: JiraClient;
  confluence: ConfluenceClient;
  gemini: GeminiClient;
}

async function searchJira(jira: JiraClient, query: string): Promise<SearchResult[]> {
  const jql = `text ~ "${query}" ORDER BY created DESC`;
  const result = await jira.searchIssues(jql, 5);
  return result.issues.map((issue) => ({
    source: 'jira' as const,
    id: issue.key,
    title: issue.fields.summary,
    content: issue.fields.summary,
    url: issue.self,
  }));
}

async function searchConfluence(confluence: ConfluenceClient, query: string): Promise<SearchResult[]> {
  const result = await confluence.searchPages(query, 5);
  return result.results.map((page) => ({
    source: 'confluence' as const,
    id: page.id,
    title: page.title,
    content: page.body.storage.value.substring(0, 200),
    url: page._links.webui,
  }));
}

async function generateAiSummary(gemini: GeminiClient, query: string, results: SearchResult[]): Promise<string> {
  const context = results.map((r) => `[${r.source}] ${r.title}: ${r.content}`).join('\n');
  const prompt = `Based on the error "${query}" and these related documents:
${context}

Provide a brief summary of the root cause and suggested solution in 2-3 sentences.`;
  return gemini.generateText(prompt);
}

export async function searchForError(config: SearcherConfig, errorMessage: string): Promise<AggregatedSearchResult> {
  const classified = classifyError(errorMessage);
  const searchQuery = `${classified.category} error`;

  const [jiraResults, confluenceResults] = await Promise.all([
    searchJira(config.jira, searchQuery),
    searchConfluence(config.confluence, searchQuery),
  ]);

  const allResults = [...jiraResults, ...confluenceResults];
  const aiSummary = allResults.length > 0 ? await generateAiSummary(config.gemini, errorMessage, allResults) : undefined;

  return {
    query: errorMessage,
    results: allResults,
    aiSummary,
    suggestedActions: ['View related JIRA tickets', 'Check Confluence documentation', 'Create new ticket'],
  };
}
