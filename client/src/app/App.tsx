import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'

function App() {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div>
      <h1>SubManager</h1>
      <p>Добро пожаловать, {session.user.email}</p>
      <button onClick={signOut}>Выйти</button>
    </div>
  )
}

export default App
