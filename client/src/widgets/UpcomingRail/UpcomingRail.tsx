import { useState } from 'react'
import type { Subscription } from '@/mocks/subscriptions'
import SubscriptionLogo from '@/entities/subscription/ui/SubscriptionLogo'
import { useMoney } from '@/shared/lib/useCurrency'
import './UpcomingRail.scss'

const collapsedCount = 5

interface UpcomingRailProps {
  subscriptions: Subscription[]
  onOpen: (id: string) => void
}

export function UpcomingRail({ subscriptions, onOpen }: UpcomingRailProps) {
  const [expanded, setExpanded] = useState(false)
  const { symbol: currency, convert } = useMoney()

  const hasMore = subscriptions.length > collapsedCount
  const visibleSubscriptions = expanded ? subscriptions : subscriptions.slice(0, collapsedCount)

  return (
    <>
      <div className="upcoming-rail__header rise" style={{ animationDelay: '0.18s' }}>
        <h2 className="upcoming-rail__title">
          <i></i>Ближайшие списания
        </h2>
        {hasMore && (
          <span className="upcoming-rail__more" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'свернуть' : 'все'}
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        )}
      </div>
      <div
        className={`upcoming-rail__list rise${expanded ? ' upcoming-rail__list--expanded' : ''}`}
        style={{ animationDelay: '0.22s' }}
      >
        {visibleSubscriptions.map((sub) => (
          <div
            className={`upcoming-card${sub.daysLeft === 'завтра' ? ' upcoming-card--hot' : ''}${(sub.overdueDays ?? 0) > 0 ? ' upcoming-card--overdue' : ''}`}
            key={sub.id}
            onClick={() => onOpen(sub.id)}
          >
            <div className="upcoming-card__date">
              {sub.daysLeft === 'завтра' && <span className="upcoming-card__badge">завтра</span>}
              {(sub.overdueDays ?? 0) > 0 && <span className="upcoming-card__badge upcoming-card__badge--overdue">не оплачено</span>}
              <b>{sub.nextDate.split(' ')[0]}</b>
              <span>{sub.nextDate.split(' ')[1]}</span>
            </div>
            <div className="upcoming-card__sep"></div>
            <SubscriptionLogo
              name={sub.name}
              color={sub.color}
              dark={sub.dark}
              className="upcoming-card__logo"
              iconClassName="upcoming-card__logo-icon"
            />
            <div>
              <div className="upcoming-card__name">{sub.name}</div>
              <div className="upcoming-card__amount">
                {convert(sub.price).toLocaleString('ru-RU', { useGrouping: false })} {currency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
