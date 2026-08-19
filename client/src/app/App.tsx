import { useState } from 'react'
import { useAuth, useTmaAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
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
