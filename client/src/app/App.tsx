import { useEffect, useState } from 'react'
import { useAuth, useTmaAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import { useTheme } from '@/shared/lib/useTheme'
import { DashboardPage } from '@/pages/DashboardPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { FriendsPage } from '@/pages/FriendsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import type { TabKey } from '@/widgets/TabBar'
import './App.scss'

function App() {
  const { session, loading } = useAuth()
  const tmaAuth = useTmaAuth()
  const [tab, setTab] = useState<TabKey>('home')
  useTheme(session !== null)

  useEffect(() => {
    const root = document.documentElement
    const prevBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    root.style.scrollBehavior = prevBehavior
  }, [tab])

  if (loading || tmaAuth === 'signing') {
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

  if (tab === 'friends') {
    return <FriendsPage onNavigate={setTab} />
  }

  if (tab === 'profile') {
    return <ProfilePage onNavigate={setTab} />
  }

  return <DashboardPage onNavigate={setTab} />
}

export default App
