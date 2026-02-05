import type { GitHubConfig, GitHubPullRequest, GitHubFile, GitHubReviewComment } from '../types/index.js';

export class GitHubClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers: Record<string, string>;
  private readonly owner?: string;
  private readonly repo?: string;

  constructor(config: GitHubConfig) {
    this.headers = {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    this.owner = config.owner;
    this.repo = config.repo;
  }

  private repoPath(owner?: string, repo?: string): string {
    const o = owner ?? this.owner;
    const r = repo ?? this.repo;
    if (!o || !r) throw new Error('Owner and repo are required');
    return `${this.baseUrl}/repos/${o}/${r}`;
  }

  async getPullRequest(prNumber: number, owner?: string, repo?: string): Promise<GitHubPullRequest> {
    const response = await fetch(`${this.repoPath(owner, repo)}/pulls/${prNumber}`, {
      headers: this.headers,
    });
    return response.json() as Promise<GitHubPullRequest>;
  }

  async getPullRequestFiles(prNumber: number, owner?: string, repo?: string): Promise<GitHubFile[]> {
    const response = await fetch(`${this.repoPath(owner, repo)}/pulls/${prNumber}/files`, {
      headers: this.headers,
    });
    return response.json() as Promise<GitHubFile[]>;
  }

  async getPullRequestDiff(prNumber: number, owner?: string, repo?: string): Promise<string> {
    const response = await fetch(`${this.repoPath(owner, repo)}/pulls/${prNumber}`, {
      headers: { ...this.headers, Accept: 'application/vnd.github.v3.diff' },
    });
    return response.text();
  }

  async createReview(
    prNumber: number,
    body: string,
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
    comments: GitHubReviewComment[] = [],
    owner?: string,
    repo?: string
  ): Promise<void> {
    await fetch(`${this.repoPath(owner, repo)}/pulls/${prNumber}/reviews`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ body, event, comments }),
    });
  }
}
