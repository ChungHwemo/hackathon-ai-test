import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useI18n } from '@/hooks/useI18n'
import {
  Ticket,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  Settings,
  Database,
  FolderKanban,
  FileText,
  ExternalLink,
  Search,
} from 'lucide-react'
import {
  analyzeRequest,
  createJiraTickets,
  searchSimilarDocuments,
  type TicketDraft,
  type TicketBreakdown,
  type IssueType,
  type Priority,
  type SimilarDocument,
} from '@/services/api'

const priorityColors: Record<Priority, string> = {
  Highest: 'bg-red-600',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-blue-500',
  Lowest: 'bg-gray-400',
}

const issueTypeColors: Record<IssueType, string> = {
  Bug: 'bg-red-100 text-red-800 border-red-300',
  Task: 'bg-blue-100 text-blue-800 border-blue-300',
  Story: 'bg-green-100 text-green-800 border-green-300',
  Epic: 'bg-purple-100 text-purple-800 border-purple-300',
  'Sub-task': 'bg-gray-100 text-gray-800 border-gray-300',
}

function ConfidenceBadge({
  score,
  label,
}: {
  score: number
  label: string
}) {
  const color =
    score >= 90
      ? 'text-green-600'
      : score >= 70
        ? 'text-yellow-600'
        : 'text-red-600'
  return (
    <span className={`text-xs ${color} flex items-center gap-1`} title={label}>
      <AlertCircle className="w-3 h-3" />
      {score}%
    </span>
  )
}

interface TicketCardProps {
  ticket: TicketDraft
  isSelected: boolean
  onToggle: () => void
  isExpanded: boolean
  onExpandToggle: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

function TicketCard({
  ticket,
  isSelected,
  onToggle,
  isExpanded,
  onExpandToggle,
  t,
}: TicketCardProps) {
  const issueTypeKey = ticket.issueType.toLowerCase().replace('-', '') as
    | 'bug'
    | 'task'
    | 'story'
    | 'epic'
    | 'subtask'

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-[#00843D] bg-green-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs ${issueTypeColors[ticket.issueType]}`}
            >
              {t(`jira.issueType.${issueTypeKey}`)}
            </Badge>
            <span
              className={`w-2 h-2 rounded-full ${priorityColors[ticket.priority]}`}
              title={t(`jira.priority.${ticket.priority.toLowerCase()}`)}
            />
            <ConfidenceBadge
              score={ticket.confidenceScore}
              label={t('jira.confidence')}
            />
            {ticket.estimatedHours && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {ticket.estimatedHours}
                {t('common.hour')}
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900 mt-1">{ticket.summary}</h4>
          {ticket.labels.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {ticket.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
          <button
            onClick={onExpandToggle}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                {t('jira.hideDetails')}
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                {t('jira.showDetails')}
              </>
            )}
          </button>
          {isExpanded && (
            <pre className="text-sm bg-gray-50 p-3 rounded-lg mt-2 whitespace-pre-wrap text-gray-700 border">
              {ticket.description}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export function JiraAutomationPage() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TicketBreakdown | null>(null)
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set())
  const [expandedDrafts, setExpandedDrafts] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [similarDocs, setSimilarDocs] = useState<SimilarDocument[]>([])
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false)

  const searchConfig = {
    confluenceSpace: 'G2',
    confluenceSpaceName: 'Global Knowledge Base',
    jiraProject: 'KWA',
    jiraProjectName: 'KWA Development',
    searchLimit: 3,
  }

  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setAnalyzeError(null)
    setResult(null)
    setSimilarDocs([])
    
    try {
      const [breakdown, docs] = await Promise.all([
        analyzeRequest(input),
        (async () => {
          setIsSearchingSimilar(true)
          const results = await searchSimilarDocuments(input, searchConfig.confluenceSpace)
          setIsSearchingSimilar(false)
          return results
        })()
      ])
      setResult(breakdown)
      setSimilarDocs(docs)
      const allIds = breakdown.tickets.map((ticket) => ticket.draftId)
      setSelectedDrafts(new Set(allIds))
    } catch (error) {
      console.error('Failed to analyze request:', error)
      setAnalyzeError(
        error instanceof Error ? error.message : 'Failed to analyze request'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (draftId: string) => {
    setSelectedDrafts((prev) => {
      const next = new Set(prev)
      if (next.has(draftId)) {
        next.delete(draftId)
      } else {
        next.add(draftId)
      }
      return next
    })
  }

  const toggleExpanded = (draftId: string) => {
    setExpandedDrafts((prev) => {
      const next = new Set(prev)
      if (next.has(draftId)) {
        next.delete(draftId)
      } else {
        next.add(draftId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (!result) return
    const allIds = result.tickets.map((ticket) => ticket.draftId)
    if (selectedDrafts.size === allIds.length) {
      setSelectedDrafts(new Set())
    } else {
      setSelectedDrafts(new Set(allIds))
    }
  }

  const [isCreating, setIsCreating] = useState(false)
  const [createConfluencePages, setCreateConfluencePages] = useState(false)
  const [createdTickets, setCreatedTickets] = useState<
    Array<{ draftId: string; jiraKey: string; url: string; confluenceUrl?: string }>
  >([])
  const [createError, setCreateError] = useState<string | null>(null)

  const selectedCount = selectedDrafts.size
  const totalHours = result
    ? result.tickets
        .filter((ticket) => selectedDrafts.has(ticket.draftId))
        .reduce((sum, ticket) => sum + (ticket.estimatedHours ?? 0), 0)
    : 0

  const handleCreateTickets = async () => {
    if (!result || selectedCount === 0) return

    setIsCreating(true)
    setCreateError(null)
    setCreatedTickets([])

    const ticketsToCreate = result.tickets.filter((ticket) =>
      selectedDrafts.has(ticket.draftId)
    )

    try {
      const data = await createJiraTickets(ticketsToCreate, { createConfluencePages })
      setCreatedTickets(data.createdTickets || [])

      if (data.errors?.length > 0) {
        setCreateError(
          `${data.errors.length} ticket(s) failed to create`
        )
      }
    } catch (error) {
      console.error('Failed to create tickets:', error)
      setCreateError(
        error instanceof Error ? error.message : 'Failed to create tickets'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Ticket className="w-7 h-7 text-[#00843D]" />
          {t('jira.pageTitle')}
        </h1>
        <p className="text-gray-500 mt-1">{t('jira.pageDescription')}</p>
      </div>

      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{t('jira.confluenceSpace')}:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {searchConfig.confluenceSpace}
                </Badge>
                <span className="text-xs text-gray-400">({searchConfig.confluenceSpaceName})</span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{t('jira.jiraProject')}:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {searchConfig.jiraProject}
                </Badge>
                <span className="text-xs text-gray-400">({searchConfig.jiraProjectName})</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={t('jira.configureSearchScope')}
            >
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {showSettings && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{t('jira.settingsSampleNote')}</p>
                    <p className="text-xs text-yellow-700 mt-1">{t('jira.settingsSampleDescription')}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Confluence Space Key</label>
                        <input
                          type="text"
                          value={searchConfig.confluenceSpace}
                          disabled
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">JIRA Project Key</label>
                        <input
                          type="text"
                          value={searchConfig.jiraProject}
                          disabled
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('jira.inputTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t('jira.inputPlaceholder')}
            className="min-h-[150px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            className="bg-[#00843D] hover:bg-[#006B32]"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('jira.analyzing')}
              </>
            ) : (
              t('jira.analyzeButton')
            )}
          </Button>
        </CardContent>
      </Card>

      {analyzeError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{t('jira.createError')}: {analyzeError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-5 h-5" />
                {t('jira.analysisResult')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{result.analysisNotes}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-gray-600">
                  {t('jira.ticketCount')}:{' '}
                  <strong className="text-gray-900">
                    {result.tickets.length}
                  </strong>
                </span>
                <span className="text-gray-600">
                  {t('jira.totalHours')}:{' '}
                  <strong className="text-gray-900">
                    {result.totalEstimatedHours}
                    {t('common.hours')}
                  </strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {(similarDocs.length > 0 || isSearchingSimilar) && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                  <Search className="w-5 h-5" />
                  {t('jira.similarDocuments')} ({searchConfig.confluenceSpace})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSearchingSimilar ? (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t('jira.searchingSimilar')}</span>
                  </div>
                ) : similarDocs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-800 mb-3">
                      {t('jira.similarDocsFound', { count: similarDocs.length })}
                    </p>
                    {similarDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 truncate">{doc.title}</span>
                          </div>
                          {doc.excerpt && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.excerpt}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            {doc.similarity}%
                          </Badge>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-yellow-100 rounded"
                          >
                            <ExternalLink className="w-4 h-4 text-yellow-600" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {result.parentTicket && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                  {t('jira.parentTicket')}（
                  {t(
                    `jira.issueType.${result.parentTicket.issueType.toLowerCase()}`
                  )}
                  ）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-gray-900">
                  {result.parentTicket.summary}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('jira.groupSubtasks')}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('jira.generatedTickets')}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAll}
                    className="text-sm text-[#00843D] hover:underline"
                  >
                    {selectedDrafts.size === result.tickets.length
                      ? t('common.deselectAll')
                      : t('common.selectAll')}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedCount}
                    {t('common.items')}
                    {t('common.selected')}（{totalHours}
                    {t('common.hours')}）
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.draftId}
                  ticket={ticket}
                  isSelected={selectedDrafts.has(ticket.draftId)}
                  onToggle={() => toggleSelection(ticket.draftId)}
                  isExpanded={expandedDrafts.has(ticket.draftId)}
                  onExpandToggle={() => toggleExpanded(ticket.draftId)}
                  t={t}
                />
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <div className="flex items-center gap-2 mr-auto">
              <Checkbox 
                id="createConfluence"
                checked={createConfluencePages} 
                onCheckedChange={(checked) => setCreateConfluencePages(checked === true)} 
              />
              <label htmlFor="createConfluence" className="text-sm text-gray-700 flex items-center gap-1 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-600" />
                {t('jira.createConfluencePages')}
              </label>
            </div>
            <Button variant="outline" onClick={() => setResult(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-[#00843D] hover:bg-[#006B32]"
              disabled={selectedCount === 0 || isCreating}
              onClick={handleCreateTickets}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('jira.creating')}
                </>
              ) : (
                t('jira.createSelectedTickets', { count: selectedCount })
              )}
            </Button>
          </div>

          {createError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{t('jira.createError')}: {createError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {createdTickets.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  {t('jira.createSuccess', { count: createdTickets.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {createdTickets.map((ticket) => (
                  <div
                    key={ticket.draftId}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <span className="font-medium text-gray-900">
                      {ticket.jiraKey}
                    </span>
                    <div className="flex items-center gap-3">
                      {ticket.confluenceUrl && (
                        <a
                          href={ticket.confluenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Confluence
                        </a>
                      )}
                      <a
                        href={ticket.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00843D] hover:underline"
                      >
                        {t('jira.viewInJira')} →
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
