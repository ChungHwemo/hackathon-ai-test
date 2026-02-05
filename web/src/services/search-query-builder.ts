export function escapeSearchQuery(query: string): string {
  if (!query) return '';
  
  return query
    .replace(/\\/g, '')
    .replace(/"/g, '');
}

export interface ConfluenceCQLOptions {
  spaceKey?: string;
  contentType?: 'page' | 'blogpost' | 'all';
}

export function buildConfluenceCQL(query: string, options: ConfluenceCQLOptions = {}): string {
  const escapedQuery = escapeSearchQuery(query);
  const conditions: string[] = [];
  
  if (options.spaceKey) {
    conditions.push(`space = "${options.spaceKey}"`);
  }
  
  if (options.contentType && options.contentType !== 'all') {
    conditions.push(`type = "${options.contentType}"`);
  }
  
  conditions.push(`(title ~ "${escapedQuery}" OR text ~ "${escapedQuery}")`);
  
  return `${conditions.join(' AND ')} ORDER BY lastModified DESC`;
}

export interface JiraJQLOptions {
  projectKey?: string;
  searchMode?: 'targeted' | 'text';
  status?: string;
}

export function buildJiraJQL(query: string, options: JiraJQLOptions = {}): string {
  const escapedQuery = escapeSearchQuery(query);
  const conditions: string[] = [];
  
  if (options.projectKey) {
    conditions.push(`project = "${options.projectKey}"`);
  }
  
  if (options.status) {
    conditions.push(`status = "${options.status}"`);
  }
  
  if (options.searchMode === 'text') {
    conditions.push(`text ~ "${escapedQuery}"`);
  } else {
    conditions.push(`(summary ~ "${escapedQuery}" OR description ~ "${escapedQuery}")`);
  }
  
  return `${conditions.join(' AND ')} ORDER BY updated DESC`;
}
