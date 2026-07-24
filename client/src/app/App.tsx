import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import { DashboardPage } from '@/pages/DashboardPage'
import './App.scss'

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-card">
          <p className="app-text">Загрузка...</p>
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
