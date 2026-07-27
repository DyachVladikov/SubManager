import { useRef } from 'react'
import type { Subscription } from '@/mocks/subscriptions'
import { useFlipGrid } from '@/shared/lib/useFlipGrid'
import './SubscriptionsGrid.scss'

interface SubscriptionsGridProps {
  subscriptions: Subscription[]
  removingIds: string[]
  onOpen: (id: string) => void
  onAdd: () => void
}

export function SubscriptionsGrid({ subscriptions, removingIds, onOpen, onAdd }: SubscriptionsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  useFlipGrid(gridRef)

  return (
    <>
      <div className="subscriptions-grid__header rise" style={{ animationDelay: '0.26s' }}>
        <h2 className="subscriptions-grid__title">
          <i></i>Мои подписки
        </h2>
        <span className="subscriptions-grid__more">
          все
          <svg width="11" height="11" viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <div className="subscriptions-grid__list rise" style={{ animationDelay: '0.3s' }} ref={gridRef}>
        {subscriptions.map((sub) => (
          <div
            className={`sub-card ${removingIds.includes(sub.id) ? 'sub-card--removing' : ''}`}
            key={sub.id}
            data-flip-id={sub.id}
            onClick={() => onOpen(sub.id)}
          >
            <div className="sub-card__top">
              <div className="sub-card__logo" style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}>
                {sub.letter}
              </div>
              {sub.split && (
                <span className="sub-card__split">
                  <svg width="9" height="9" viewBox="0 0 24 24">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  {sub.split.length}
                </span>
              )}
            </div>
            <h3 className="sub-card__name">{sub.name}</h3>
            <div className="sub-card__price">
              <b>{sub.price.toLocaleString('ru-RU')} ₽</b> <span>/ мес</span>
            </div>
            <div className="sub-card__dates">
              <span>{sub.nextDate}</span>
              <span>{sub.daysLeft}</span>
            </div>
            <div className="sub-card__bar">
              <i style={{ width: `${100 - parseInt(sub.daysLeft)}%` }}></i>
            </div>
          </div>
        ))}
        <div className="sub-card sub-card--add" data-flip-id="add" onClick={onAdd}>
          <div className="sub-card__plus">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
          <span className="sub-card__add-text">Добавить</span>
        </div>
      </div>
    </>
  )
}
