import { useMemo } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import { getCategoryColor } from '@/entities/subscription/lib/categoryColors'
import './CategoriesCard.scss'

const circumference = 2 * Math.PI * 54

interface CategoriesCardProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
}

export function CategoriesCard({ subscriptions, categoryNames }: CategoriesCardProps) {
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const total = stats.reduce((acc, cat) => acc + cat.amount, 0)

  let offset = 0
  const segments = stats.map((cat, i) => {
    const length = Math.max((cat.amount / total) * circumference - 1.6, 0)
    const segment = { ...cat, color: getCategoryColor(cat.name, i), length, offset: -offset }
    offset += length + 1.6
    return segment
  })

  return (
    <div className="categories-card rise" style={{ animationDelay: '0.12s' }}>
      <div className="categories-card__label">
        <i></i>По категориям
      </div>
      {stats.length === 0 ? (
        <div className="categories-card__empty">Пока нет данных — добавь первую подписку</div>
      ) : (
        <div className="categories-card__donut-wrap" style={{ marginTop: '16px' }}>
          <div className="categories-card__donut">
            <svg width="196" height="196" viewBox="0 0 148 148">
              <circle cx="74" cy="74" r="66.5" fill="none" style={{ stroke: 'rgba(255,255,255,.07)' }} strokeWidth="1.6" strokeDasharray="1.5 8.36" />
              <g transform="rotate(-90 74 74)">
                <circle cx="74" cy="74" r="54" fill="none" style={{ stroke: '#1c1c28' }} strokeWidth="17" />
                {segments.map((seg) => (
                  <circle
                    key={seg.name}
                    className="categories-card__seg"
                    cx="74"
                    cy="74"
                    r="54"
                    fill="none"
                    style={{ stroke: seg.color }}
                    strokeWidth="17"
                    strokeDasharray={`${seg.length} ${circumference}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </g>
            </svg>
            <div className="categories-card__donut-center">
              <b>{total.toLocaleString('ru-RU')} ₽</b>
              <span className="categories-card__donut-label">в месяц</span>
            </div>
          </div>
          <div className="categories-card__list">
            {segments.map((cat) => (
              <div className="categories-card__row" key={cat.name}>
                <span className="categories-card__row-dot" style={{ background: cat.color }}></span>
                <span className="categories-card__row-name">{cat.name}</span>
                <span className="categories-card__row-percent">{cat.percent}%</span>
                <b>{cat.amount.toLocaleString('ru-RU')} ₽</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
