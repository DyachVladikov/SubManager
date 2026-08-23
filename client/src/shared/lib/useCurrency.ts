import { useCallback, useSyncExternalStore } from 'react'
import { useGetProfileQuery } from '@/entities/profile/api/profileApi'

const symbols: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
}

const fallbackRates: Record<string, number> = {
  RUB: 1,
  USD: 1 / 80,
  EUR: 1 / 93,
}

let rates = fallbackRates
const listeners = new Set<() => void>()

function readCache(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem('fx-rates')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.rates || Date.now() - parsed.at > 24 * 60 * 60 * 1000) return null
    return parsed.rates
  } catch {
    return null
  }
}

async function refreshRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/RUB')
    if (!res.ok) return
    const data = await res.json()
    if (!data?.rates?.USD || !data?.rates?.EUR) return
    rates = { RUB: 1, USD: data.rates.USD, EUR: data.rates.EUR }
    localStorage.setItem('fx-rates', JSON.stringify({ at: Date.now(), rates }))
    listeners.forEach((listener) => listener())
  } catch {}
}

const cached = readCache()
if (cached) {
  rates = { ...fallbackRates, ...cached }
} else {
  refreshRates()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getRates() {
  return rates
}

export function useMoney() {
  const { data: profile } = useGetProfileQuery()
  const code = profile?.currency ?? 'RUB'
  const currentRates = useSyncExternalStore(subscribe, getRates)
  const rate = currentRates[code] ?? 1
  const symbol = symbols[code] ?? '₽'
  const convert = useCallback(
    (amount: number) => {
      const converted = amount * rate
      return code === 'RUB' ? Math.round(converted) : Math.round(converted * 100) / 100
    },
    [rate, code]
  )
  const unconvert = useCallback((amount: number) => amount / rate, [rate])
  return { symbol, convert, unconvert }
}
