import { useMemo, useRef, useState } from 'react'
import type { Subscription } from '@/mocks/subscriptions'
import SubscriptionLogo from '@/entities/subscription/ui/SubscriptionLogo'
import { useFlipGrid } from '@/shared/lib/useFlipGrid'
import { useMoney } from '@/shared/lib/useCurrency'
import './SubscriptionsGrid.scss'

const collapsedCount = 6

type SortKey = 'price' | 'date'

interface SubscriptionsGridProps {
  subscriptions: Subscription[]
  removingIds: string[]
  splitCounts: Record<string, number>
  onOpen: (id: string) => void
  onAdd: () => void
}

export function SubscriptionsGrid({ subscriptions, removingIds, splitCounts, onOpen, onAdd }: SubscriptionsGridProps) {
  const [expanded, setExpanded] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { symbol: currency, convert } = useMoney()
  const gridRef = useRef<HTMLDivElement>(null)
  useFlipGrid(gridRef)

  const categories = useMemo(() => [...new Set(subscriptions.map((sub) => sub.category))], [subscriptions])

  const sorted = useMemo(() => {
    const list = categoryFilter === 'all' ? [...subscriptions] : subscriptions.filter((sub) => sub.category === categoryFilter)
    list.sort((a, b) => (sortKey === 'price' ? b.price - a.price : (a.rawDate ?? '').localeCompare(b.rawDate ?? '')))
    return list
  }, [subscriptions, sortKey, categoryFilter])

  const hasMore = sorted.length > collapsedCount
  const visibleSubscriptions = expanded ? sorted : sorted.slice(0, collapsedCount)

  return (
    <>
      <div className="subscriptions-grid__header rise" style={{ animationDelay: '0.26s' }}>
        <h2 className="subscriptions-grid__title">
          <i></i>Мои подписки
        </h2>
        {hasMore && (
          <span className="subscriptions-grid__more" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'свернуть' : 'все'}
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        )}
      </div>
      <div className="subscriptions-grid__filters rise" style={{ animationDelay: '0.28s' }}>
        <div className="subscriptions-grid__sort">
          <span
            className={`subscriptions-grid__chip${sortKey === 'price' ? ' subscriptions-grid__chip--active' : ''}`}
            onClick={() => setSortKey('price')}
          >
            по цене
          </span>
          <span
            className={`subscriptions-grid__chip${sortKey === 'date' ? ' subscriptions-grid__chip--active' : ''}`}
            onClick={() => setSortKey('date')}
          >
            по дате
          </span>
        </div>
        {categories.length > 1 && (
          <div className="subscriptions-grid__cats">
            <span
              className={`subscriptions-grid__chip${categoryFilter === 'all' ? ' subscriptions-grid__chip--active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              все
            </span>
            {categories.map((category) => (
              <span
                key={category}
                className={`subscriptions-grid__chip${categoryFilter === category ? ' subscriptions-grid__chip--active' : ''}`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="subscriptions-grid__list rise" style={{ animationDelay: '0.3s' }} ref={gridRef}>
        {visibleSubscriptions.map((sub, index) => (
          <div
            className={`sub-card${removingIds.includes(sub.id) ? ' sub-card--removing' : ''}${(sub.overdueDays ?? 0) > 0 ? ' sub-card--overdue' : ''}`}
            key={sub.id}
            data-flip-id={sub.id}
            style={{ animationDelay: `${index * 45}ms` }}
            onClick={() => onOpen(sub.id)}
          >
            <div className="sub-card__top">
              <SubscriptionLogo
                name={sub.name}
                color={sub.color}
                dark={sub.dark}
                className="sub-card__logo"
                iconClassName="sub-card__logo-icon"
              />
              {(splitCounts[sub.id] ?? 0) > 0 && (
                <span className="sub-card__split">
                  <svg width="9" height="9" viewBox="0 0 24 24">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  {splitCounts[sub.id]}
                </span>
              )}
            </div>
            <h3 className="sub-card__name">{sub.name}</h3>
            <div className="sub-card__price">
              <b>{convert(sub.price).toLocaleString('ru-RU', { useGrouping: false })} {currency}</b> <span>/ мес</span>
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
