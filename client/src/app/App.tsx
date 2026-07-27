import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import { DashboardPage } from '@/pages/DashboardPage'
import './App.scss'

function App() {
  const { session, loading } = useAuth()

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

  return <DashboardPage />
}

export default App
