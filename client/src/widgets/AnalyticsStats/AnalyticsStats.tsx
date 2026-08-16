import { LuUsers } from 'react-icons/lu'
import type { AnalyticsStats as AnalyticsStatsData } from '@/entities/subscription/lib/analyticsStats'
import './AnalyticsStats.scss'

interface AnalyticsStatsProps {
  stats: AnalyticsStatsData
}

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
  return (
    <div className="analytics-stats rise" style={{ animationDelay: '0.18s' }}>
      <div className="analytics-stats__card">
        <div className="analytics-stats__label">Проекция на год</div>
        <div className="analytics-stats__value">
          {stats.yearProjection.toLocaleString('ru-RU', { useGrouping: false })} <span>₽</span>
        </div>
      </div>
      <div className="analytics-stats__card">
        <div className="analytics-stats__label">В среднем в день</div>
        <div className="analytics-stats__value">
          {stats.dailyAverage.toLocaleString('ru-RU', { useGrouping: false })} <span>₽</span>
        </div>
      </div>
      <div className="analytics-stats__card analytics-stats__card--wide">
        <div>
          <div className="analytics-stats__label">Возврат по split</div>
          <div className="analytics-stats__value">
            {stats.splitReturn.toLocaleString('ru-RU', { useGrouping: false })}{' '}
            <span>
              ₽ / мес · от {stats.splitFriends} {pluralFriends(stats.splitFriends)}
            </span>
          </div>
        </div>
        <div className="analytics-stats__icon">
          <LuUsers size={19} />
        </div>
      </div>
    </div>
  )
}

function pluralFriends(count: number): string {
  return count % 10 === 1 && count % 100 !== 11 ? 'друга' : 'друзей'
}
