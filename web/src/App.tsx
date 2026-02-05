import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/app-layout'
import { DashboardPage } from './pages/dashboard'
import { JiraAutomationPage } from './pages/jira-automation'
import { KnowledgeSearchPage } from './pages/knowledge-search'
import { PrReviewPage } from './pages/pr-review'
import { ErrorLogSearchPage } from './pages/error-log-search'
import { I18nProvider } from './hooks/useI18n'

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jira" element={<JiraAutomationPage />} />
            <Route path="/knowledge" element={<KnowledgeSearchPage />} />
            <Route path="/pr-review" element={<PrReviewPage />} />
            <Route path="/error-log" element={<ErrorLogSearchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
