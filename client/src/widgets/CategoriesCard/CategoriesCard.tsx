import { useMemo, useState } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import { getCategoryColor } from '@/entities/subscription/lib/categoryColors'
import { useMoney } from '@/shared/lib/useCurrency'
import './CategoriesCard.scss'

const circumference = 2 * Math.PI * 54
const markRadiusPercent = (54 / 74) * 50

interface CategoriesCardProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
}

export function CategoriesCard({ subscriptions, categoryNames }: CategoriesCardProps) {
  const { symbol: currency, convert } = useMoney()
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const total = stats.reduce((acc, cat) => acc + cat.amount, 0)
  const [active, setActive] = useState<string | null>(null)

  let offset = 0
  const segments = stats.map((cat, i) => {
    const length = Math.max((cat.amount / total) * circumference - 1.6, 0)
    const segment = { ...cat, color: getCategoryColor(cat.name, i), length, offset: -offset, mid: offset + length / 2 }
    offset += length + 1.6
    return segment
  })

  const activeSeg = segments.find((seg) => seg.name === active) ?? null
  const activeAngle = activeSeg ? (activeSeg.mid / circumference) * 2 * Math.PI : 0

  const bind = (name: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setActive(name)
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setActive(null)
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') setActive((prev) => (prev === name ? null : name))
    },
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
            <svg width="224" height="224" viewBox="0 0 148 148">
              <circle cx="74" cy="74" r="66.5" fill="none" style={{ stroke: 'rgba(255,255,255,.07)' }} strokeWidth="1.6" strokeDasharray="1.5 8.36" />
              <g transform="rotate(-90 74 74)">
                <circle cx="74" cy="74" r="54" fill="none" style={{ stroke: '#1c1c28' }} strokeWidth="17" />
                {segments.map((seg) => (
                  <circle
                    key={seg.name}
                    className={`categories-card__seg${activeSeg && seg.name !== activeSeg.name ? ' categories-card__seg--dim' : ''}${activeSeg?.name === seg.name ? ' categories-card__seg--big' : ''}`}
                    cx="74"
                    cy="74"
                    r="54"
                    fill="none"
                    style={{
                      stroke: seg.color,
                      ...(activeSeg?.name === seg.name ? { filter: `drop-shadow(0 0 9px ${seg.color})` } : {}),
                    }}
                    strokeWidth="17"
                    strokeDasharray={`${seg.length} ${circumference}`}
                    strokeDashoffset={seg.offset}
                    {...bind(seg.name)}
                  />
                ))}
              </g>
            </svg>
            <div
              className="categories-card__donut-center categories-card__donut-center--swap"
              key={activeSeg ? activeSeg.name : 'total'}
            >
              {activeSeg && (
                <span className="categories-card__donut-percent" style={{ color: activeSeg.color }}>
                  {activeSeg.percent}% расходов
                </span>
              )}
              <b>{convert(activeSeg ? activeSeg.amount : total).toLocaleString('ru-RU', { useGrouping: false })} {currency}</b>
              <span className="categories-card__donut-label">{activeSeg ? activeSeg.name : 'в месяц'}</span>
            </div>
            <div
              className={`categories-card__mark${activeSeg ? ' categories-card__mark--on' : ''}`}
              style={
                activeSeg
                  ? {
                      left: `${50 + markRadiusPercent * Math.sin(activeAngle)}%`,
                      top: `${50 - markRadiusPercent * Math.cos(activeAngle)}%`,
                      background: activeSeg.color,
                      boxShadow: `0 0 0 4px ${activeSeg.color}33, 0 0 12px ${activeSeg.color}`,
                    }
                  : undefined
              }
            />
          </div>
          <div className="categories-card__list">
            {segments.map((cat) => (
              <div
                className={`categories-card__row${activeSeg?.name === cat.name ? ' categories-card__row--active' : ''}`}
                key={cat.name}
                {...bind(cat.name)}
              >
                <span className="categories-card__row-dot" style={{ background: cat.color }}></span>
                <span className="categories-card__row-name">{cat.name}</span>
                <span className="categories-card__row-percent">{cat.percent}%</span>
                <b>{convert(cat.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
