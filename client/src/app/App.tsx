import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuth, useTmaAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import { useTheme } from '@/shared/lib/useTheme'
import { Loader } from '@/shared/ui/Loader'
import { DashboardPage } from '@/pages/DashboardPage'
import type { TabKey } from '@/widgets/TabBar'
import './App.scss'

const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })))
const FriendsPage = lazy(() => import('@/pages/FriendsPage').then((module) => ({ default: module.FriendsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))

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
    return <Loader fullscreen />
  }

  if (!session) {
    return <AuthPage />
  }

  if (tab === 'analytics') {
    return (
      <Suspense fallback={<Loader fullscreen />}>
        <AnalyticsPage onNavigate={setTab} />
      </Suspense>
    )
  }

  if (tab === 'friends') {
    return (
      <Suspense fallback={<Loader fullscreen />}>
        <FriendsPage onNavigate={setTab} />
      </Suspense>
    )
  }

  if (tab === 'profile') {
    return (
      <Suspense fallback={<Loader fullscreen />}>
        <ProfilePage onNavigate={setTab} />
      </Suspense>
    )
  }

  return <DashboardPage onNavigate={setTab} />
}

export default App
