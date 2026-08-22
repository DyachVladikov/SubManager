import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { setupListeners } from '@reduxjs/toolkit/query'
import { store } from '@/app/store'
import { setupOutboxSync } from '@/shared/lib/outboxSync'
import '@a1rth/css-normalize'
import '@/shared/styles/globals.scss'
import App from '@/app/App'

setupListeners(store.dispatch)
setupOutboxSync(store.dispatch)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
