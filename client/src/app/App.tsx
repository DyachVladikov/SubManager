import { useAuth } from '@/features/auth'
import { AuthPage } from '@/features/auth'
import styles from './App.module.scss'

function App() {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.text}>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>SubManager</h1>
        <p className={styles.text}>Добро пожаловать, {session.user.email}</p>
        <button className={styles.button} onClick={signOut}>
          Выйти
        </button>
      </div>
    </div>
  )
}

export default App
