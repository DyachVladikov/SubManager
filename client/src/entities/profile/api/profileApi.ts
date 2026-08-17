import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'

export interface Profile {
  id: string
  currency: string
  telegram_id: number | null
  avatar_url: string | null
  created_at: string
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile | null, void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('profiles').select('*').single()
        if (error) return { error }
        return { data: data as Profile }
      },
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<Profile, Partial<Pick<Profile, 'currency' | 'telegram_id' | 'avatar_url'>>>({
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
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi
