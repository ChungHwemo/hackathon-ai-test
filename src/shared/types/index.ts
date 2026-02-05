export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description: JiraDocument | null;
    status: { name: string };
    priority: { name: string } | null;
    assignee: { accountId: string; displayName: string } | null;
    labels: string[];
    issuetype: { name: string };
    created: string;
    updated: string;
  };
}

export interface JiraDocument {
  type: 'doc';
  version: 1;
  content: JiraDocumentContent[];
}

export interface JiraDocumentContent {
  type: 'paragraph' | 'heading' | 'bulletList' | 'orderedList';
  content?: { type: 'text'; text: string }[];
}

export interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
}

export interface CreateJiraIssueParams {
  projectKey: string;
  issueType: 'Bug' | 'Task' | 'Story' | 'Epic';
  summary: string;
  description: string;
  priority?: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  assignee?: string;
  labels?: string[];
}

export interface ConfluenceConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export interface ConfluencePage {
  id: string;
  title: string;
  spaceId: string;
  body: {
    storage: { value: string };
  };
  version: { number: number };
  _links: {
    webui: string;
    base: string;
  };
}

export interface ConfluenceSearchResult {
  results: ConfluencePage[];
  start: number;
  limit: number;
  size: number;
  _links: { next?: string };
}

export interface CreateConfluencePageParams {
  spaceId: string;
  title: string;
  body: string;
  parentId?: string;
}

export interface GitHubConfig {
  token: string;
  owner?: string;
  repo?: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  diff_url: string;
  user: { login: string };
  head: { ref: string; sha: string };
  base: { ref: string };
  created_at: string;
  updated_at: string;
}

export interface GitHubFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface GitHubReviewComment {
  path: string;
  position?: number;
  body: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ClassifiedError {
  category: string;
  severity: 'high' | 'medium' | 'low';
  pattern?: string;
}

export interface ErrorPattern {
  pattern: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SearchResult {
  source: 'jira' | 'confluence' | 'vector';
  id: string;
  title: string;
  content: string;
  url: string;
  similarity?: number;
}

export interface AggregatedSearchResult {
  query: string;
  results: SearchResult[];
  aiSummary?: string;
  suggestedActions?: string[];
}

export type IssueType = 'Bug' | 'Task' | 'Story' | 'Epic' | 'Sub-task';
export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export interface TicketDraft {
  draftId: string;
  issueType: IssueType;
  summary: string;
  description: string;
  priority: Priority;
  labels: string[];
  component?: string;
  estimatedHours?: number;
  confidenceScore: number;
}

export interface TicketBreakdown {
  originalRequest: string;
  parentTicket: TicketDraft | null;
  tickets: TicketDraft[];
  totalEstimatedHours: number;
  analysisNotes: string;
}

export interface TicketDraftEdit {
  summary?: string;
  description?: string;
  priority?: Priority;
  labels?: string[];
  component?: string;
  estimatedHours?: number;
}

export interface TicketSelection {
  draftId: string;
  selected: boolean;
  edited: boolean;
  editedDraft?: TicketDraftEdit;
}

export interface BulkCreateTicketsParams {
  projectKey: string;
  parentKey?: string;
  tickets: TicketDraft[];
}

export interface BulkCreateResult {
  success: boolean;
  createdTickets: Array<{
    draftId: string;
    jiraKey: string;
    url: string;
  }>;
  errors: Array<{
    draftId: string;
    error: string;
  }>;
}

export interface TicketGeneratorConfig {
  jiraProjectKey: string;
  confluenceSpaceKey: string;
  searchResultLimit: number;
  language?: 'ja' | 'en' | 'auto';
}

export interface RelatedResource {
  source: 'confluence' | 'jira';
  title: string;
  url: string;
  snippet?: string;
}

export interface EnrichedTicketBreakdown extends TicketBreakdown {
  relatedResources: RelatedResource[];
  detectedLanguage: 'ja' | 'en' | 'bilingual';
}
