import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useLocalStorage } from '@/shared/lib/useLocalStorage'
import './ProfileTelegram.scss'

export function ProfileTelegram() {
  const { session } = useAuth()
  const fallback = session?.user?.email?.split('@')[0] ?? 'user'
  const [linkedName, setLinkedName] = useLocalStorage<string | null>('sm_tg_username', null)
  const [waiting, setWaiting] = useState(false)

  const handleLink = () => {
    setWaiting(true)
    setTimeout(() => {
      setLinkedName(fallback)
      setWaiting(false)
    }, 1100)
  }

  return (
    <div className="profile-telegram rise" style={{ animationDelay: '0.14s' }}>
      <div className="profile-telegram__label">
        <i></i>Telegram
      </div>
      {linkedName ? (
        <div className="profile-telegram__row">
          <div className="profile-telegram__icon profile-telegram__icon--ok">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="profile-telegram__info">
            <b>@{linkedName}</b>
            <span>привязан · бот @SubManagerBot · уведомления и split активны</span>
          </div>
          <button className="profile-telegram__unlink" onClick={() => setLinkedName(null)}>
            Отвязать
          </button>
        </div>
      ) : (
        <>
          <div className="profile-telegram__row">
            <div className="profile-telegram__icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </div>
            <div className="profile-telegram__info">
              <b>Не привязан</b>
              <span>Бот напомнит о списаниях и переводах друзей. Без Telegram split недоступен.</span>
            </div>
          </div>
          <button className="profile-telegram__button" onClick={handleLink} disabled={waiting}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            {waiting ? 'Жди код в боте…' : 'Привязать Telegram'}
          </button>
        </>
      )}
    </div>
  )
}
