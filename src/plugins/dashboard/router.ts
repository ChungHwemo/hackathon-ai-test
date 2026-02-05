export type PluginType = 'jira-automation' | 'knowledge-search' | 'pr-review' | 'error-log-search';

export interface PluginRequest {
  type: PluginType;
  payload: unknown;
}

export interface PluginResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

const PLUGIN_PATTERNS: Array<{ pattern: RegExp; type: PluginType }> = [
  { pattern: /jira|ticket|issue|bug report/i, type: 'jira-automation' },
  { pattern: /search|find|where|how to|documentation/i, type: 'knowledge-search' },
  { pattern: /pr|pull request|review|code review/i, type: 'pr-review' },
  { pattern: /error|exception|log|crash|failure/i, type: 'error-log-search' },
];

export function detectPluginType(message: string): PluginType | null {
  const matched = PLUGIN_PATTERNS.find((p) => p.pattern.test(message));
  return matched?.type ?? null;
}
