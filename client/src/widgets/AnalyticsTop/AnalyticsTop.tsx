import { useMemo } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import SubscriptionLogo from '@/entities/subscription/ui/SubscriptionLogo'
import { useMoney } from '@/shared/lib/useCurrency'
import './AnalyticsTop.scss'

interface AnalyticsTopProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
  monthTotal: number
  onOpen: (id: string) => void
}

export function AnalyticsTop({ subscriptions, categoryNames, monthTotal, onOpen }: AnalyticsTopProps) {
  const { symbol: currency, convert } = useMoney()
  const top = useMemo(() => [...subscriptions].sort((a, b) => b.amount - a.amount).slice(0, 4), [subscriptions])

  if (top.length === 0) return null

  return (
    <div className="analytics-top rise" style={{ animationDelay: '0.26s' }}>
      <div className="analytics-top__label">
        <i></i>Топ по цене
      </div>
      {top.map((sub, i) => (
        <div className="analytics-top__row" key={sub.id} onClick={() => onOpen(sub.id)}>
          <span className="analytics-top__rank">{String(i + 1).padStart(2, '0')}</span>
          <SubscriptionLogo
            name={sub.title}
            color={sub.color_hex || '#a78bfa'}
            className="analytics-top__logo"
          />
          <div className="analytics-top__name">
            {sub.title}
            <small>{(sub.category_id && categoryNames[sub.category_id]) || 'Другое'}</small>
          </div>
          <div className="analytics-top__amount">
            {convert(sub.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}
            <small>{monthTotal > 0 ? Math.round((sub.amount / monthTotal) * 100) : 0}%</small>
          </div>
        </div>
      ))}
    </div>
  )
}
