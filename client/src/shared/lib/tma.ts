import { expandViewport, init, miniApp, retrieveRawInitData } from '@telegram-apps/sdk'

export function getTmaInitData(): string | null {
  try {
    return retrieveRawInitData() || null
  } catch {
    return null
  }
}

export function initTma(): string | null {
  const initDataRaw = getTmaInitData()
  if (!initDataRaw) return null
  try {
    init()
    if (miniApp.mount.isAvailable()) {
      miniApp.mount()
      if (miniApp.setHeaderColor.isAvailable()) miniApp.setHeaderColor('#0b0b10')
      if (miniApp.setBackgroundColor.isAvailable()) miniApp.setBackgroundColor('#0b0b10')
      miniApp.ready()
    }
    if (expandViewport.isAvailable()) expandViewport()
  } catch {}
  return initDataRaw
}
