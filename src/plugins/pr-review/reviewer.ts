import { GeminiClient } from '../../shared/clients/gemini-client.js';
import { GitHubClient } from '../../shared/clients/github-client.js';
import type { GitHubFile, GitHubReviewComment } from '../../shared/types/index.js';

export interface ReviewResult {
  summary: string;
  comments: GitHubReviewComment[];
  recommendation: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  complexityScore: number;
}

const REVIEW_PROMPT = `Review this code diff and provide feedback in JSON format:
{
  "summary": "Overall review summary",
  "issues": [{"path": "file.ts", "line": 1, "message": "Issue description", "severity": "error|warning|info"}],
  "recommendation": "APPROVE|REQUEST_CHANGES|COMMENT",
  "complexityScore": 1-10
}

Focus on:
1. Security vulnerabilities
2. Performance issues
3. Code complexity (CC>10, CoC>15 are bad)
4. Best practices violations
5. Potential bugs

Diff:
`;

function parseReviewResponse(response: string): ReviewResult {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { summary: 'Unable to parse review', comments: [], recommendation: 'COMMENT', complexityScore: 5 };
  }
  const parsed = JSON.parse(jsonMatch[0]) as {
    summary: string;
    issues?: { path: string; line?: number; message: string }[];
    recommendation?: string;
    complexityScore?: number;
  };
  const comments: GitHubReviewComment[] = (parsed.issues ?? []).map((issue) => ({
    path: issue.path,
    line: issue.line,
    body: issue.message,
  }));
  const recommendation = (['APPROVE', 'REQUEST_CHANGES', 'COMMENT'].includes(parsed.recommendation ?? '') 
    ? parsed.recommendation 
    : 'COMMENT') as 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  return {
    summary: parsed.summary,
    comments,
    recommendation,
    complexityScore: parsed.complexityScore ?? 5,
  };
}

export async function reviewPullRequest(
  gemini: GeminiClient,
  github: GitHubClient,
  prNumber: number,
  owner?: string,
  repo?: string
): Promise<ReviewResult> {
  const diff = await github.getPullRequestDiff(prNumber, owner, repo);
  const response = await gemini.generateText(REVIEW_PROMPT + diff.substring(0, 10000));
  return parseReviewResponse(response);
}

export function calculateComplexity(files: GitHubFile[]): number {
  const totalChanges = files.reduce((sum, f) => sum + f.additions + f.deletions, 0);
  if (totalChanges > 500) return 10;
  if (totalChanges > 200) return 7;
  if (totalChanges > 100) return 5;
  if (totalChanges > 50) return 3;
  return 1;
}
