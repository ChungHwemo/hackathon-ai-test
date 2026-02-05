import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  Search,
  GitPullRequest,
  AlertCircle,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

type NavItemKey = 'dashboard' | 'jiraAutomation' | 'knowledgeSearch' | 'prReview' | 'errorLogSearch'

const navItems: { to: string; icon: typeof LayoutDashboard; labelKey: NavItemKey }[] = [
  { to: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/jira', icon: Ticket, labelKey: 'jiraAutomation' },
  { to: '/knowledge', icon: Search, labelKey: 'knowledgeSearch' },
  { to: '/pr-review', icon: GitPullRequest, labelKey: 'prReview' },
  { to: '/error-log', icon: AlertCircle, labelKey: 'errorLogSearch' },
]

export function AppSidebar() {
  const { t, locale, setLocale } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === 'ja' ? 'en' : 'ja')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#00843D] text-white flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold">{t('sidebar.title')}</h1>
        <p className="text-sm text-white/70 mt-1">{t('sidebar.subtitle')}</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{t(`nav.${item.labelKey}`)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/20 space-y-3">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
        >
          <Globe className="w-4 h-4" />
          <span className={cn(locale === 'ja' && 'font-bold')}>JA</span>
          <span className="text-white/50">/</span>
          <span className={cn(locale === 'en' && 'font-bold')}>EN</span>
        </button>
        <div className="text-xs text-white/50">
          {t('sidebar.footer')}
        </div>
      </div>
    </aside>
  )
}
