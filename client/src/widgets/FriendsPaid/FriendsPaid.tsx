import type { Split } from '@/entities/split/api/splitApi'
import type { Subscription } from '@/entities/subscription/model/types'
import { formatNextDate } from '@/entities/subscription/lib/mapSubscription'
import { gradientForName } from '@/entities/split/lib/avatarGradients'
import { useMoney } from '@/shared/lib/useCurrency'
import './FriendsPaid.scss'

interface FriendsPaidProps {
  splits: Split[]
  subscriptions: Record<string, Subscription>
}

export function FriendsPaid({ splits, subscriptions }: FriendsPaidProps) {
  const { symbol: currency, convert } = useMoney()
  const total = splits.reduce((acc, split) => acc + split.amount, 0)
  if (splits.length === 0) return null

  return (
    <>
      <div className="friends-paid__header rise" style={{ animationDelay: '0.22s' }}>
        <h2 className="friends-paid__title">
          <i></i>Оплатили
        </h2>
        <span className="friends-paid__sum">{convert(total).toLocaleString('ru-RU', { useGrouping: false })} {currency}</span>
      </div>
      <div className="friends-paid__card rise" style={{ animationDelay: '0.26s' }}>
        {splits.map((split) => {
          const username = split.debtor_username.replace(/^@/, '')
          const gradient = gradientForName(username)
          const subscription = subscriptions[split.subscription_id]
          return (
            <div className="friends-paid__row" key={split.id}>
              <div
                className="friends-paid__avatar"
                style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
              >
                {username[0]?.toUpperCase()}
              </div>
              <div className="friends-paid__info">
                <b>@{username}</b>
                <div className="friends-paid__sub">{subscription ? subscription.title : 'Подписка удалена'}</div>
              </div>
              <div className="friends-paid__right">
                <b>{convert(split.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}</b>
                <span className="friends-paid__check">
                  <svg width="10" height="10" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {formatNextDate(split.updated_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
