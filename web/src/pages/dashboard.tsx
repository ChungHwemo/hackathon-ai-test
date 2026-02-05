import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Search, GitPullRequest, AlertCircle, TrendingUp, TrendingDown, FileText, Bug, Cloud, ExternalLink, Settings, CheckCircle, Clock, AlertOctagon, Calendar, RefreshCw, Loader2, Activity, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { fetchDashboardStats, fetchDashboardTasks, type DashboardStats, type DashboardTasks, type JiraTask } from '@/services/api'
import { TaskCard } from '@/components/TaskCard'

const featuresData = [
  {
    titleKey: 'dashboard.features.jira.title',
    descriptionKey: 'dashboard.features.jira.description',
    icon: Ticket,
    to: '/jira',
    color: 'bg-blue-500',
  },
  {
    titleKey: 'dashboard.features.knowledge.title',
    descriptionKey: 'dashboard.features.knowledge.description',
    icon: Search,
    to: '/knowledge',
    color: 'bg-purple-500',
  },
  {
    titleKey: 'dashboard.features.prReview.title',
    descriptionKey: 'dashboard.features.prReview.description',
    icon: GitPullRequest,
    to: '/pr-review',
    color: 'bg-orange-500',
  },
  {
    titleKey: 'dashboard.features.errorLog.title',
    descriptionKey: 'dashboard.features.errorLog.description',
    icon: AlertCircle,
    to: '/error-log',
    color: 'bg-red-500',
  },
]

const atlassianDomain = import.meta.env.VITE_ATLASSIAN_DOMAIN || 'your-domain'
const jiraProjectKey = import.meta.env.VITE_JIRA_PROJECT_KEY || 'KWA'
const confluenceSpaceId = import.meta.env.VITE_CONFLUENCE_SPACE_ID
const teamsConfigured = !!(
  import.meta.env.VITE_TEAMS_TENANT_ID &&
  import.meta.env.VITE_TEAMS_CLIENT_ID &&
  import.meta.env.VITE_TEAMS_CLIENT_SECRET
)

interface ConfigIssue {
  id: string
  titleKey: string
  descKey: string
}

const getConfigIssues = (): ConfigIssue[] => {
  const issues: ConfigIssue[] = []
  if (!teamsConfigured) {
    issues.push({
      id: 'teams',
      titleKey: 'dashboard.teamsNotConfigured',
      descKey: 'dashboard.teamsNotConfiguredDesc',
    })
  }
  if (!confluenceSpaceId) {
    issues.push({
      id: 'confluence',
      titleKey: 'dashboard.confluenceSpaceNotSet',
      descKey: 'dashboard.confluenceSpaceNotSetDesc',
    })
  }
  return issues
}

const externalLinksData = [
  {
    title: 'Confluence',
    descriptionKey: 'dashboard.externalLinks.confluence',
    icon: FileText,
    url: `https://${atlassianDomain}.atlassian.net/wiki`,
    color: 'bg-blue-600',
  },
  {
    title: 'JIRA',
    descriptionKey: 'dashboard.externalLinks.jira',
    icon: Bug,
    url: `https://${atlassianDomain}.atlassian.net/jira`,
    color: 'bg-blue-500',
  },
  {
    title: 'Salesforce',
    descriptionKey: 'dashboard.externalLinks.salesforce',
    icon: Cloud,
    url: 'https://test.salesforce.com/?locale=jp',
    color: 'bg-sky-500',
  },
]

interface StatCardConfig {
  key: keyof DashboardStats
  labelKey: string
  icon: typeof Ticket
  color: string
  bgColor: string
  isAlert?: boolean
}

const statsConfig: StatCardConfig[] = [
  { key: 'ticketsCreated', labelKey: 'dashboard.stats.ticketsCreated', icon: Ticket, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'openIssues', labelKey: 'dashboard.stats.openIssues', icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { key: 'inProgress', labelKey: 'dashboard.stats.inProgress', icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { key: 'resolvedIssues', labelKey: 'dashboard.stats.resolvedIssues', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  { key: 'highPriority', labelKey: 'dashboard.stats.highPriority', icon: AlertOctagon, color: 'text-red-600', bgColor: 'bg-red-100', isAlert: true },
  { key: 'bugs', labelKey: 'dashboard.stats.bugs', icon: Bug, color: 'text-orange-600', bgColor: 'bg-orange-100', isAlert: true },
  { key: 'dueToday', labelKey: 'dashboard.stats.dueToday', icon: Calendar, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { key: 'overdue', labelKey: 'dashboard.stats.overdue', icon: Clock, color: 'text-red-600', bgColor: 'bg-red-100', isAlert: true },
]

interface TaskColumnProps {
  title: string
  count: number
  tasks: JiraTask[]
  isLoading: boolean
  emptyText: string
  highlight?: boolean
}

function TaskColumn({ title, count, tasks, isLoading, emptyText, highlight }: TaskColumnProps) {
  return (
    <div className={`rounded-lg p-2 ${highlight && count > 0 ? 'bg-red-50/50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <Badge variant="secondary" className={`text-xs ${highlight && count > 0 ? 'bg-red-100 text-red-700' : ''}`}>
          {count}
        </Badge>
      </div>
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">{emptyText}</p>
        ) : (
          tasks.slice(0, 4).map((task) => (
            <TaskCard
              key={task.key}
              issueKey={task.key}
              summary={task.summary}
              status={task.status}
              priority={task.priority}
              assignee={task.assignee}
              dueDate={task.dueDate}
              issueType={task.issueType}
              url={task.url}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useI18n()
  const configIssues = getConfigIssues()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<DashboardTasks | null>(null)
  const [isTasksLoading, setIsTasksLoading] = useState(true)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    setIsTasksLoading(true)
    try {
      const data = await fetchDashboardTasks()
      setTasks(data)
    } catch {
      setTasks(null)
    } finally {
      setIsTasksLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadTasks()
  }, [])

  const getStatValue = (key: keyof DashboardStats): { value: number; change: string } => {
    if (!stats) return { value: 0, change: '' }
    const stat = stats[key]
    if (typeof stat === 'object' && 'value' in stat) {
      return stat as { value: number; change: string }
    }
    return { value: 0, change: '' }
  }

  const renderChangeIndicator = (change: string) => {
    if (!change) return null
    const isPositive = change.startsWith('+')
    const isNegative = change.startsWith('-')
    
    if (isPositive) {
      return (
        <span className="text-xs text-green-600 flex items-center gap-0.5">
          <TrendingUp className="w-3 h-3" />
          {change}
        </span>
      )
    }
    if (isNegative) {
      return (
        <span className="text-xs text-red-600 flex items-center gap-0.5">
          <TrendingDown className="w-3 h-3" />
          {change}
        </span>
      )
    }
    return <span className="text-xs text-gray-500">{change}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('dashboard.welcome')}</h1>
          <p className="text-gray-500 text-sm">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">{t('dashboard.stats.liveData')}</span>
              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">{stats.projectKey}</Badge>
            </div>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${configIssues.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
            {configIssues.length > 0 ? (
              <Settings className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            <span className="text-xs font-medium">{t('dashboard.configStatus')}</span>
            {configIssues.length === 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">{t('dashboard.allConfigured')}</Badge>
            ) : (
              configIssues.map((issue) => (
                <Badge key={issue.id} variant="outline" className="text-amber-600 border-amber-300 text-xs">
                  {t(issue.titleKey)}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900">JIRA {t('dashboard.stats.projectKey')}: {jiraProjectKey}</h2>
          <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading} className="h-7 text-xs">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span className="ml-1.5">{isLoading ? t('dashboard.stats.loading') : t('dashboard.stats.retry')}</span>
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-2">
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{t('dashboard.stats.error')}: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {statsConfig.map((config) => {
            const statData = getStatValue(config.key)
            const IconComponent = config.icon
            const showAlert = config.isAlert && statData.value > 0
            
            return (
              <Card key={config.key} className={`transition-shadow hover:shadow-md ${showAlert ? 'border-red-300 bg-red-50/50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5 truncate">{t(config.labelKey)}</p>
                      {isLoading ? (
                        <div className="h-7 flex items-center">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <>
                          <p className={`text-2xl font-bold ${showAlert ? 'text-red-600' : 'text-[#00843D]'}`}>
                            {statData.value}
                          </p>
                          <div className="h-4">
                            {renderChangeIndicator(statData.change)}
                          </div>
                        </>
                      )}
                    </div>
                    <div className={`p-1.5 rounded-md ${config.bgColor} flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 ${config.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {stats?.lastUpdated && (
          <p className="text-xs text-gray-400 mt-1 text-right">
            {t('dashboard.stats.lastUpdated')}: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#00843D]" />
            {t('dashboard.activeTasks.title')}
          </h2>
          <Button variant="outline" size="sm" onClick={loadTasks} disabled={isTasksLoading} className="h-7 text-xs">
            {isTasksLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <TaskColumn
            title={t('dashboard.activeTasks.inProgress')}
            count={tasks?.inProgress.length ?? 0}
            tasks={tasks?.inProgress ?? []}
            isLoading={isTasksLoading}
            emptyText={t('dashboard.activeTasks.noTasks')}
          />
          <TaskColumn
            title={t('dashboard.activeTasks.todo')}
            count={tasks?.todo.length ?? 0}
            tasks={tasks?.todo ?? []}
            isLoading={isTasksLoading}
            emptyText={t('dashboard.activeTasks.noTasks')}
          />
          <TaskColumn
            title={t('dashboard.activeTasks.highPriority')}
            count={tasks?.highPriority.length ?? 0}
            tasks={tasks?.highPriority ?? []}
            isLoading={isTasksLoading}
            emptyText={t('dashboard.activeTasks.noTasks')}
            highlight={true}
          />
          <TaskColumn
            title={t('dashboard.activeTasks.dueOrOverdue')}
            count={tasks?.dueOrOverdue.length ?? 0}
            tasks={tasks?.dueOrOverdue ?? []}
            isLoading={isTasksLoading}
            emptyText={t('dashboard.activeTasks.noTasks')}
            highlight={true}
          />
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">{t('dashboard.featuresTitle')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {featuresData.map((feature) => (
            <Card key={feature.titleKey} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.color} flex-shrink-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{t(feature.titleKey)}</h3>
                    <p className="text-xs text-gray-500 truncate">{t(feature.descriptionKey)}</p>
                  </div>
                  <Link to={feature.to}>
                    <Button size="sm" className="bg-[#00843D] hover:bg-[#006B32] h-7 text-xs px-3">
                      {t('dashboard.startButton')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">{t('dashboard.externalToolsTitle')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {externalLinksData.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${link.color} flex-shrink-0`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{link.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{t(link.descriptionKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
