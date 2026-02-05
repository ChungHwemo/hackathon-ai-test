import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  GitPullRequest,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  TrendingUp,
  Shield,
  GitMerge,
  ExternalLink,
  Activity,
  Zap,
  FileCode,
  ArrowRight,
} from 'lucide-react'
import { reviewPullRequest, type PRReviewResponse } from '@/services/pr-review-api'
import { useI18n } from '@/hooks/useI18n'

export function PrReviewPage() {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [review, setReview] = useState<PRReviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mockStats = {
    activePRs: 12,
    avgMergeTime: locale === 'ja' ? '42分' : '42min',
    qualityRate: 94,
    complexityIssues: 3,
  }

  const mockRecentPRs = [
    {
      id: 'PR-1024',
      title: 'feat(auth): add JWT token refresh mechanism',
      author: 'jdoe',
      branch: 'feat/jwt-refresh',
      hoursAgo: 2,
      complexity: 'high' as const,
    },
    {
      id: 'PR-1025',
      title: 'refactor(ui): clean up button components',
      author: 'smith_dev',
      branch: 'refactor/buttons',
      hoursAgo: 2,
      complexity: 'low' as const,
    },
    {
      id: 'PR-1023',
      title: 'fix(api): handle null response in user endpoint',
      author: 'alice_k',
      branch: 'fix/null-response',
      hoursAgo: 5,
      complexity: 'medium' as const,
    },
  ]

  const githubActionSnippet = `- uses: devflow-ai/action@v1
  with:
    api-key: \${{ secrets.DF_KEY }}`

  const handleReview = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    setReview(null)

    try {
      const result = await reviewPullRequest(url)
      setReview(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">{t('prReview.review.severity.error')}</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">{t('prReview.review.severity.warning')}</Badge>
      default:
        return <Badge variant="secondary">{t('prReview.review.severity.info')}</Badge>
    }
  }

  const getComplexityBadge = (complexity: 'high' | 'medium' | 'low') => {
    switch (complexity) {
      case 'high':
        return <Badge variant="destructive">{t('prReview.recentPRs.highComplexity')}</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">{t('prReview.recentPRs.mediumComplexity')}</Badge>
      default:
        return <Badge className="bg-green-500 text-white">{t('prReview.recentPRs.lowComplexity')}</Badge>
    }
  }

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'APPROVE':
        return <Badge className="bg-green-500 text-white">{t('prReview.review.recommendation.APPROVE')}</Badge>
      case 'REQUEST_CHANGES':
        return <Badge variant="destructive">{t('prReview.review.recommendation.REQUEST_CHANGES')}</Badge>
      default:
        return <Badge variant="secondary">{t('prReview.review.recommendation.COMMENT')}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <GitPullRequest className="w-7 h-7 text-[#00843D]" />
          {t('prReview.pageTitle')}
        </h1>
        <p className="text-gray-500 mt-1">{t('prReview.pageDescription')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('prReview.stats.activePRs')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.activePRs}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('prReview.stats.weeklyChange')} +2.1%
                </p>
              </div>
              <GitPullRequest className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('prReview.stats.avgMergeTime')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.avgMergeTime}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('prReview.stats.weeklyChange')} +2.1%
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('prReview.stats.qualityRate')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.qualityRate}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('prReview.stats.weeklyChange')} +2.1%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('prReview.stats.complexityIssues')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.complexityIssues}</p>
                <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t('prReview.stats.weeklyChange')} +2.1%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent PRs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('prReview.recentPRs.title')}</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                {t('prReview.recentPRs.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <GitMerge className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pr.title}</p>
                      <p className="text-sm text-gray-500">
                        {pr.id} • {pr.author} • {pr.branch}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getComplexityBadge(pr.complexity)}
                    <span className="text-sm text-gray-400">
                      {t('prReview.time.hoursAgo', { count: pr.hoursAgo })}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Insights Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('prReview.insights.aiReview')}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('prReview.insights.aiReviewDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('prReview.insights.commitConsistency')}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('prReview.insights.commitConsistencyDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PR Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-[#00843D]" />
                {t('prReview.review.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder={t('prReview.review.urlPlaceholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  className="bg-[#00843D] hover:bg-[#006B32]"
                  onClick={handleReview}
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('prReview.review.analyzing')}
                    </>
                  ) : (
                    t('prReview.review.startReview')
                  )}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Results */}
          {review && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00843D]" />
                      {t('prReview.review.result')}: {review.pr.title}
                    </div>
                    {getRecommendationBadge(review.review.recommendation)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{review.review.summary}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">{t('prReview.review.filesChanged')}: </span>
                      <span className="font-semibold">{review.pr.filesChanged}</span>
                    </div>
                    <div>
                      <span className="text-green-600">+{review.pr.additions}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600">-{review.pr.deletions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('prReview.review.complexityScore')}: </span>
                      <span className="font-semibold">{review.review.complexityScore}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {review.review.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t('prReview.review.issuesFound')} ({t('prReview.review.issuesCount', { count: review.review.issues.length })})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {review.review.issues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(issue.severity)}
                          {getSeverityBadge(issue.severity)}
                          <span className="text-sm text-gray-500">
                            {issue.path}:{issue.line}
                          </span>
                        </div>
                        <p className="font-medium">{issue.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {review.review.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('prReview.review.suggestions')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {review.review.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#00843D] mt-0.5" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('prReview.quickStart.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('prReview.quickStart.description')}
              </p>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                <pre>{githubActionSnippet}</pre>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('prReview.quickStart.viewDocs')}
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('prReview.systemStatus.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{t('prReview.systemStatus.githubWebhook')}</span>
                </div>
                <Badge className="bg-green-500 text-white">{t('prReview.systemStatus.active')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{t('prReview.systemStatus.aiWorkerNodes')}</span>
                </div>
                <span className="text-sm text-gray-600">4 {t('prReview.time.running')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
