import type {
  TicketDraft,
  TicketBreakdown,
  IssueType,
  Priority,
  TicketGeneratorConfig,
  RelatedResource,
  EnrichedTicketBreakdown,
} from '../../shared/types/index.js';
import { GeminiClient } from '../../shared/clients/gemini-client.js';
import { JiraClient } from '../../shared/clients/jira-client.js';
import { ConfluenceClient } from '../../shared/clients/confluence-client.js';

const SECTION_HEADERS = {
  ja: {
    overview: '## 概要',
    acceptanceCriteria: '## 受け入れ条件',
    technicalNotes: '## 技術的備考',
    outOfScope: '## 対象外',
    dependencies: '## 依存関係',
    resources: '## 参考資料',
    testScenarios: '## テストシナリオ',
  },
  en: {
    overview: '## Overview',
    acceptanceCriteria: '## Acceptance Criteria',
    technicalNotes: '## Technical Notes',
    outOfScope: '## Out of Scope',
    dependencies: '## Dependencies',
    resources: '## Resources',
    testScenarios: '## Test Scenarios',
  },
};

function createBreakdownPrompt(language: 'ja' | 'en'): string {
  const headers = SECTION_HEADERS[language];
  const langInstruction = language === 'ja' 
    ? 'Output all text in Japanese (日本語で出力してください).'
    : 'Output all text in English.';

  return `You are a JIRA ticket breakdown expert. Analyze the request and break it down into atomic, actionable tickets.

${langInstruction}

RULES:
1. Each ticket should represent ONE clear deliverable (2-8 hours of work)
2. Classify each ticket: Bug (defect), Task (technical work), Story (user value), Epic (grouping)
3. Set appropriate priority based on impact and urgency
4. Extract relevant labels (max 3 per ticket)
5. If the request is complex, create a parent Epic/Story with sub-tickets
6. For simple requests, just return individual tickets without parent

DESCRIPTION FORMAT (use these exact section headers):
${headers.overview}
Brief description of what this ticket accomplishes.

${headers.acceptanceCriteria}
- [ ] Criterion 1
- [ ] Criterion 2

${headers.technicalNotes}
- Implementation considerations
- Related code areas or modules
- Technical approach suggestions

${headers.outOfScope}
- What is NOT included in this ticket
- Future considerations deferred

${headers.dependencies}
- Prerequisite tickets or tasks
- External dependencies

${headers.testScenarios}
- Test case 1
- Test case 2

OUTPUT FORMAT (strict JSON):
{
  "parentTicket": null | {
    "issueType": "Epic" | "Story",
    "summary": "...",
    "description": "...",
    "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
    "labels": ["..."],
    "estimatedHours": 0,
    "confidenceScore": 85
  },
  "tickets": [
    {
      "issueType": "Bug" | "Task" | "Story" | "Sub-task",
      "summary": "Brief title (max 80 chars)",
      "description": "Use the section format above",
      "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
      "labels": ["frontend", "auth"],
      "component": "optional-module-name",
      "estimatedHours": 4,
      "confidenceScore": 90
    }
  ],
  "analysisNotes": "Brief explanation of the breakdown logic"
}

REQUEST:
`;
}

function createBilingualBreakdownPrompt(): string {
  const jaHeaders = SECTION_HEADERS['ja'];
  const enHeaders = SECTION_HEADERS['en'];

  return `You are a JIRA ticket breakdown expert. Analyze the request and break it down into atomic, actionable tickets.

IMPORTANT: Output BILINGUAL content (Japanese + English) for each ticket.

RULES:
1. Each ticket should represent ONE clear deliverable (2-8 hours of work)
2. Classify each ticket: Bug (defect), Task (technical work), Story (user value), Epic (grouping)
3. Set appropriate priority based on impact and urgency
4. Extract relevant labels (max 3 per ticket)
5. If the request is complex, create a parent Epic/Story with sub-tickets
6. For simple requests, just return individual tickets without parent

DESCRIPTION FORMAT (BILINGUAL - use these exact section headers):
---
# 🇯🇵 日本語 / Japanese
${jaHeaders.overview}
Brief description in Japanese.

${jaHeaders.acceptanceCriteria}
- [ ] 条件1
- [ ] 条件2

${jaHeaders.technicalNotes}
- 技術的な考慮事項

${jaHeaders.outOfScope}
- 対象外の項目

${jaHeaders.dependencies}
- 依存関係

${jaHeaders.testScenarios}
- テストケース1

---
# 🇺🇸 English
${enHeaders.overview}
Brief description in English.

${enHeaders.acceptanceCriteria}
- [ ] Criterion 1
- [ ] Criterion 2

${enHeaders.technicalNotes}
- Implementation considerations

${enHeaders.outOfScope}
- What is NOT included

${enHeaders.dependencies}
- Dependencies

${enHeaders.testScenarios}
- Test case 1

OUTPUT FORMAT (strict JSON):
{
  "parentTicket": null | {
    "issueType": "Epic" | "Story",
    "summary": "Japanese summary / English summary",
    "description": "BILINGUAL description using format above",
    "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
    "labels": ["..."],
    "estimatedHours": 0,
    "confidenceScore": 85
  },
  "tickets": [
    {
      "issueType": "Bug" | "Task" | "Story" | "Sub-task",
      "summary": "日本語タイトル / English Title (max 80 chars)",
      "description": "BILINGUAL description using format above",
      "priority": "High" | "Medium" | "Low" | "Highest" | "Lowest",
      "labels": ["frontend", "auth"],
      "component": "optional-module-name",
      "estimatedHours": 4,
      "confidenceScore": 90
    }
  ],
  "analysisNotes": "Brief explanation of the breakdown logic (in English)"
}

REQUEST:
`;
}

interface GeminiBreakdownResponse {
  parentTicket: Omit<TicketDraft, 'draftId'> | null;
  tickets: Array<Omit<TicketDraft, 'draftId'>>;
  analysisNotes: string;
}

function generateDraftId(index: number): string {
  return `draft-${Date.now()}-${index}`;
}

function assignDraftIds(response: GeminiBreakdownResponse): TicketBreakdown {
  const parentTicket = response.parentTicket
    ? { ...response.parentTicket, draftId: generateDraftId(0) }
    : null;

  const tickets = response.tickets.map((ticket, index) => ({
    ...ticket,
    draftId: generateDraftId(index + 1),
  }));

  const totalEstimatedHours = tickets.reduce(
    (sum, t) => sum + (t.estimatedHours ?? 0),
    0
  );

  return {
    originalRequest: '',
    parentTicket,
    tickets,
    totalEstimatedHours,
    analysisNotes: response.analysisNotes,
  };
}

function createFallbackBreakdown(message: string): TicketBreakdown {
  return {
    originalRequest: message,
    parentTicket: null,
    tickets: [
      {
        draftId: generateDraftId(1),
        issueType: 'Task',
        summary: message.substring(0, 80),
        description: message,
        priority: 'Medium',
        labels: [],
        estimatedHours: 4,
        confidenceScore: 50,
      },
    ],
    totalEstimatedHours: 4,
    analysisNotes: 'Fallback: Could not parse response',
  };
}

function parseGeminiResponse(response: string): GeminiBreakdownResponse | null {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]) as GeminiBreakdownResponse;
  } catch {
    return null;
  }
}

function validateTicketDraft(draft: Omit<TicketDraft, 'draftId'>): Omit<TicketDraft, 'draftId'> {
  const validIssueTypes: IssueType[] = ['Bug', 'Task', 'Story', 'Epic', 'Sub-task'];
  const validPriorities: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

  return {
    issueType: validIssueTypes.includes(draft.issueType) ? draft.issueType : 'Task',
    summary: String(draft.summary ?? '').substring(0, 100),
    description: String(draft.description ?? ''),
    priority: validPriorities.includes(draft.priority) ? draft.priority : 'Medium',
    labels: Array.isArray(draft.labels) ? draft.labels.slice(0, 3) : [],
    component: draft.component,
    estimatedHours: typeof draft.estimatedHours === 'number' ? draft.estimatedHours : 4,
    confidenceScore: typeof draft.confidenceScore === 'number' ? draft.confidenceScore : 70,
  };
}

function validateBreakdownResponse(response: GeminiBreakdownResponse): GeminiBreakdownResponse {
  return {
    parentTicket: response.parentTicket
      ? validateTicketDraft(response.parentTicket) as Omit<TicketDraft, 'draftId'>
      : null,
    tickets: response.tickets.map(validateTicketDraft),
    analysisNotes: String(response.analysisNotes ?? ''),
  };
}

export function detectLanguage(text: string): 'ja' | 'en' {
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japanesePattern.test(text) ? 'ja' : 'en';
}

export function detectBilingualRequest(text: string): boolean {
  const bilingualPatterns = [
    /英語でも/i,
    /英語も/i,
    /英訳も/i,
    /in english/i,
    /english too/i,
    /also in english/i,
    /bilingual/i,
    /both languages/i,
  ];
  return bilingualPatterns.some(pattern => pattern.test(text));
}

export function extractSearchKeywords(originalRequest: string, summaries: string[]): string {
  const combinedText = [originalRequest, ...summaries].join(' ');
  
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where', 'what', 'which',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'this', 'that', 'these', 'those', 'it', 'its',
    'の', 'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'や', 'から', 'まで', 'より',
  ]);

  const words = combinedText
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const uniqueKeywords = [...new Set(words)]
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);

  return uniqueKeywords.join(' ');
}

async function searchRelatedResources(
  jiraClient: JiraClient | null,
  confluenceClient: ConfluenceClient | null,
  config: TicketGeneratorConfig,
  keywords: string
): Promise<RelatedResource[]> {
  const resources: RelatedResource[] = [];
  const limit = config.searchResultLimit;

  if (confluenceClient && config.confluenceSpaceKey) {
    try {
      const confluenceResults = await confluenceClient.searchInSpace(
        config.confluenceSpaceKey,
        keywords,
        limit
      );
      for (const result of confluenceResults) {
        resources.push({
          source: 'confluence',
          title: result.title,
          url: result.url,
          snippet: result.excerpt.substring(0, 200),
        });
      }
    } catch {
      /* ignore search errors */
    }
  }

  if (jiraClient && config.jiraProjectKey) {
    try {
      const jiraResults = await jiraClient.searchInProject(
        config.jiraProjectKey,
        keywords,
        limit
      );
      for (const result of jiraResults) {
        resources.push({
          source: 'jira',
          title: `[${result.key}] ${result.summary}`,
          url: result.url,
          snippet: `Status: ${result.status}`,
        });
      }
    } catch {
      /* ignore search errors */
    }
  }

  return resources;
}

function formatResourcesSection(resources: RelatedResource[], language: 'ja' | 'en'): string {
  if (resources.length === 0) return '';

  const header = SECTION_HEADERS[language].resources;
  const lines = [header];

  for (const resource of resources) {
    const sourceLabel = resource.source === 'confluence' ? '📄 Confluence' : '🎫 Jira';
    lines.push(`- ${sourceLabel}: [${resource.title}](${resource.url})`);
    if (resource.snippet) {
      lines.push(`  > ${resource.snippet}`);
    }
  }

  return lines.join('\n');
}

function enrichTicketDescriptions(
  breakdown: TicketBreakdown,
  resources: RelatedResource[],
  language: 'ja' | 'en'
): TicketBreakdown {
  if (resources.length === 0) return breakdown;

  const resourcesSection = formatResourcesSection(resources, language);
  const resourcesHeader = SECTION_HEADERS[language].resources;

  const enrichDescription = (description: string): string => {
    if (description.includes(resourcesHeader)) {
      return description;
    }
    return `${description}\n\n${resourcesSection}`;
  };

  return {
    ...breakdown,
    parentTicket: breakdown.parentTicket
      ? { ...breakdown.parentTicket, description: enrichDescription(breakdown.parentTicket.description) }
      : null,
    tickets: breakdown.tickets.map(ticket => ({
      ...ticket,
      description: enrichDescription(ticket.description),
    })),
  };
}

export async function generateTicketBreakdown(
  gemini: GeminiClient,
  message: string
): Promise<TicketBreakdown> {
  const language = detectLanguage(message);
  const prompt = createBreakdownPrompt(language);
  const response = await gemini.generateText(prompt + message);
  const parsed = parseGeminiResponse(response);

  if (!parsed) {
    return createFallbackBreakdown(message);
  }

  const validated = validateBreakdownResponse(parsed);
  const breakdown = assignDraftIds(validated);
  breakdown.originalRequest = message;

  return breakdown;
}

export async function generateEnrichedTicketBreakdown(
  gemini: GeminiClient,
  jiraClient: JiraClient | null,
  confluenceClient: ConfluenceClient | null,
  message: string,
  config: TicketGeneratorConfig
): Promise<EnrichedTicketBreakdown> {
  const isBilingual = detectBilingualRequest(message);
  
  const language = config.language === 'auto' || !config.language
    ? detectLanguage(message)
    : config.language;

  const prompt = isBilingual 
    ? createBilingualBreakdownPrompt()
    : createBreakdownPrompt(language);
  
  const response = await gemini.generateText(prompt + message);
  const parsed = parseGeminiResponse(response);

  let breakdown: TicketBreakdown;
  if (!parsed) {
    breakdown = createFallbackBreakdown(message);
  } else {
    const validated = validateBreakdownResponse(parsed);
    breakdown = assignDraftIds(validated);
    breakdown.originalRequest = message;
  }

  const summaries = breakdown.tickets.map(t => t.summary);
  if (breakdown.parentTicket) {
    summaries.push(breakdown.parentTicket.summary);
  }
  const keywords = extractSearchKeywords(message, summaries);

  const relatedResources = await searchRelatedResources(
    jiraClient,
    confluenceClient,
    config,
    keywords
  );

  const enrichedBreakdown = enrichTicketDescriptions(breakdown, relatedResources, language);

  return {
    ...enrichedBreakdown,
    relatedResources,
    detectedLanguage: isBilingual ? 'bilingual' as 'ja' | 'en' : language,
  };
}

export { TicketBreakdown, TicketDraft, EnrichedTicketBreakdown, RelatedResource };
