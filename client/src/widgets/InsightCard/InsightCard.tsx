import { useMemo, useState } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import { useMoney } from '@/shared/lib/useCurrency'
import './InsightCard.scss'

interface InsightCardProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
  monthTotal: number
}

interface Insight {
  title: string
  text: string
}

export function InsightCard({ subscriptions, categoryNames, monthTotal }: InsightCardProps) {
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const { symbol: currency, convert } = useMoney()
  const [index, setIndex] = useState(0)

  const insights = useMemo(() => {
    const list: Insight[] = []
    const fmt = (n: number) => convert(n).toLocaleString('ru-RU', { useGrouping: false })
    const top = stats[0]
    if (top && monthTotal > 0) {
      list.push({
        title: `${top.name} съедают ${top.percent}% бюджета`,
        text: `${fmt(top.amount)} ${currency} из ${fmt(monthTotal)} ${currency}. Оправдано, если пользуешься каждый день. Пользуешься?`,
      })
    }
    const expensive = subscriptions.length ? [...subscriptions].sort((a, b) => b.amount - a.amount)[0] : null
    if (expensive) {
      list.push({
        title: `${expensive.title} — самая дорогая подписка`,
        text: `${fmt(expensive.amount)} ${currency}/мес, то есть ${fmt(expensive.amount * 12)} ${currency} в год. Точно отрабатывает свою цену?`,
      })
    }
    if (subscriptions.length >= 4) {
      list.push({
        title: `У тебя ${subscriptions.length} активных подписок`,
        text: `Вместе это ${fmt(monthTotal)} ${currency}/мес — ${fmt(monthTotal * 12)} ${currency} в год. Может, какая-то уже не нужна?`,
      })
    }
    return list
  }, [stats, subscriptions, monthTotal, currency, convert])

  if (insights.length === 0) return null

  const current = index % insights.length
  const insight = insights[current]

  return (
    <div
      className="insight-card rise"
      style={{ animationDelay: '0.3s' }}
      onClick={() => setIndex((value) => (value + 1) % insights.length)}
      title={insights.length > 1 ? 'Нажми, чтобы увидеть ещё' : undefined}
    >
      <div className="insight-card__label">
        <i></i>Инсайт
        {insights.length > 1 && (
          <span className="insight-card__dots">
            {insights.map((_, dotIndex) => (
              <b
                key={dotIndex}
                className={`insight-card__dot${dotIndex === current ? ' insight-card__dot--on' : ''}`}
              ></b>
            ))}
          </span>
        )}
      </div>
      <div className="insight-card__title swap" key={`title-${current}`}>
        {insight.title}
      </div>
      <div className="insight-card__text swap" key={`text-${current}`}>
        {insight.text}
      </div>
    </div>
  )
}
