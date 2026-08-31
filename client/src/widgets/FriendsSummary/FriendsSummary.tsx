import type { Split } from '@/entities/split/api/splitApi'
import { useMoney } from '@/shared/lib/useCurrency'
import './FriendsSummary.scss'

interface FriendsSummaryProps {
  splits: Split[]
  onRemindAll: () => void
}

export function FriendsSummary({ splits, onRemindAll }: FriendsSummaryProps) {
  const { symbol: currency, convert } = useMoney()
  const active = splits.filter((split) => split.status !== 'declined')
  const total = active.reduce((acc, split) => acc + split.amount, 0)
  const pending = active.filter((split) => split.status === 'pending').reduce((acc, split) => acc + split.amount, 0)
  const friendsCount = new Set(active.map((split) => split.debtor_username)).size
  const subscriptionsCount = new Set(active.map((split) => split.subscription_id)).size

  return (
    <div className="friends-summary rise" style={{ animationDelay: '0.1s' }}>
      <div className="friends-summary__label">
        <i></i>Возврат по split
      </div>
      <div className="friends-summary__sum">
        <div className="friends-summary__num">{total.toLocaleString('ru-RU', { useGrouping: false })}</div>
        <div className="friends-summary__per">{currency} / мес</div>
      </div>
      <div className="friends-summary__sub">
        {friendsCount} {plural(friendsCount, 'друг', 'друга', 'друзей')} · {subscriptionsCount}{' '}
        {plural(subscriptionsCount, 'подписка', 'подписки', 'подписок')}
      </div>
      <div className="friends-summary__divider"></div>
      <div className="friends-summary__row">
        <span className="friends-summary__pending">
          <i></i>Ещё не пришло · {convert(pending).toLocaleString('ru-RU', { useGrouping: false })} {currency}
        </span>
        <button className="friends-summary__remind" onClick={onRemindAll} disabled={pending === 0}>
          <svg width="13" height="13" viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          Напомнить
        </button>
      </div>
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
