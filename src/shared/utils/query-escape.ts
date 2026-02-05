export function escapeSearchQuery(query: string): string {
  if (!query) return '';
  return query
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}
