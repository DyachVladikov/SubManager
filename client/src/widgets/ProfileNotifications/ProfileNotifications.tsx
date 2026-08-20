import type { Profile } from '@/entities/profile/api/profileApi'
import { useGetProfileQuery, useUpdateProfileMutation } from '@/entities/profile/api/profileApi'
import './ProfileNotifications.scss'

type NotifyKey =
  | 'notify_charge_before'
  | 'notify_charge_day'
  | 'notify_splits'
  | 'notify_payments_received'
  | 'notify_weekly_digest'
  | 'notify_news'

interface NotifyItem {
  key: NotifyKey
  title: string
  hint: string
  icon: React.ReactNode
}

const items: NotifyItem[] = [
  {
    key: 'notify_charge_before',
    title: 'Напоминание заранее',
    hint: 'за день до списания',
    icon: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
  },
  {
    key: 'notify_charge_day',
    title: 'День списания',
    hint: 'утром в день платежа',
    icon: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
        <path d="M5 3 2 6M22 6l-3-3" />
      </>
    ),
  },
  {
    key: 'notify_splits',
    title: 'Твои доли по split',
    hint: 'напоминания о переводах владельцу',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    key: 'notify_payments_received',
    title: 'Переводы друзей',
    hint: 'когда друг жмёт «Я перевел(а)»',
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </>
    ),
  },
  {
    key: 'notify_weekly_digest',
    title: 'Сводка за неделю',
    hint: 'по понедельникам, если есть неоплаченные доли',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    key: 'notify_news',
    title: 'Новости продукта',
    hint: 'обновления и новые функции SubManager',
    icon: (
      <>
        <path d="m3 11 18-5v12L3 13v-2z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </>
    ),
  },
]

export function ProfileNotifications() {
  const { data: profile } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()

  const valueOf = (key: NotifyKey) => profile?.[key] ?? true

  return (
    <div className="profile-notifications rise" style={{ animationDelay: '0.22s' }}>
      <div className="profile-notifications__label">
        <i></i>Уведомления
      </div>
      {items.map((item) => (
        <div className="profile-notifications__row" key={item.key}>
          <div className="profile-notifications__name">
            <div className="profile-notifications__icon">
              <svg width="16" height="16" viewBox="0 0 24 24">{item.icon}</svg>
            </div>
            <div className="profile-notifications__text">
              {item.title}
              <small>{item.hint}</small>
            </div>
          </div>
          <button
            className={`profile-notifications__switch${valueOf(item.key) ? ' profile-notifications__switch--on' : ''}`}
            onClick={() => updateProfile({ [item.key]: !valueOf(item.key) } as Partial<Profile>)}
            role="switch"
            aria-checked={valueOf(item.key)}
            aria-label={item.title}
          ></button>
        </div>
      ))}
    </div>
  )
}
