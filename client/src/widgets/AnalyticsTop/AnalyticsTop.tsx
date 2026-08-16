import { useMemo } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import './AnalyticsTop.scss'

interface AnalyticsTopProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
  monthTotal: number
}

export function AnalyticsTop({ subscriptions, categoryNames, monthTotal }: AnalyticsTopProps) {
  const top = useMemo(() => [...subscriptions].sort((a, b) => b.amount - a.amount).slice(0, 4), [subscriptions])

  if (top.length === 0) return null

  return (
    <div className="analytics-top rise" style={{ animationDelay: '0.26s' }}>
      <div className="analytics-top__label">
        <i></i>Топ по цене
      </div>
      {top.map((sub, i) => (
        <div className="analytics-top__row" key={sub.id}>
          <span className="analytics-top__rank">{String(i + 1).padStart(2, '0')}</span>
          <div className="analytics-top__logo" style={{ background: sub.color_hex || '#a78bfa' }}>
            {sub.title[0].toUpperCase()}
          </div>
          <div className="analytics-top__name">
            {sub.title}
            <small>{(sub.category_id && categoryNames[sub.category_id]) || 'Другое'}</small>
          </div>
          <div className="analytics-top__amount">
            {sub.amount.toLocaleString('ru-RU', { useGrouping: false })} ₽
            <small>{monthTotal > 0 ? Math.round((sub.amount / monthTotal) * 100) : 0}%</small>
          </div>
        </div>
      ))}
    </div>
  )
}
