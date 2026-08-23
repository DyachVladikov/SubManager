import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscription } from '../model/types'
import { computeCategoryStats, computeHeroStats, totalBefore } from './subscriptionStats'

function makeSub(id: string, amount: number, categoryId: string | null = null, patch: Partial<Subscription> = {}): Subscription {
  return {
    id,
    user_id: 'user-1',
    category_id: categoryId,
    title: id,
    amount,
    currency: 'RUB',
    next_payment_date: '2026-01-15',
    color_hex: null,
    period: '1 month',
    remind_before_days: 1,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    ...patch,
  }
}

describe('computeCategoryStats', () => {
  it('sums amounts per category and sorts descending', () => {
    const stats = computeCategoryStats(
      [makeSub('a', 100, 'c1'), makeSub('b', 300, 'c2'), makeSub('c', 200, 'c1')],
      { c1: 'Музыка', c2: 'Кино' },
    )
    expect(stats.map((s) => [s.name, s.amount])).toEqual([
      ['Музыка', 300],
      ['Кино', 300],
    ])
    expect(stats[0].percent).toBe(50)
  })

  it('falls back to "Другое" without category', () => {
    const stats = computeCategoryStats([makeSub('a', 100)], {})
    expect(stats[0].name).toBe('Другое')
  })

  it('collapses everything past top-4 into "Остальное"', () => {
    const subs = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((id, index) => makeSub(`s${index}`, (index + 1) * 100, id))
    const names = Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((id) => [id, id]))
    const stats = computeCategoryStats(subs, names)
    expect(stats).toHaveLength(5)
    expect(stats[4].name).toBe('Остальное')
    expect(stats[4].amount).toBe(100 + 200)
  })

  it('returns empty list for zero total', () => {
    expect(computeCategoryStats([makeSub('a', 0)], {})).toEqual([])
  })
})

describe('totalBefore', () => {
  it('sums only subscriptions created before the date', () => {
    const subs = [
      makeSub('a', 100, null, { created_at: '2025-05-01T00:00:00Z' }),
      makeSub('b', 200, null, { created_at: '2025-08-01T00:00:00Z' }),
    ]
    expect(totalBefore(subs, new Date(2025, 5, 30))).toBe(100)
    expect(totalBefore(subs, new Date(2025, 11, 31))).toBe(300)
  })
})

describe('computeHeroStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes totals and counts', () => {
    const stats = computeHeroStats([
      makeSub('a', 100, null, { next_payment_date: '2026-01-05' }),
      makeSub('b', 300, null, { next_payment_date: '2026-01-20' }),
    ])
    expect(stats.monthTotal).toBe(400)
    expect(stats.yearTotal).toBe(4800)
    expect(stats.servicesCount).toBe(2)
  })

  it('splits paid and remaining amounts by billing day', () => {
    const stats = computeHeroStats([
      makeSub('a', 100, null, { next_payment_date: '2026-01-05' }),
      makeSub('b', 300, null, { next_payment_date: '2026-01-20' }),
    ])
    expect(stats.paidMonth).toBe(100)
    expect(stats.remainingMonth).toBe(300)
    expect(stats.todayIndex).toBe(9)
  })

  it('builds cumulative daily amounts', () => {
    const stats = computeHeroStats([
      makeSub('a', 100, null, { next_payment_date: '2026-01-05' }),
      makeSub('b', 50, null, { next_payment_date: '2026-01-05' }),
    ])
    expect(stats.dailyCumulative).toHaveLength(31)
    expect(stats.dailyCumulative[4]).toBe(150)
    expect(stats.dailyCumulative[30]).toBe(150)
  })
})
