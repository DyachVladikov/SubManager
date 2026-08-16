import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'

export interface Split {
  id: string
  subscription_id: string
  debtor_username: string
  amount: number
  status: 'pending' | 'paid'
  created_at: string
  updated_at: string
}

export interface CreateSplitInput {
  subscription_id: string
  debtor_username: string
  amount: number
}

export const splitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSplits: builder.query<Split[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('splits').select('*')
        if (error) return { error }
        return { data: data as Split[] }
      },
      providesTags: ['Subscription'],
    }),

    getSplitsBySubscription: builder.query<Split[], string>({
      queryFn: async (subscriptionId) => {
        const { data, error } = await supabase
          .from('splits')
          .select('*')
          .eq('subscription_id', subscriptionId)
        if (error) return { error }
        return { data: data as Split[] }
      },
      providesTags: ['Subscription'],
    }),

    createSplit: builder.mutation<Split, CreateSplitInput>({
      queryFn: async (input) => {
        const { data, error } = await supabase
          .from('splits')
          .insert([input])
          .select()
          .single()
        if (error) return { error }
        return { data: data as Split }
      },
      invalidatesTags: ['Subscription'],
    }),

    updateSplitStatus: builder.mutation<Split, { id: string; status: 'pending' | 'paid' }>({
      queryFn: async ({ id, status }) => {
        const { data, error } = await supabase
          .from('splits')
          .update({ status })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data: data as Split }
      },
      invalidatesTags: ['Subscription'],
    }),

    deleteSplit: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('splits').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Subscription'],
    }),
  }),
})

export const {
  useGetSplitsQuery,
  useGetSplitsBySubscriptionQuery,
  useCreateSplitMutation,
  useUpdateSplitStatusMutation,
  useDeleteSplitMutation,
} = splitApi
