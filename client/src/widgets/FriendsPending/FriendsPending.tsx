import type { Split } from '@/entities/split/api/splitApi'
import type { Subscription } from '@/entities/subscription/model/types'
import { formatNextDate } from '@/entities/subscription/lib/mapSubscription'
import { gradientForName } from '@/entities/split/lib/avatarGradients'
import './FriendsPending.scss'

interface FriendsPendingProps {
  splits: Split[]
  subscriptions: Record<string, Subscription>
  onRemind: (split: Split) => void
  onPaid: (split: Split) => void
}

export function FriendsPending({ splits, subscriptions, onRemind, onPaid }: FriendsPendingProps) {
  const total = splits.reduce((acc, split) => acc + split.amount, 0)

  if (splits.length === 0) {
    return (
      <div className="friends-pending__empty rise" style={{ animationDelay: '0.14s' }}>
        <div className="friends-pending__empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <b>Нет неоплаченных долей</b>
        <span>Включи «Разделить оплату» при добавлении подписки — друг появится здесь со своей долей</span>
      </div>
    )
  }

  return (
    <>
      <div className="friends-pending__header rise" style={{ animationDelay: '0.14s' }}>
        <h2 className="friends-pending__title">
          <i></i>Ждут перевода
        </h2>
        <span className="friends-pending__sum">{total.toLocaleString('ru-RU', { useGrouping: false })} ₽</span>
      </div>
      <div className="friends-pending__list rise" style={{ animationDelay: '0.18s' }}>
        {splits.map((split) => {
          const username = split.debtor_username.replace(/^@/, '')
          const gradient = gradientForName(username)
          const subscription = subscriptions[split.subscription_id]
          return (
            <div className="friends-pending__card" key={split.id}>
              <div
                className="friends-pending__avatar"
                style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
              >
                {username[0]?.toUpperCase()}
              </div>
              <div className="friends-pending__info">
                <b>@{username}</b>
                <div className="friends-pending__sub">
                  {subscription ? `${subscription.title} · доля до ${formatNextDate(subscription.next_payment_date)}` : 'Подписка удалена'}
                </div>
              </div>
              <div className="friends-pending__right">
                <b>{split.amount.toLocaleString('ru-RU', { useGrouping: false })} ₽</b>
                <div className="friends-pending__actions">
                  <button
                    className="friends-pending__remind friends-pending__remind--ok"
                    onClick={() => onPaid(split)}
                    title="Получено"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                  <button className="friends-pending__remind" onClick={() => onRemind(split)} title="Напомнить">
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
