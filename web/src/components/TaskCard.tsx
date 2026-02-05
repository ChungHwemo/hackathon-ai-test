import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, ExternalLink, Flag, User } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

export interface TaskCardProps {
  issueKey: string
  summary: string
  status: string
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'
  assignee: { displayName: string; avatarUrl?: string } | null
  dueDate: string | null
  issueType: string
  url: string
}

const priorityConfig = {
  Highest: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  High: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' },
  Lowest: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function formatDueDate(dateStr: string | null): { text: string; isOverdue: boolean; isDueToday: boolean } {
  if (!dateStr) return { text: '', isOverdue: false, isDueToday: false }
  
  const dueDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isDueToday: false }
  } else if (diffDays === 0) {
    return { text: 'Today', isOverdue: false, isDueToday: true }
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', isOverdue: false, isDueToday: false }
  } else if (diffDays <= 7) {
    return { text: `${diffDays}d`, isOverdue: false, isDueToday: false }
  } else {
    return { 
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      isOverdue: false, 
      isDueToday: false 
    }
  }
}

export function TaskCard({
  issueKey,
  summary,
  status,
  priority,
  assignee,
  dueDate,
  url,
}: TaskCardProps) {
  const { t } = useI18n()
  const prioConfig = priorityConfig[priority] || priorityConfig.Medium
  const dueDateInfo = formatDueDate(dueDate)
  const isHighPriority = priority === 'Highest' || priority === 'High'

  return (
    <Card className="hover:shadow-md transition-shadow bg-white border border-gray-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 h-5 bg-gray-50 text-gray-600 border-gray-200"
          >
            <Flag className="w-2.5 h-2.5 mr-0.5" />
            {status}
          </Badge>
          {isHighPriority && (
            <Badge 
              className={`text-[10px] px-1.5 py-0 h-5 ${prioConfig.bg} ${prioConfig.text} border ${prioConfig.border}`}
            >
              {priority}
            </Badge>
          )}
        </div>

        <div className="mb-2">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {summary}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">↳ {issueKey}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {assignee ? (
                <>
                  {assignee.avatarUrl ? (
                    <img 
                      src={assignee.avatarUrl} 
                      alt={assignee.displayName}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#00843D] text-white flex items-center justify-center text-[8px] font-medium">
                      {getInitials(assignee.displayName)}
                    </div>
                  )}
                  <span className="truncate max-w-[60px]">{assignee.displayName.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400">{t('dashboard.activeTasks.unassigned')}</span>
                </>
              )}
            </div>

            {dueDateInfo.text && (
              <div className={`flex items-center gap-0.5 ${dueDateInfo.isOverdue ? 'text-red-600 font-medium' : dueDateInfo.isDueToday ? 'text-amber-600 font-medium' : ''}`}>
                <Calendar className="w-3 h-3" />
                <span>{dueDateInfo.text}</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-[#00843D] hover:text-[#006B32] hover:bg-green-50"
            onClick={() => window.open(url, '_blank')}
            title={t('dashboard.activeTasks.openInJira')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
