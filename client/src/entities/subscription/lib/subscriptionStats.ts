import type { Subscription } from '../model/types'

export const monthNamesShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
export const monthNamesFull = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export interface HeroStats {
  monthTotal: number
  yearTotal: number
  servicesCount: number
  paidMonth: number
  remainingMonth: number
  paidYear: number
  remainingYear: number
  monthlyTotals: number[]
  yearlyTotals: number[]
  monthLabels: string[]
  yearLabels: string[]
  currentMonthLabel: string
  currentYear: number
}

function totalBefore(subs: Subscription[], until: Date): number {
  return subs.reduce((acc, sub) => {
    if (sub.created_at && new Date(sub.created_at) > until) return acc
    return acc + sub.amount
  }, 0)
}

export function computeHeroStats(subs: Subscription[]): HeroStats {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const monthTotal = subs.reduce((acc, sub) => acc + sub.amount, 0)

  let paidMonth = 0
  let remainingMonth = 0
  subs.forEach((sub) => {
    const next = new Date(sub.next_payment_date)
    const alreadyPaidThisMonth = next.getFullYear() > year || (next.getFullYear() === year && next.getMonth() > month)
    if (alreadyPaidThisMonth) {
      paidMonth += sub.amount
    } else {
      remainingMonth += sub.amount
    }
  })

  const monthlyTotals: number[] = []
  const monthLabels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(year, month - i + 1, 0, 23, 59, 59)
    monthlyTotals.push(totalBefore(subs, date))
    monthLabels.push(monthNamesShort[date.getMonth()])
  }

  const yearlyTotals: number[] = []
  for (let m = 0; m < 12; m++) {
    const monthEnd = new Date(year, m + 1, 0, 23, 59, 59)
    yearlyTotals.push(totalBefore(subs, monthEnd))
  }

  const paidYear = yearlyTotals.slice(0, month).reduce((a, v) => a + v, 0)
  const remainingYear = yearlyTotals.slice(month).reduce((a, v) => a + v, 0)

  return {
    monthTotal,
    yearTotal: monthlyTotals[monthlyTotals.length - 1] * 12,
    servicesCount: subs.length,
    paidMonth,
    remainingMonth,
    paidYear,
    remainingYear,
    monthlyTotals,
    yearlyTotals,
    monthLabels,
    yearLabels: monthNamesShort,
    currentMonthLabel: monthNamesFull[month],
    currentYear: year,
  }
}
