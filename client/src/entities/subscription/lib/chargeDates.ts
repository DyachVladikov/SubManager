import type { Subscription } from '../model/types'
import { periodToMonths } from './period'

export interface MonthCharge {
  day: number
  subscription: Subscription
}

export function chargesForMonth(subscriptions: Subscription[], year: number, month: number): MonthCharge[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const charges: MonthCharge[] = []
  for (const sub of subscriptions) {
    const anchor = new Date(`${sub.next_payment_date}T00:00:00`)
    if (Number.isNaN(anchor.getTime())) continue
    const step = periodToMonths(sub.period)
    const monthsDiff = (year - anchor.getFullYear()) * 12 + (month - anchor.getMonth())
    if (((monthsDiff % step) + step) % step !== 0) continue
    charges.push({ day: Math.min(anchor.getDate(), daysInMonth), subscription: sub })
  }
  return charges.sort((a, b) => a.day - b.day)
}
