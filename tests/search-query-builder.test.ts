import { describe, it, expect } from 'vitest';
import {
  buildConfluenceCQL,
  buildJiraJQL,
  escapeSearchQuery,
} from '../web/src/services/search-query-builder.js';

describe('Search Query Builder', () => {
  describe('escapeSearchQuery', () => {
    it('should escape double quotes', () => {
      expect(escapeSearchQuery('test "value"')).toBe('test value');
    });

    it('should remove backslashes', () => {
      expect(escapeSearchQuery('path\\to\\file')).toBe('pathtofile');
    });

    it('should handle empty string', () => {
      expect(escapeSearchQuery('')).toBe('');
    });

    it('should preserve normal characters', () => {
      expect(escapeSearchQuery('normal query')).toBe('normal query');
    });

    it('should preserve special characters in query', () => {
      expect(escapeSearchQuery('test[value]')).toBe('test[value]');
    });

    it('should preserve colons and parentheses for CQL text search', () => {
      expect(escapeSearchQuery('ALARM: test (Tokyo)')).toBe('ALARM: test (Tokyo)');
    });

    it('should remove quotes and backslashes to prevent CQL parse errors', () => {
      const input = 'ALARM: "FIC-009" in (Tokyo)';
      const escaped = escapeSearchQuery(input);
      expect(escaped).toBe('ALARM: FIC-009 in (Tokyo)');
    });
  });

  describe('buildConfluenceCQL', () => {
    it('should search title with higher priority using OR', () => {
      const cql = buildConfluenceCQL('login');
      expect(cql).toContain('title ~ "login"');
      expect(cql).toContain('text ~ "login"');
    });

    it('should include space filter when spaceKey provided', () => {
      const cql = buildConfluenceCQL('login', { spaceKey: 'DEV' });
      expect(cql).toContain('space = "DEV"');
    });

    it('should order by lastModified DESC', () => {
      const cql = buildConfluenceCQL('test');
      expect(cql).toContain('ORDER BY lastModified DESC');
    });

    it('should remove quotes from query to prevent CQL parse errors', () => {
      const cql = buildConfluenceCQL('test "special"');
      expect(cql).toContain('test special');
    });

    it('should not include space filter when spaceKey not provided', () => {
      const cql = buildConfluenceCQL('test');
      expect(cql).not.toContain('space =');
    });
  });

  describe('buildJiraJQL', () => {
    it('should search summary and description', () => {
      const jql = buildJiraJQL('error');
      expect(jql).toContain('summary ~ "error"');
      expect(jql).toContain('description ~ "error"');
    });

    it('should include project filter when projectKey provided', () => {
      const jql = buildJiraJQL('error', { projectKey: 'KWA' });
      expect(jql).toContain('project = "KWA"');
    });

    it('should order by updated DESC', () => {
      const jql = buildJiraJQL('test');
      expect(jql).toContain('ORDER BY updated DESC');
    });

    it('should preserve brackets in query for text search', () => {
      const jql = buildJiraJQL('test [bracket]');
      expect(jql).toContain('[bracket]');
    });

    it('should not include project filter when projectKey not provided', () => {
      const jql = buildJiraJQL('test');
      expect(jql).not.toContain('project =');
    });

    it('should support text-only search mode for broader matches', () => {
      const jql = buildJiraJQL('error', { searchMode: 'text' });
      expect(jql).toContain('text ~ "error"');
      expect(jql).not.toContain('summary ~');
    });
  });
});
