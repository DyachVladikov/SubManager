export function periodToMonths(period: string | null | undefined): number {
  if (!period) return 1
  const months = period.match(/(\d+)\s*mon/)
  if (months) return Math.max(1, Number(months[1]))
  const years = period.match(/(\d+)\s*year/)
  if (years) return Math.max(1, Number(years[1]) * 12)
  return 1
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  const day = next.getDate()
  next.setMonth(next.getMonth() + months)
  if (next.getDate() !== day) next.setDate(0)
  return next
}

export function inferPeriod(dateString: string): string {
  const now = new Date()
  const target = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(target.getTime()) || target.getDate() !== now.getDate()) return '1 month'
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  if (months === 3) return '3 months'
  if (months === 6) return '6 months'
  if (months === 12) return '1 year'
  return '1 month'
}

export function periodLabel(period: string | null | undefined): string {
  const months = periodToMonths(period)
  if (months === 1) return 'каждый месяц'
  if (months === 3) return 'раз в 3 месяца'
  if (months === 6) return 'раз в полгода'
  if (months === 12) return 'раз в год'
  return `раз в ${months} мес`
}

export function toDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
