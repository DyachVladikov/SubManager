import { useGetProfileQuery, useUpdateProfileMutation } from '@/entities/profile/api/profileApi'
import './ProfileSettings.scss'

const currencies = [
  { key: 'RUB', label: '₽' },
  { key: 'USD', label: '$' },
  { key: 'EUR', label: '€' },
]

const themes = [
  { key: 'dark', label: 'Тёмная' },
  { key: 'light', label: 'Светлая' },
]

export function ProfileSettings() {
  const { data: profile } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const currency = profile?.currency ?? 'RUB'
  const theme = profile?.theme ?? 'dark'

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
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          Тема
        </div>
        <div className="profile-settings__chips">
          {themes.map((item) => (
            <button
              key={item.key}
              className={`profile-settings__chip${theme === item.key ? ' profile-settings__chip--on' : ''}`}
              onClick={() => updateProfile({ theme: item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
