import { useEffect, useMemo, useState } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import { getCategoryColor } from '@/entities/subscription/lib/categoryColors'
import { useMoney } from '@/shared/lib/useCurrency'
import './AnalyticsCategories.scss'

interface AnalyticsCategoriesProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
}

export function AnalyticsCategories({ subscriptions, categoryNames }: AnalyticsCategoriesProps) {
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const { symbol: currency, convert } = useMoney()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 250)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="analytics-categories rise" style={{ animationDelay: '0.22s' }}>
      <div className="analytics-categories__label">
        <i></i>Категории
      </div>
      {stats.length === 0 ? (
        <div className="analytics-categories__empty">Пока нет данных — добавь первую подписку</div>
      ) : (
        stats.map((cat, i) => (
          <div className="analytics-categories__row" key={cat.name}>
            <div className="analytics-categories__row-head">
              <span>{cat.name}</span>
              <span>
                {cat.percent}%&nbsp;&nbsp;<b>{convert(cat.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}</b>
              </span>
            </div>
            <div className="analytics-categories__bar">
              <i
                style={{
                  width: mounted ? `${cat.percent}%` : '0%',
                  background: getCategoryColor(cat.name, i),
                  transitionDelay: `${i * 120}ms`,
                }}
              ></i>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
