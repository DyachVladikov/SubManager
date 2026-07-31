import { useMemo } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeHeroStats } from '@/entities/subscription/lib/subscriptionStats'
import './HeroCard.scss'

interface HeroCardProps {
  mode: 'month' | 'year'
  onModeChange: (mode: 'month' | 'year') => void
  subscriptions: Subscription[]
}

export function HeroCard({ mode, onModeChange, subscriptions }: HeroCardProps) {
  const stats = useMemo(() => computeHeroStats(subscriptions), [subscriptions])

  const isMonth = mode === 'month'
  const points = isMonth ? stats.dailyCumulative : stats.yearlyTotals
  const labels = isMonth ? stats.monthRangeLabels : stats.yearLabels
  const dotIndex = isMonth ? stats.todayIndex : stats.currentMonthIndex
  const value = isMonth ? stats.monthTotal : stats.yearTotal
  const paid = isMonth ? stats.paidMonth : stats.paidYear
  const remaining = isMonth ? stats.remainingMonth : stats.remainingYear
  const progress = paid + remaining > 0 ? Math.round((paid / (paid + remaining)) * 100) : 0

  const chartWidth = 350
  const chartHeight = 64
  const max = Math.max(...points, 1)
  const coords = points.map((point, i) => ({
    x: 8 + (i * (chartWidth - 16)) / Math.max(points.length - 1, 1),
    y: 54 - (point / max) * 42,
  }))
  const toPath = (list: { x: number; y: number }[]) =>
    list.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const splitIndex = Math.min(dotIndex, coords.length - 1)
  const paidCoords = coords.slice(0, splitIndex + 1)
  const forecastCoords = coords.slice(splitIndex)
  const paidPath = toPath(paidCoords)
  const forecastPath = toPath(forecastCoords)
  const areaPath =
    paidCoords.length > 1
      ? `${paidPath} L${paidCoords[paidCoords.length - 1].x.toFixed(1)} ${chartHeight} L${paidCoords[0].x.toFixed(1)} ${chartHeight} Z`
      : ''
  const dot = coords[splitIndex]

  return (
    <div className="hero-card rise" style={{ animationDelay: '0.06s' }}>
      <div className="hero-card__topline">
        <div className="hero-card__label">
          <i></i>
          <span>{isMonth ? `Расходы · ${stats.currentMonthLabel}` : `Расходы · ${stats.currentYear}`}</span>
        </div>
        <div className={`hero-card__segctl ${mode === 'year' ? 'hero-card__segctl--year' : ''}`}>
          <span className="hero-card__segctl-pill"></span>
          <button
            className={`hero-card__segctl-button ${mode === 'month' ? 'hero-card__segctl-button--active' : ''}`}
            onClick={() => onModeChange('month')}
          >
            Месяц
          </button>
          <button
            className={`hero-card__segctl-button ${mode === 'year' ? 'hero-card__segctl-button--active' : ''}`}
            onClick={() => onModeChange('year')}
          >
            Год
          </button>
        </div>
      </div>
      <div className="hero-card__sum swap" key={`sum-${mode}`}>
        <div className="hero-card__num">{value.toLocaleString('ru-RU')}</div>
        <div className="hero-card__per">₽</div>
      </div>
      <div className="hero-card__row swap" key={`row-${mode}`}>
        <span className="hero-card__servs">
          {isMonth ? `${stats.servicesCount} активных сервисов` : `в среднем ${stats.monthTotal.toLocaleString('ru-RU')} ₽ / мес`}
        </span>
      </div>
      <div className="hero-card__chart">
        <svg width="100%" height="64" viewBox="0 0 350 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a78bfa" stopOpacity=".3" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="350" y2="20" style={{ stroke: 'rgba(255,255,255,.05)' }} strokeDasharray="3 5" />
          <line x1="0" y1="44" x2="350" y2="44" style={{ stroke: 'rgba(255,255,255,.05)' }} strokeDasharray="3 5" />
          {areaPath && <path d={areaPath} fill="url(#sg)" />}
          <path d={paidPath} fill="none" style={{ stroke: '#a78bfa' }} strokeWidth="2" strokeLinecap="round" />
          {forecastCoords.length > 1 && (
            <path
              d={forecastPath}
              fill="none"
              style={{ stroke: '#a78bfa' }}
              strokeOpacity="0.4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 6"
            />
          )}
        </svg>
        <div className="hero-card__chart-dot" style={{ left: `${(dot.x / chartWidth) * 100}%`, top: `${dot.y}px` }}></div>
        <div className="hero-card__range">
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      </div>
      <div className="hero-card__progress swap" key={`progress-${mode}`}>
        <div className="hero-card__progress-row">
          <span>
            <i className="hero-card__dot hero-card__dot--paid"></i>
            <span>{isMonth ? 'Списано' : `Списано в ${stats.currentYear}`}</span> · <b>{paid.toLocaleString('ru-RU')} ₽</b>
          </span>
          <span>
            <i className="hero-card__dot hero-card__dot--remaining"></i>
            <span>{isMonth ? 'Осталось' : 'До конца года'}</span> · <b>{remaining.toLocaleString('ru-RU')} ₽</b>
          </span>
        </div>
        <div className="hero-card__progress-bar">
          <i style={{ width: `${progress}%` }}></i>
        </div>
      </div>
    </div>
  )
}
