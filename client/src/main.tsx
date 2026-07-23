import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@a1rth/css-normalize'
import '@/shared/styles/globals.scss'
import App from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
