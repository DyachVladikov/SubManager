import { describe, expect, it } from 'vitest'
import type { Subscription } from '../model/types'
import { chargesForMonth } from './chargeDates'

function makeSub(id: string, date: string, period: string | null = '1 month'): Subscription {
  return {
    id,
    user_id: 'user-1',
    category_id: null,
    title: id,
    amount: 100,
    currency: 'RUB',
    next_payment_date: date,
    color_hex: null,
    period,
    remind_before_days: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }
}

describe('chargesForMonth', () => {
  it('places a monthly subscription on the same day of each month', () => {
    const charges = chargesForMonth([makeSub('a', '2026-01-10')], 2026, 2)
    expect(charges.map((charge) => charge.day)).toEqual([10])
  })

  it('includes the anchor month itself', () => {
    expect(chargesForMonth([makeSub('a', '2026-01-10')], 2026, 0)).toHaveLength(1)
  })

  it('skips months that do not match the period step', () => {
    const sub = makeSub('a', '2026-01-10', '3 months')
    expect(chargesForMonth([sub], 2026, 1)).toHaveLength(0)
    expect(chargesForMonth([sub], 2026, 3)).toHaveLength(1)
  })

  it('handles yearly period across years', () => {
    const sub = makeSub('a', '2025-03-05', '1 year')
    expect(chargesForMonth([sub], 2026, 2)).toHaveLength(1)
    expect(chargesForMonth([sub], 2026, 3)).toHaveLength(0)
  })

  it('clamps day 31 to the last day of a short month', () => {
    const charges = chargesForMonth([makeSub('a', '2026-01-31')], 2026, 1)
    expect(charges.map((charge) => charge.day)).toEqual([28])
  })

  it('resolves past months too', () => {
    expect(chargesForMonth([makeSub('a', '2026-06-15')], 2026, 2)).toHaveLength(1)
  })

  it('sorts charges by day and skips invalid dates', () => {
    const charges = chargesForMonth(
      [makeSub('b', 'not-a-date'), makeSub('c', '2026-02-20'), makeSub('d', '2026-02-03')],
      2026,
      1,
    )
    expect(charges.map((charge) => charge.day)).toEqual([3, 20])
  })
})
