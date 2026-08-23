import { afterEach, describe, expect, it, vi } from 'vitest'
import { isOfflineError } from './offlineDb'

describe('isOfflineError', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the environment reports offline', () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(isOfflineError(new Error('anything'))).toBe(true)
  })

  it('detects network failures by message when online', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(isOfflineError(new Error('Failed to fetch'))).toBe(true)
    expect(isOfflineError(new Error('Load failed'))).toBe(true)
    expect(isOfflineError(new Error('NetworkError when attempting to fetch resource'))).toBe(true)
    expect(isOfflineError({ message: 'failed to fetch' })).toBe(true)
  })

  it('returns false for other errors when online', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(isOfflineError(new Error('JWT expired'))).toBe(false)
    expect(isOfflineError({ message: 'row not found' })).toBe(false)
    expect(isOfflineError(null)).toBe(false)
    expect(isOfflineError(undefined)).toBe(false)
  })
})
