import { useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'

import { useGetProfileQuery } from '@/entities/profile/api/profileApi'

export function useTheme(enabled: boolean) {
  const { data: profile } = useGetProfileQuery(enabled ? undefined : skipToken)

  useEffect(() => {
    document.documentElement.dataset.theme = profile?.theme ?? 'dark'
  }, [profile?.theme])
}
