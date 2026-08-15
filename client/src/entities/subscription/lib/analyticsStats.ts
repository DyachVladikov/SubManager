import type { Subscription } from '../model/types'
import type { Split } from '@/entities/split/api/splitApi'
import { monthNamesShort, monthNamesFull, totalBefore } from './subscriptionStats'

export interface MonthTotal {
  label: string
  fullLabel: string
  total: number
}

export interface AnalyticsStats {
  monthlyTotals: MonthTotal[]
  monthTotal: number
  yearProjection: number
  dailyAverage: number
  splitReturn: number
  splitFriends: number
}

export function computeAnalyticsStats(subs: Subscription[], splits: Split[]): AnalyticsStats {
  const now = new Date()
  const monthlyTotals: MonthTotal[] = []
  for (let i = 6; i >= 0; i--) {
    const first = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(first.getFullYear(), first.getMonth() + 1, 0, 23, 59, 59, 999)
    monthlyTotals.push({
      label: monthNamesShort[first.getMonth()],
      fullLabel: `${monthNamesFull[first.getMonth()]} ${first.getFullYear()}`,
      total: totalBefore(subs, monthEnd),
    })
  }

  const monthTotal = subs.reduce((acc, sub) => acc + sub.amount, 0)
  const splitReturn = splits.reduce((acc, split) => acc + split.amount, 0)
  const splitFriends = new Set(splits.map((split) => split.debtor_username)).size

  return {
    monthlyTotals,
    monthTotal,
    yearProjection: monthTotal * 12,
    dailyAverage: Math.round(monthTotal / 30),
    splitReturn,
    splitFriends,
  }
}
