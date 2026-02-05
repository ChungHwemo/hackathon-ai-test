import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/hooks/useI18n'
import {
  Search,
  Loader2,
  FileText,
  ExternalLink,
  Database,
  Globe,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import type { SearchResult, SearchStageStatus } from '@/types/knowledge-search'
import { useParallelSearch } from '@/hooks/useParallelSearch'

type StageName = 'internal' | 'teams' | 'web' | 'ai'

const sourceColors: Record<string, string> = {
  confluence: 'bg-blue-100 text-blue-800',
  jira: 'bg-green-100 text-green-800',
  google: 'bg-orange-100 text-orange-800',
  gemini: 'bg-purple-100 text-purple-800',
  teams: 'bg-indigo-100 text-indigo-800',
}

const stageConfig: Record<StageName, { icon: typeof Database; label: string }> = {
  internal: { icon: Database, label: 'knowledge.stage.internal' },
  teams: { icon: MessageSquare, label: 'knowledge.stage.teams' },
  web: { icon: Globe, label: 'knowledge.stage.web' },
  ai: { icon: Sparkles, label: 'knowledge.stage.ai' },
}

const StatusIcon = ({ status }: { status: SearchStageStatus }) => ({
  idle: null,
  loading: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  'no-results': <CheckCircle className="w-4 h-4 text-yellow-500" />,
}[status])

function StageIndicator({ stage, status, isActive, t }: { stage: StageName; status: SearchStageStatus; isActive: boolean; t: (key: string) => string }) {
  const config = stageConfig[stage]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive ? 'bg-[#00843D] text-white' : 'bg-gray-100 text-gray-600'}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{t(config.label)}</span>
      <StatusIcon status={status} />
    </div>
  )
}

const SourceLabel = ({ source, t }: { source: SearchResult['source']; t: (key: string) => string }) => {
  const labels: Record<SearchResult['source'], string> = {
    confluence: t('knowledge.source.confluence'),
    jira: t('knowledge.source.jira'),
    google: t('knowledge.source.web'),
    gemini: t('knowledge.source.ai'),
    teams: t('knowledge.source.teams'),
  }
  return <>{labels[source]}</>
}

const ResultBadges = ({ source, relevance, t }: { source: SearchResult['source']; relevance: number; t: (key: string) => string }) => (
  <div className="flex items-center gap-2">
    <Badge className={sourceColors[source] || 'bg-gray-100'}>
      <SourceLabel source={source} t={t} />
    </Badge>
    <Badge variant="outline" className="text-[#00843D] border-[#00843D]">
      {relevance}%
    </Badge>
  </div>
)

const ResultBody = ({ result, t }: { result: SearchResult; t: (key: string) => string }) => (
  <CardContent>
    <p className={`text-sm text-gray-600 mb-3 ${result.source === 'gemini' ? 'whitespace-pre-wrap' : ''}`}>{result.snippet}</p>
    {result.url && (
      <Button variant="outline" size="sm" asChild>
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 mr-2" />
          {t('knowledge.openLink')}
        </a>
      </Button>
    )}
  </CardContent>
)

function ResultCard({ result, t }: { result: SearchResult; t: (key: string) => string }) {
  const getCardStyle = () => {
    if (result.source === 'gemini') return 'border-purple-200 bg-purple-50/30'
    if (result.source === 'teams') return 'border-indigo-200 bg-indigo-50/30'
    return ''
  }

  const getIcon = () => {
    if (result.source === 'gemini') return <Sparkles className="w-5 h-5 text-purple-500" />
    if (result.source === 'teams') return <MessageSquare className="w-5 h-5 text-indigo-500" />
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${getCardStyle()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {getIcon()}
            <CardTitle className="text-base">{result.title}</CardTitle>
          </div>
          <ResultBadges source={result.source} relevance={result.relevance} t={t} />
        </div>
      </CardHeader>
      <ResultBody result={result} t={t} />
    </Card>
  )
}

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <span className="text-sm text-gray-500">{count}</span>
  </div>
)

const SectionLoading = () => (
  <div className="flex items-center justify-center py-6">
    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
  </div>
)

const SectionEmpty = ({ message }: { message: string }) => (
  <Card className="border-yellow-200 bg-yellow-50">
    <CardContent className="pt-6 text-center text-yellow-700">{message}</CardContent>
  </Card>
)

const TeamsSectionHeader = ({ title, count, t }: { title: string; count: number; t: (key: string) => string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <span className="text-xs text-gray-400 italic">{t('knowledge.teamsNote')}</span>
    </div>
    <span className="text-sm text-gray-500">{count}</span>
  </div>
)

const ResultsSection = ({ title, results, isLoading, emptyMessage, t }: { title: string; results: SearchResult[]; isLoading: boolean; emptyMessage: string; t: (key: string) => string }) => (
  <div className="space-y-3">
    <SectionHeader title={title} count={results.length} />
    {isLoading && <SectionLoading />}
    {!isLoading && results.length === 0 && <SectionEmpty message={emptyMessage} />}
    {!isLoading && results.length > 0 && (
      <div className="space-y-4">
        {results.map(result => <ResultCard key={result.id} result={result} t={t} />)}
      </div>
    )}
  </div>
)

const SearchHeader = ({ t }: { t: (key: string) => string }) => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
      <Search className="w-7 h-7 text-[#00843D]" />
      {t('knowledge.pageTitle')}
    </h1>
    <p className="text-gray-500 mt-1">{t('knowledge.pageDescription')}</p>
  </div>
)

const SearchControls = ({ query, onQueryChange, onSearch, isSearching, t }: { query: string; onQueryChange: (value: string) => void; onSearch: () => void; isSearching: boolean; t: (key: string) => string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex gap-3">
        <Input
          placeholder={t('knowledge.searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1"
          disabled={isSearching}
        />
        <Button className="bg-[#00843D] hover:bg-[#006B32]" onClick={onSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : t('knowledge.searchButton')}
        </Button>
      </div>
    </CardContent>
  </Card>
)

const StageProgress = ({ currentStage, stageStatus, t }: { currentStage: StageName | 'complete' | 'idle'; stageStatus: Record<StageName, SearchStageStatus>; t: (key: string) => string }) => (
  <div className="flex items-center gap-2 justify-center flex-wrap">
    <StageIndicator stage="internal" status={stageStatus.internal} isActive={currentStage === 'internal'} t={t} />
    <ChevronRight className="w-5 h-5 text-gray-400" />
    <StageIndicator stage="teams" status={stageStatus.teams} isActive={currentStage === 'teams'} t={t} />
    <ChevronRight className="w-5 h-5 text-gray-400" />
    <StageIndicator stage="web" status={stageStatus.web} isActive={currentStage === 'web'} t={t} />
    <ChevronRight className="w-5 h-5 text-gray-400" />
    <StageIndicator stage="ai" status={stageStatus.ai} isActive={currentStage === 'ai'} t={t} />
  </div>
)

const ResultsPanels = ({ currentStage, internalResults, teamsResults, webResults, aiResults, isLoadingInternal, isLoadingTeams, isLoadingWeb, isLoadingAI, t }: { currentStage: StageName | 'complete' | 'idle'; internalResults: SearchResult[]; teamsResults: SearchResult[]; webResults: SearchResult[]; aiResults: SearchResult[]; isLoadingInternal: boolean; isLoadingTeams: boolean; isLoadingWeb: boolean; isLoadingAI: boolean; t: (key: string) => string }) => (
  currentStage === 'idle' ? null : (
    <div className="space-y-6">
      <ResultsSection title={t('knowledge.section.internal')} results={internalResults} isLoading={isLoadingInternal} emptyMessage={t('knowledge.noResults')} t={t} />
      <div className="space-y-3">
        <TeamsSectionHeader title={t('knowledge.section.teams')} count={teamsResults.length} t={t} />
        {isLoadingTeams && <SectionLoading />}
        {!isLoadingTeams && teamsResults.length === 0 && <SectionEmpty message={t('knowledge.noResults')} />}
        {!isLoadingTeams && teamsResults.length > 0 && (
          <div className="space-y-4">
            {teamsResults.map(result => <ResultCard key={result.id} result={result} t={t} />)}
          </div>
        )}
      </div>
      <ResultsSection title={t('knowledge.section.web')} results={webResults} isLoading={isLoadingWeb} emptyMessage={t('knowledge.noResults')} t={t} />
      <ResultsSection title={t('knowledge.section.ai')} results={aiResults} isLoading={isLoadingAI} emptyMessage={t('knowledge.noResults')} t={t} />
    </div>
  )
)

const statusFor = (loading: boolean, results: SearchResult[]): SearchStageStatus =>
  loading ? 'loading' : results.length > 0 ? 'success' : 'no-results'

const getStageStatus = ({ internalResults, teamsResults, webResults, aiResults, isLoadingInternal, isLoadingTeams, isLoadingWeb, isLoadingAI }: { internalResults: SearchResult[]; teamsResults: SearchResult[]; webResults: SearchResult[]; aiResults: SearchResult[]; isLoadingInternal: boolean; isLoadingTeams: boolean; isLoadingWeb: boolean; isLoadingAI: boolean }) => ({
  internal: statusFor(isLoadingInternal, internalResults),
  teams: statusFor(isLoadingTeams, teamsResults),
  web: statusFor(isLoadingWeb, webResults),
  ai: statusFor(isLoadingAI, aiResults),
})

export function KnowledgeSearchPage() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const {
    internalResults,
    teamsResults,
    webResults,
    aiResults,
    isLoadingInternal,
    isLoadingTeams,
    isLoadingWeb,
    isLoadingAI,
    search,
  } = useParallelSearch()

  const [currentStage, setCurrentStage] = useState<StageName | 'complete' | 'idle'>('idle')

  const isSearching = currentStage !== 'idle' && currentStage !== 'complete'

  const stageStatus = getStageStatus({
    internalResults,
    teamsResults,
    webResults,
    aiResults,
    isLoadingInternal,
    isLoadingTeams,
    isLoadingWeb,
    isLoadingAI,
  })

  const handleSearch = async () => {
    if (!query.trim()) return
    setCurrentStage('internal')
    await search(query)
    setCurrentStage('complete')
  }

  const handleQueryChange = (value: string) => setQuery(value)

  return (
    <div className="space-y-6">
      <SearchHeader t={t} />

      <SearchControls query={query} onQueryChange={handleQueryChange} onSearch={handleSearch} isSearching={isSearching} t={t} />

      {currentStage !== 'idle' && <StageProgress currentStage={currentStage} stageStatus={stageStatus} t={t} />}

      <ResultsPanels
        currentStage={currentStage}
        internalResults={internalResults}
        teamsResults={teamsResults}
        webResults={webResults}
        aiResults={aiResults}
        isLoadingInternal={isLoadingInternal}
        isLoadingTeams={isLoadingTeams}
        isLoadingWeb={isLoadingWeb}
        isLoadingAI={isLoadingAI}
        t={t}
      />
    </div>
  )
}
