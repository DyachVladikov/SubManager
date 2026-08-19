import { useEffect, useState } from 'react'
import { supabase } from '@/shared/config/supabase'
import { initTma } from '@/shared/lib/tma'

type TmaAuthState = 'none' | 'signing' | 'failed'

export function useTmaAuth() {
  const [state, setState] = useState<TmaAuthState>('none')

  useEffect(() => {
    const webApp = initTma()
    if (!webApp) return
    setState('signing')
    fetch('/api/tma-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: webApp.initData }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        return (await res.json()) as { token_hash: string }
      })
      .then(({ token_hash }) => supabase.auth.verifyOtp({ type: 'email', token_hash }))
      .then(({ error }) => setState(error ? 'failed' : 'none'))
      .catch(() => setState('failed'))
  }, [])

  return state
}
