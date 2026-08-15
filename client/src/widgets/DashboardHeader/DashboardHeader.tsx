import { LuLogOut } from 'react-icons/lu'
import { useAuth } from '@/features/auth'
import './DashboardHeader.scss'

export function DashboardHeader() {
  const { signOut } = useAuth()

  return (
    <header className="dashboard-header rise" style={{ animationDelay: '0.02s' }}>
      <div className="dashboard-header__brand">
        <div className="dashboard-header__avatar">В</div>
        <div className="dashboard-header__greeting">
          <small>Добрый вечер</small>
          <b>Влад</b>
        </div>
      </div>
      <div className="dashboard-header__actions">
        <div className="dashboard-header__icon-btn">
          <svg width="19" height="19" viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="dashboard-header__dot"></span>
        </div>
        <div className="dashboard-header__icon-btn" onClick={() => signOut()} title="Выйти">
          <LuLogOut size={18} />
        </div>
      </div>
    </header>
  )
}
