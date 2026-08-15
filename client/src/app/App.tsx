import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import { DashboardPage } from '@/pages/DashboardPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ComingSoon } from './ComingSoon'
import type { TabKey } from '@/widgets/TabBar'
import './App.scss'

function App() {
  const { session, loading } = useAuth()
  const [tab, setTab] = useState<TabKey>('home')

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-page__card">
          <p className="app-page__text">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  if (tab === 'analytics') {
    return <AnalyticsPage onNavigate={setTab} />
  }

  if (tab === 'friends' || tab === 'profile') {
    return <ComingSoon active={tab} onNavigate={setTab} />
  }

  return <DashboardPage onNavigate={setTab} />
}

export default App
