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

export interface CategoryStat {
  name: string
  amount: number
  percent: number
}

export function computeCategoryStats(subs: Subscription[], categoryNames: Record<string, string>): CategoryStat[] {
  const totals = new Map<string, number>()
  subs.forEach((sub) => {
    const name = (sub.category_id && categoryNames[sub.category_id]) || 'Другое'
    totals.set(name, (totals.get(name) || 0) + sub.amount)
  })

  const sorted = Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  const total = sorted.reduce((acc, cat) => acc + cat.amount, 0)
  if (total === 0) return []

  const top = sorted.slice(0, 4)
  const rest = sorted.slice(4)
  if (rest.length > 0) {
    top.push({ name: 'Остальное', amount: rest.reduce((acc, cat) => acc + cat.amount, 0) })
  }

  return top.map((cat) => ({
    ...cat,
    percent: Math.round((cat.amount / total) * 100),
  }))
}

export interface HeroStats {
  monthTotal: number
  yearTotal: number
  servicesCount: number
  paidMonth: number
  remainingMonth: number
  paidYear: number
  remainingYear: number
  dailyCumulative: number[]
  todayIndex: number
  monthRangeLabels: string[]
  yearlyTotals: number[]
  yearLabels: string[]
  currentMonthIndex: number
  currentMonthLabel: string
  currentYear: number
}

export function totalBefore(subs: Subscription[], until: Date): number {
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

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDay = now.getDate()

  let paidMonth = 0
  let remainingMonth = 0
  const dailyAmounts = new Array<number>(daysInMonth).fill(0)
  subs.forEach((sub) => {
    const billingDay = Math.min(new Date(sub.next_payment_date).getDate(), daysInMonth)
    dailyAmounts[billingDay - 1] += sub.amount
    if (billingDay <= todayDay) {
      paidMonth += sub.amount
    } else {
      remainingMonth += sub.amount
    }
  })
  const dailyCumulative: number[] = []
  let running = 0
  dailyAmounts.forEach((amount) => {
    running += amount
    dailyCumulative.push(running)
  })
  const todayIndex = Math.min(now.getDate() - 1, daysInMonth - 1)
  const monthRangeLabels = [`1 ${monthNamesShort[month]}`, `${daysInMonth} ${monthNamesShort[month]}`]

  const yearlyTotals: number[] = []
  for (let m = 0; m < 12; m++) {
    const monthEnd = new Date(year, m + 1, 0, 23, 59, 59)
    yearlyTotals.push(totalBefore(subs, monthEnd))
  }

  const paidYear = yearlyTotals.slice(0, month).reduce((a, v) => a + v, 0)
  const remainingYear = yearlyTotals.slice(month).reduce((a, v) => a + v, 0)

  return {
    monthTotal,
    yearTotal: monthTotal * 12,
    servicesCount: subs.length,
    paidMonth,
    remainingMonth,
    paidYear,
    remainingYear,
    dailyCumulative,
    todayIndex,
    monthRangeLabels,
    yearlyTotals,
    yearLabels: monthNamesShort,
    currentMonthIndex: month,
    currentMonthLabel: monthNamesFull[month],
    currentYear: year,
  }
}
