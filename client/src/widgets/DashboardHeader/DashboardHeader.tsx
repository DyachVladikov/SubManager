import { useEffect, useMemo, useRef, useState } from 'react'
import { LuBell, LuLogOut } from 'react-icons/lu'
import { useAuth } from '@/features/auth'
import { useGetProfileQuery } from '@/entities/profile/api/profileApi'
import { displayName } from '@/entities/profile/lib/displayName'
import { useGetSubscriptionsQuery } from '@/entities/subscription/api/subscriptionApi'
import './DashboardHeader.scss'

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function whenLabel(days: number, date: string) {
  if (days === 0) return 'сегодня'
  if (days === 1) return 'завтра'
  const d = new Date(`${date}T00:00:00`)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function greeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 18) return 'Добрый день'
  if (hour >= 18 && hour < 23) return 'Добрый вечер'
  return 'Доброй ночи'
}

export function DashboardHeader() {
  const { session, signOut } = useAuth()
  const { data: profile } = useGetProfileQuery()
  const { data: subscriptions } = useGetSubscriptionsQuery()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  const name = displayName(profile, session?.user)

  const upcoming = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return (subscriptions ?? [])
      .map((sub) => ({
        sub,
        days: Math.round((new Date(`${sub.next_payment_date}T00:00:00`).getTime() - now.getTime()) / 86400000),
      }))
      .filter((item) => item.days >= 0 && item.days <= 7)
  }, [subscriptions])

  const hasHot = upcoming.some((item) => item.days <= 1)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [open])

  return (
    <header className="dashboard-header rise" style={{ animationDelay: '0.02s' }} ref={rootRef}>
      <div className="dashboard-header__brand">
        <div className="dashboard-header__avatar">{name[0]?.toUpperCase()}</div>
        <div className="dashboard-header__greeting">
          <small>{greeting()}</small>
          <b>{name}</b>
        </div>
      </div>
      <div className="dashboard-header__actions">
        <div className="dashboard-header__icon-btn" onClick={() => setOpen((value) => !value)} title="Уведомления">
          <LuBell size={18} />
          {hasHot && <span className="dashboard-header__dot"></span>}
        </div>
        <div className="dashboard-header__icon-btn" onClick={() => signOut()} title="Выйти">
          <LuLogOut size={18} />
        </div>
      </div>
      {open && (
        <div className="dashboard-header__notifications">
          <div className="dashboard-header__notifications-title">Списания за 7 дней</div>
          {upcoming.length === 0 && (
            <div className="dashboard-header__notifications-empty">Нет списаний в ближайшие 7 дней</div>
          )}
          {upcoming.map(({ sub, days }) => (
            <div className="dashboard-header__notification" key={sub.id}>
              <div
                className="dashboard-header__notification-logo"
                style={{ background: sub.color_hex ?? 'var(--accent)' }}
              >
                {sub.title[0]}
              </div>
              <div className="dashboard-header__notification-info">
                <b>{sub.title}</b>
                <small>{whenLabel(days, sub.next_payment_date)}</small>
              </div>
              <div className="dashboard-header__notification-amount">
                {sub.amount.toLocaleString('ru-RU', { useGrouping: false })} ₽
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
