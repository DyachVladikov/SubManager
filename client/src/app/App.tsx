import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import './App.scss'

function App() {
  const { session, loading, signOut } = useAuth()

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

  return (
    <div className="app-page">
      <div className="app-card">
        <h1 className="app-title">SubManager</h1>
        <p className="app-text">Добро пожаловать, {session.user.email}</p>
        <button className="app-button" onClick={signOut}>
          Выйти
        </button>
      </div>
    </div>
  )
}

export default App
