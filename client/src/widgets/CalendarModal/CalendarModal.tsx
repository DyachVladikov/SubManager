import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu'
import type { Subscription } from '@/entities/subscription/model/types'
import { chargesForMonth } from '@/entities/subscription/lib/chargeDates'
import { addMonths, periodLabel } from '@/entities/subscription/lib/period'
import SubscriptionLogo from '@/entities/subscription/ui/SubscriptionLogo'
import { useMoney } from '@/shared/lib/useCurrency'
import './CalendarModal.scss'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function pluralCharges(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'списание'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'списания'
  return 'списаний'
}

interface CalendarModalProps {
  subscriptions: Subscription[]
  onClose: () => void
  onOpenSubscription?: (id: string) => void
}

export function CalendarModal({ subscriptions, onClose, onOpenSubscription }: CalendarModalProps) {
  const { symbol: currency, convert } = useMoney()
  const now = new Date()
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [shown, setShown] = useState(false)
  const [enterDir, setEnterDir] = useState<'next' | 'prev' | null>(null)
  const [dragX, setDragX] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipingRef = useRef(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = year * 12 + month

  const charges = useMemo(() => chargesForMonth(subscriptions, year, month), [subscriptions, year, month])
  const byDay = useMemo(() => {
    const map = new Map<number, Subscription[]>()
    for (const charge of charges) {
      const list = map.get(charge.day) ?? []
      list.push(charge.subscription)
      map.set(charge.day, list)
    }
    return map
  }, [charges])

  const monthTotal = charges.reduce((sum, charge) => sum + convert(charge.subscription.amount), 0)

  useEffect(() => {
    let cancelled = false
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setShown(true)
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const closeWithAnimation = useCallback(() => {
    setShown(false)
    window.setTimeout(onClose, 300)
  }, [onClose])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWithAnimation()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeWithAnimation])

  const changeMonth = (delta: number) => {
    setEnterDir(delta > 0 ? 'next' : 'prev')
    setViewDate((date) => addMonths(date, delta))
    setSelectedDay(null)
    setDragX(0)
  }

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    swipingRef.current = false
  }

  const onTouchMove = (event: React.TouchEvent) => {
    const start = touchStartRef.current
    if (!start) return
    const dx = event.touches[0].clientX - start.x
    const dy = event.touches[0].clientY - start.y
    if (!swipingRef.current) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) swipingRef.current = true
      else if (Math.abs(dy) > 12) touchStartRef.current = null
    }
    if (swipingRef.current) setDragX(dx)
  }

  const onTouchEnd = () => {
    const dx = dragX
    setDragX(0)
    touchStartRef.current = null
    swipingRef.current = false
    if (dx <= -70) changeMonth(1)
    else if (dx >= 70) changeMonth(-1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const selectedCharges = selectedDay !== null ? (byDay.get(selectedDay) ?? []) : []

  const gridClass = [
    'calendar-modal__grid',
    enterDir === 'next' ? 'calendar-modal__grid--enter-next' : '',
    enterDir === 'prev' ? 'calendar-modal__grid--enter-prev' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div
        className={`calendar-modal__backdrop ${shown ? 'calendar-modal__backdrop--open' : ''}`}
        onClick={closeWithAnimation}
      ></div>
      <div className={`calendar-modal ${shown ? 'calendar-modal--open' : ''}`}>
        <div className="calendar-modal__head">
          <div className="calendar-modal__title">
            {MONTHS[month]} <span>{year}</span>
          </div>
          <div className="calendar-modal__nav">
            <button className="calendar-modal__nav-btn" onClick={() => changeMonth(-1)} title="Предыдущий месяц">
              <LuChevronLeft size={17} />
            </button>
            <button className="calendar-modal__nav-btn" onClick={() => changeMonth(1)} title="Следующий месяц">
              <LuChevronRight size={17} />
            </button>
            <button className="calendar-modal__nav-btn" onClick={closeWithAnimation} title="Закрыть">
              <LuX size={17} />
            </button>
          </div>
        </div>
        <div className="calendar-modal__weekdays">
          {WEEKDAYS.map((day) => (
            <div className="calendar-modal__weekday" key={day}>
              {day}
            </div>
          ))}
        </div>
        <div
          key={monthKey}
          className={gridClass}
          style={dragX !== 0 ? { transform: `translateX(${dragX * 0.55}px)`, transition: 'none', animation: 'none' } : undefined}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {cells.map((day, index) =>
            day === null ? (
              <div className="calendar-modal__cell calendar-modal__cell--blank" key={`blank-${index}`}></div>
            ) : (
              <div
                className={[
                  'calendar-modal__cell',
                  isCurrentMonth && day === now.getDate() ? 'calendar-modal__cell--today' : '',
                  day === selectedDay ? 'calendar-modal__cell--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={day}
                onClick={() => setSelectedDay(day)}
              >
                {day}
                {byDay.has(day) && (
                  <span className="calendar-modal__dots">
                    {(byDay.get(day) ?? []).slice(0, 3).map((sub) => (
                      <i key={sub.id} style={{ background: sub.color_hex ?? 'var(--accent)' }}></i>
                    ))}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
        <div className="calendar-modal__total">
          Всего за месяц: <b>{Math.round(monthTotal).toLocaleString('ru-RU')} {currency}</b> · {charges.length}{' '}
          {pluralCharges(charges.length)}
        </div>
        <div className="calendar-modal__day-content" key={`${monthKey}-${selectedDay ?? 'none'}`}>
          <div className="calendar-modal__day-title">
            {selectedDay !== null ? `${selectedDay} ${MONTHS_GEN[month]}` : 'Выбери день'}
          </div>
          {selectedDay === null ? (
            <div className="calendar-modal__empty">Нажми на дату, чтобы увидеть списания</div>
          ) : selectedCharges.length === 0 ? (
            <div className="calendar-modal__empty">В этот день списаний нет</div>
          ) : (
            selectedCharges.map((sub, index) => (
              <div
                className="calendar-modal__charge"
                key={sub.id}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onOpenSubscription?.(sub.id)}
              >
                <SubscriptionLogo
                  name={sub.title}
                  color={sub.color_hex ?? 'var(--accent)'}
                  className="calendar-modal__charge-logo"
                />
                <div className="calendar-modal__charge-info">
                  <b>{sub.title}</b>
                  <small>{periodLabel(sub.period)}</small>
                </div>
                <div className="calendar-modal__charge-amount">
                  {convert(sub.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
