import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscription as DbSubscription } from '../model/types'
import { calculateDaysLeft, calculateOverdueDays, formatNextDate, mapSubscription } from './mapSubscription'

function makeDbSub(patch: Partial<DbSubscription> = {}): DbSubscription {
  return {
    id: 'sub-1',
    user_id: 'user-1',
    category_id: null,
    title: 'spotify',
    amount: 299,
    currency: 'RUB',
    next_payment_date: '2026-01-10',
    color_hex: null,
    period: null,
    remind_before_days: 1,
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2025-12-01T00:00:00Z',
    ...patch,
  }
}

describe('formatNextDate', () => {
  it('formats date as day and short month', () => {
    expect(formatNextDate('2026-02-03')).toBe('3 фев')
  })
})

describe('calculateDaysLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "сегодня" for the same day', () => {
    expect(calculateDaysLeft('2026-01-10')).toBe('сегодня')
  })

  it('returns "завтра" for the next day', () => {
    expect(calculateDaysLeft('2026-01-11')).toBe('завтра')
  })

  it('returns overdue label for past dates', () => {
    expect(calculateDaysLeft('2026-01-06')).toBe('просрочено 4 дня')
  })

  it('returns days within a week', () => {
    expect(calculateDaysLeft('2026-01-15')).toBe('через 5 дн')
  })
})

describe('calculateOverdueDays', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns overdue day count for past dates', () => {
    expect(calculateOverdueDays('2026-01-06')).toBe(4)
  })

  it('returns 0 for today and future dates', () => {
    expect(calculateOverdueDays('2026-01-10')).toBe(0)
    expect(calculateOverdueDays('2026-02-01')).toBe(0)
  })
})

describe('mapSubscription', () => {
  it('applies defaults for missing fields', () => {
    const mapped = mapSubscription(makeDbSub())
    expect(mapped.color).toBe('#a78bfa')
    expect(mapped.category).toBe('Другое')
    expect(mapped.period).toBe('1 month')
    expect(mapped.letter).toBe('S')
    expect(mapped.price).toBe(299)
    expect(mapped.rawDate).toBe('2026-01-10')
  })

  it('keeps provided category name and period', () => {
    const mapped = mapSubscription(makeDbSub({ period: '1 year', color_hex: '#ff0000' }), 'Музыка')
    expect(mapped.category).toBe('Музыка')
    expect(mapped.period).toBe('1 year')
    expect(mapped.color).toBe('#ff0000')
  })
})
