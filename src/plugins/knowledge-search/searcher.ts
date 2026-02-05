import type { SearchResult } from '../../shared/types/index.js';
import { JiraClient } from '../../shared/clients/jira-client.js';
import { ConfluenceClient } from '../../shared/clients/confluence-client.js';
import { GeminiClient } from '../../shared/clients/gemini-client.js';
import { escapeSearchQuery } from '../../shared/utils/query-escape.js';

interface KnowledgeSearchConfig {
  jira: JiraClient;
  confluence: ConfluenceClient;
  gemini: GeminiClient;
}

interface KnowledgeSearchResult {
  answer: string;
  sources: SearchResult[];
}

async function searchJiraKnowledge(jira: JiraClient, query: string): Promise<SearchResult[]> {
  const escapedQuery = escapeSearchQuery(query);
  const jql = `(summary ~ "${escapedQuery}" OR description ~ "${escapedQuery}") ORDER BY updated DESC`;
  const result = await jira.searchIssues(jql, 3);
  return result.issues.map((issue) => ({
    source: 'jira' as const,
    id: issue.key,
    title: issue.fields.summary,
    content: issue.fields.summary,
    url: issue.self,
  }));
}

async function searchConfluenceKnowledge(confluence: ConfluenceClient, query: string): Promise<SearchResult[]> {
  const result = await confluence.searchPages(query, 3);
  return result.results.map((page) => ({
    source: 'confluence' as const,
    id: page.id,
    title: page.title,
    content: page.body.storage.value.substring(0, 500),
    url: page._links.webui,
  }));
}

async function generateAnswer(gemini: GeminiClient, query: string, sources: SearchResult[]): Promise<string> {
  const context = sources.map((s) => `[${s.source}] ${s.title}: ${s.content}`).join('\n\n');
  const prompt = `Answer this question based on the following sources. Cite sources when relevant.

Question: ${query}

Sources:
${context}

Provide a helpful, concise answer:`;
  return gemini.generateText(prompt);
}

export async function searchKnowledge(config: KnowledgeSearchConfig, query: string): Promise<KnowledgeSearchResult> {
  const [jiraResults, confluenceResults] = await Promise.all([
    searchJiraKnowledge(config.jira, query),
    searchConfluenceKnowledge(config.confluence, query),
  ]);

  const sources = [...confluenceResults, ...jiraResults];
  const answer = sources.length > 0 ? await generateAnswer(config.gemini, query, sources) : 'No relevant information found.';

  return { answer, sources };
}
