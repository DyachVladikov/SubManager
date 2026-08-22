import { useEffect, useState } from 'react'
import { supabase } from '@/shared/config/supabase'
import { withTimeout } from '@/shared/lib/withTimeout'
import { clearOfflineData } from '@/shared/lib/offlineDb'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    withTimeout(supabase.auth.getSession(), 4000)
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await clearOfflineData()
    return supabase.auth.signOut()
  }

  return { session, loading, signOut }
}
