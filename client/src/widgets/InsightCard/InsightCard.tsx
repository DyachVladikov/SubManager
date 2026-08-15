import { useMemo } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import './InsightCard.scss'

interface InsightCardProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
  monthTotal: number
}

export function InsightCard({ subscriptions, categoryNames, monthTotal }: InsightCardProps) {
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const top = stats[0]

  if (!top) return null

  return (
    <div className="insight-card rise" style={{ animationDelay: '0.3s' }}>
      <div className="insight-card__label">
        <i></i>Инсайт
      </div>
      <div className="insight-card__title">
        {top.name} съедают {top.percent}% бюджета
      </div>
      <div className="insight-card__text">
        {top.amount.toLocaleString('ru-RU')} ₽ из {monthTotal.toLocaleString('ru-RU')} ₽. Оправдано, если пользуешься
        каждый день. Пользуешься?
      </div>
    </div>
  )
}
