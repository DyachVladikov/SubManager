import { useAuth } from '@/features/auth'
import './ProfileAccount.scss'

export function ProfileAccount() {
  const { session } = useAuth()
  const user = session?.user
  const name: string = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь'
  const email = user?.email ?? ''
  const provider = user?.app_metadata?.provider === 'google' ? 'вход через Google' : 'вход по email'

  return (
    <div className="profile-account rise" style={{ animationDelay: '0.1s' }}>
      <div className="profile-account__avatar">{name[0]?.toUpperCase()}</div>
      <div className="profile-account__info">
        <b className="profile-account__name">{name}</b>
        <span className="profile-account__email">{email}</span>
        <span className="profile-account__chip">{provider}</span>
      </div>
    </div>
  )
}
