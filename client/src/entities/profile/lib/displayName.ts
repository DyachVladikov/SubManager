import type { User } from '@supabase/supabase-js'

import type { Profile } from '../api/profileApi'

export function isTmaUser(user: User | null | undefined): boolean {
  return Boolean(user?.email?.endsWith('@tma.submanager.local'))
}

export function displayName(profile: Profile | null | undefined, user: User | null | undefined): string {
  const email = user?.email ?? ''
  return (
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (!isTmaUser(user) && email ? email.split('@')[0] : null) ||
    profile?.telegram_username ||
    'друг'
  )
}
