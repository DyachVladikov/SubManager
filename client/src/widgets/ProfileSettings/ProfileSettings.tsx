import { useGetProfileQuery, useUpdateProfileMutation } from '@/entities/profile/api/profileApi'
import { useLocalStorage } from '@/shared/lib/useLocalStorage'
import './ProfileSettings.scss'

const currencies = [
  { key: 'RUB', label: '₽' },
  { key: 'USD', label: '$' },
  { key: 'EUR', label: '€' },
]

const themes = [
  { key: 'dark', label: 'Тёмная' },
  { key: 'light', label: 'Светлая' },
  { key: 'auto', label: 'Авто' },
]

export function ProfileSettings() {
  const { data: profile } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const [theme, setTheme] = useLocalStorage('sm_theme', 'dark')
  const currency = profile?.currency ?? 'RUB'

  return (
    <div className="profile-settings rise" style={{ animationDelay: '0.18s' }}>
      <div className="profile-settings__label">
        <i></i>Основное
      </div>
      <div className="profile-settings__row">
        <div className="profile-settings__name">
          <div className="profile-settings__icon">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          Валюта
        </div>
        <div className="profile-settings__chips">
          {currencies.map((item) => (
            <button
              key={item.key}
              className={`profile-settings__chip${currency === item.key ? ' profile-settings__chip--on' : ''}`}
              onClick={() => updateProfile({ currency: item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="profile-settings__row">
        <div className="profile-settings__name">
          <div className="profile-settings__icon">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </div>
          Тема
        </div>
        <div className="profile-settings__chips">
          {themes.map((item) => (
            <button
              key={item.key}
              className={`profile-settings__chip${theme === item.key ? ' profile-settings__chip--on' : ''}`}
              onClick={() => setTheme(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
