import { useState } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import type { MonthTotal } from '@/entities/subscription/lib/analyticsStats'
import { useMoney } from '@/shared/lib/useCurrency'
import './AnalyticsChart.scss'

interface AnalyticsChartProps {
  months: MonthTotal[]
}

export function AnalyticsChart({ months }: AnalyticsChartProps) {
  const { symbol: currency, convert } = useMoney()
  const [selected, setSelected] = useState(months.length - 1)
  const max = Math.max(...months.map((m) => m.total), 1)
  const current = months[selected]
  const previous = selected > 0 ? months[selected - 1] : null
  const delta = previous && previous.total > 0 ? Math.round(((current.total - previous.total) / previous.total) * 100) : null

  return (
    <div className="analytics-chart rise" style={{ animationDelay: '0.14s' }}>
      <div className="analytics-chart__label">
        <i></i>Динамика расходов
      </div>
      <div className="analytics-chart__monthnav">
        <div
          className={`analytics-chart__month-btn${selected === 0 ? ' analytics-chart__month-btn--disabled' : ''}`}
          onClick={() => selected > 0 && setSelected(selected - 1)}
        >
          <LuChevronLeft size={15} />
        </div>
        <div className="analytics-chart__month-title">{current.fullLabel}</div>
        <div
          className={`analytics-chart__month-btn${selected === months.length - 1 ? ' analytics-chart__month-btn--disabled' : ''}`}
          onClick={() => selected < months.length - 1 && setSelected(selected + 1)}
        >
          <LuChevronRight size={15} />
        </div>
      </div>
      <div className="analytics-chart__head">
        <div className="analytics-chart__bignum swap" key={selected}>
          {convert(current.total).toLocaleString('ru-RU', { useGrouping: false })} {currency}
        </div>
        {previous && previous.total > 0 && delta !== null && (
          <span className={`analytics-chart__chip analytics-chart__chip--${delta >= 0 ? 'up' : 'dn'}`}>
            {delta >= 0 ? '+' : ''}
            {delta}% vs {previous.label.toLowerCase()}
          </span>
        )}
      </div>
      <div className="analytics-chart__bars">
        {months.map((month, i) => (
          <div
            key={month.fullLabel}
            className={`analytics-chart__col${i === selected ? ' analytics-chart__col--active' : ''}`}
            onClick={() => setSelected(i)}
          >
            <div className="analytics-chart__bar-wrap">
              <span className="analytics-chart__value">{convert(month.total).toLocaleString('ru-RU', { useGrouping: false })}</span>
              <div
                className="analytics-chart__bar"
                style={{ height: `calc((100% - 18px) * ${Math.max(month.total / max, 0.04)})`, ['--i' as string]: i }}
              ></div>
            </div>
            <span className="analytics-chart__bar-label">{month.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
