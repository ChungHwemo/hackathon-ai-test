import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, CheckCircle, ExternalLink, Lightbulb } from 'lucide-react'
import { analyzeErrorLog, type ErrorLogResponse } from '@/services/error-log-api'
import { useI18n } from '@/hooks/useI18n'

export function ErrorLogSearchPage() {
  const { t } = useI18n()
  const [log, setLog] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ErrorLogResponse | null>(null)

  const handleAnalyze = async () => {
    if (!log.trim()) return
    setIsLoading(true)
    try {
      const result = await analyzeErrorLog(log)
      setAnalysis(result)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <AlertCircle className="w-7 h-7 text-[#00843D]" />
          {t('errorLog.pageTitle')}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('errorLog.pageDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('errorLog.inputTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t('errorLog.inputPlaceholder')}
            className="min-h-[150px] font-mono text-sm"
            value={log}
            onChange={(e) => setLog(e.target.value)}
          />
          <Button
            className="bg-[#00843D] hover:bg-[#006B32]"
            onClick={handleAnalyze}
            disabled={isLoading || !log.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('errorLog.analyzing')}
              </>
            ) : (
              t('errorLog.analyze')
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#00843D]" />
                {t('errorLog.classification')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">{t('errorLog.type')}</div>
                  <div className="font-semibold text-red-600">
                    {analysis.classification.type}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('errorLog.category')}</div>
                  <div className="font-semibold">
                    {analysis.classification.category}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('errorLog.severity')}</div>
                  <Badge variant="destructive">
                    {analysis.classification.severity}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('errorLog.relatedIssues')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.relatedIssues.map((issue) => (
                <div
                  key={issue.key}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {issue.key}
                    </Badge>
                    <span>{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={issue.status === t('errorLog.resolved') ? 'default' : 'secondary'}
                      className={issue.status === t('errorLog.resolved') ? 'bg-green-500' : ''}
                    >
                      {issue.status}
                    </Badge>
                    <span className="text-sm text-[#00843D] font-semibold">
                      {issue.similarity}%
                    </span>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                {t('errorLog.solutions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.solutions.map((solution, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{solution.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {solution.description}
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{solution.code}</code>
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
