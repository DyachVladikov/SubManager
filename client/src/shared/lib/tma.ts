interface TmaWebApp {
  initData: string
  ready: () => void
  expand: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
}

export function getTmaWebApp(): TmaWebApp | null {
  const webApp = (window as unknown as { Telegram?: { WebApp?: TmaWebApp } }).Telegram?.WebApp
  return webApp?.initData ? webApp : null
}

export function initTma(): TmaWebApp | null {
  const webApp = getTmaWebApp()
  if (!webApp) return null
  webApp.ready()
  webApp.expand()
  webApp.setHeaderColor('#0b0b10')
  webApp.setBackgroundColor('#0b0b10')
  return webApp
}
