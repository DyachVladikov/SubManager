import type { Subscription } from '@/mocks/subscriptions'
import './UpcomingRail.scss'

interface UpcomingRailProps {
  subscriptions: Subscription[]
  onShowAll: () => void
}

export function UpcomingRail({ subscriptions, onShowAll }: UpcomingRailProps) {
  return (
    <>
      <div className="upcoming-rail__header rise" style={{ animationDelay: '0.18s' }}>
        <h2 className="upcoming-rail__title">
          <i></i>Ближайшие списания
        </h2>
        <span className="upcoming-rail__more" onClick={onShowAll}>
          все
          <svg width="11" height="11" viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <div className="upcoming-rail__list rise" style={{ animationDelay: '0.22s' }}>
        {subscriptions.slice(0, 5).map((sub) => (
          <div className={`upcoming-card ${sub.daysLeft === 'завтра' ? 'upcoming-card--hot' : ''}`} key={sub.id}>
            <div className="upcoming-card__date">
              {sub.daysLeft === 'завтра' && <span className="upcoming-card__badge">завтра</span>}
              <b>{sub.nextDate.split(' ')[0]}</b>
              <span>{sub.nextDate.split(' ')[1]}</span>
            </div>
            <div className="upcoming-card__sep"></div>
            <div className="upcoming-card__logo" style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}>
              {sub.letter}
            </div>
            <div>
              <div className="upcoming-card__name">{sub.name}</div>
              <div className="upcoming-card__amount">{sub.price.toLocaleString('ru-RU', { useGrouping: false })} ₽</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
