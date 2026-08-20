import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useGetProfileQuery, useUpdateProfileMutation } from '@/entities/profile/api/profileApi'
import { displayName, isTmaUser } from '@/entities/profile/lib/displayName'
import './ProfileAccount.scss'

export function ProfileAccount() {
  const { session } = useAuth()
  const user = session?.user
  const { data: profile } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const name = displayName(profile, user)
  const tma = isTmaUser(user)
  const secondary = tma
    ? profile?.telegram_username
      ? `@${profile.telegram_username}`
      : 'Telegram-аккаунт'
    : (user?.email ?? '')
  const provider = tma
    ? 'вход через Telegram'
    : user?.app_metadata?.provider === 'google'
      ? 'вход через Google'
      : 'вход по email'

  const startEdit = () => {
    setDraft(profile?.name ?? '')
    setEditing(true)
  }

  const save = async () => {
    const value = draft.trim()
    await updateProfile({ name: value || null })
    setEditing(false)
  }

  return (
    <div className="profile-account rise" style={{ animationDelay: '0.1s' }}>
      <div className="profile-account__avatar">{name[0]?.toUpperCase()}</div>
      <div className="profile-account__info">
        {editing ? (
          <div className="profile-account__edit">
            <input
              className="profile-account__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') save()
                if (event.key === 'Escape') setEditing(false)
              }}
              placeholder="Твоё имя"
              maxLength={30}
              autoFocus
            />
            <button className="profile-account__save" onClick={save}>
              Ок
            </button>
          </div>
        ) : (
          <div className="profile-account__name-row">
            <b className="profile-account__name">{name}</b>
            <button className="profile-account__edit-btn" onClick={startEdit} title="Изменить имя">
              <svg width="13" height="13" viewBox="0 0 24 24">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          </div>
        )}
        <span className="profile-account__email">{secondary}</span>
        <span className="profile-account__chip">{provider}</span>
      </div>
    </div>
  )
}
