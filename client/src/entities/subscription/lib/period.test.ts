import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addMonths, inferPeriod, periodLabel, periodToMonths, toDateString } from './period'

describe('periodToMonths', () => {
  it('parses month periods', () => {
    expect(periodToMonths('1 month')).toBe(1)
    expect(periodToMonths('3 months')).toBe(3)
    expect(periodToMonths('6 months')).toBe(6)
  })

  it('parses year periods', () => {
    expect(periodToMonths('1 year')).toBe(12)
    expect(periodToMonths('2 years')).toBe(24)
  })

  it('falls back to 1 for empty or unknown values', () => {
    expect(periodToMonths(null)).toBe(1)
    expect(periodToMonths(undefined)).toBe(1)
    expect(periodToMonths('weekly')).toBe(1)
  })
})

describe('addMonths', () => {
  it('adds months keeping the day of month', () => {
    expect(toDateString(addMonths(new Date(2026, 0, 15), 3))).toBe('2026-04-15')
  })

  it('clamps to the last day of a short month', () => {
    expect(toDateString(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28')
  })

  it('handles year rollover', () => {
    expect(toDateString(addMonths(new Date(2025, 11, 10), 3))).toBe('2026-03-10')
  })
})

describe('inferPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('detects common periods by same day of month', () => {
    expect(inferPeriod('2026-02-15')).toBe('1 month')
    expect(inferPeriod('2026-04-15')).toBe('3 months')
    expect(inferPeriod('2026-07-15')).toBe('6 months')
    expect(inferPeriod('2027-01-15')).toBe('1 year')
  })

  it('defaults to monthly when the day of month differs', () => {
    expect(inferPeriod('2026-04-16')).toBe('1 month')
  })
})

describe('periodLabel', () => {
  it('returns human-readable labels', () => {
    expect(periodLabel('1 month')).toBe('каждый месяц')
    expect(periodLabel('3 months')).toBe('раз в 3 месяца')
    expect(periodLabel('6 months')).toBe('раз в полгода')
    expect(periodLabel('1 year')).toBe('раз в год')
    expect(periodLabel('4 months')).toBe('раз в 4 мес')
  })
})

describe('toDateString', () => {
  it('pads month and day', () => {
    expect(toDateString(new Date(2026, 1, 3))).toBe('2026-02-03')
  })
})
