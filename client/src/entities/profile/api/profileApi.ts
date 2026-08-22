import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'
import { isOfflineError, readCache, writeCache } from '@/shared/lib/offlineDb'

export interface Profile {
  id: string
  name: string | null
  currency: string
  theme: string
  telegram_id: number | null
  telegram_username: string | null
  avatar_url: string | null
  notify_charge_day: boolean
  notify_charge_before: boolean
  notify_splits: boolean
  notify_payments_received: boolean
  notify_weekly_digest: boolean
  notify_news: boolean
  created_at: string
}

export type ProfilePatch = Partial<
  Pick<
    Profile,
    | 'name'
    | 'currency'
    | 'theme'
    | 'telegram_id'
    | 'telegram_username'
    | 'avatar_url'
    | 'notify_charge_day'
    | 'notify_charge_before'
    | 'notify_splits'
    | 'notify_payments_received'
    | 'notify_weekly_digest'
    | 'notify_news'
  >
>

const PROFILE_KEY = 'profile'

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile | null, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('*').single()
          if (error) throw error
          void writeCache(PROFILE_KEY, data)
          return { data: data as Profile }
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Profile>(PROFILE_KEY)
            if (cached) return { data: cached }
          }
          return { error: error as { message: string } }
        }
      },
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<Profile, ProfilePatch>({
      queryFn: async (updates) => {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData.user) return { error: userError ?? { message: 'Нет сессии' } }
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userData.user.id)
          .select()
          .single()
        if (error) return { error }
        return { data: data as Profile }
      },
      async onQueryStarted(updates, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          profileApi.util.updateQueryData('getProfile', undefined, (draft) => {
            if (draft) Object.assign(draft, updates)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi
