import { useLocalStorage } from '@/shared/lib/useLocalStorage'
import './ProfileNotifications.scss'

export function ProfileNotifications() {
  const [payments, setPayments] = useLocalStorage('sm_notif_payments', true)
  const [friends, setFriends] = useLocalStorage('sm_notif_friends', true)
  const [news, setNews] = useLocalStorage('sm_notif_news', false)

  const items = [
    {
      key: 'payments',
      title: 'Списания',
      hint: 'за день до платежа',
      value: payments,
      set: setPayments,
      icon: (
        <>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </>
      ),
    },
    {
      key: 'friends',
      title: 'Переводы друзей',
      hint: 'когда друг жмёт «я перевёл»',
      value: friends,
      set: setFriends,
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
      key: 'news',
      title: 'Новости продукта',
      hint: 'редко и по делу',
      value: news,
      set: setNews,
      icon: (
        <>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </>
      ),
    },
  ]

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
            className={`profile-notifications__switch${item.value ? ' profile-notifications__switch--on' : ''}`}
            onClick={() => item.set(!item.value)}
            role="switch"
            aria-checked={item.value}
            aria-label={item.title}
          ></button>
        </div>
      ))}
    </div>
  )
}
