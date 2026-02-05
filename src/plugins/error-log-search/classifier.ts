import type { ClassifiedError, ErrorPattern } from '../../shared/types/index.js';

const ERROR_PATTERNS: ErrorPattern[] = [
  { pattern: 'ECONNREFUSED', category: 'connection', severity: 'high' },
  { pattern: 'ETIMEDOUT', category: 'timeout', severity: 'medium' },
  { pattern: 'ENOTFOUND', category: 'dns', severity: 'high' },
  { pattern: 'ECONNRESET', category: 'connection', severity: 'medium' },
  { pattern: 'PostgreSQL', category: 'database', severity: 'high' },
  { pattern: 'MySQL', category: 'database', severity: 'high' },
  { pattern: 'ORA-', category: 'database', severity: 'high' },
  { pattern: 'OutOfMemoryError', category: 'memory', severity: 'high' },
  { pattern: 'StackOverflow', category: 'memory', severity: 'high' },
  { pattern: '401', category: 'authentication', severity: 'medium' },
  { pattern: '403', category: 'authorization', severity: 'medium' },
  { pattern: '404', category: 'not_found', severity: 'low' },
  { pattern: '500', category: 'server_error', severity: 'high' },
  { pattern: '503', category: 'service_unavailable', severity: 'high' },
  { pattern: 'NullPointerException', category: 'null_reference', severity: 'medium' },
  { pattern: 'TypeError', category: 'type_error', severity: 'medium' },
  { pattern: 'SyntaxError', category: 'syntax', severity: 'low' },
];

const DEFAULT_CLASSIFICATION: ClassifiedError = {
  category: 'unknown',
  severity: 'low',
};

export function classifyError(errorMessage: string): ClassifiedError {
  const matched = ERROR_PATTERNS.find((p) => errorMessage.includes(p.pattern));
  if (!matched) return DEFAULT_CLASSIFICATION;
  return { category: matched.category, severity: matched.severity, pattern: matched.pattern };
}

export function extractErrorContext(errorLog: string): string[] {
  const lines = errorLog.split('\n').filter((line) => line.trim().length > 0);
  return lines.slice(0, 10);
}
