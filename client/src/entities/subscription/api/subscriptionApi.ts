import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  Category,
} from '../model/types'

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('next_payment_date', { ascending: true })
        if (error) return { error }
        return { data: data as Subscription[] }
      },
      providesTags: ['Subscription'],
    }),

    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('categories').select('*')
        if (error) return { error }
        return { data: data as Category[] }
      },
      providesTags: ['Category'],
    }),

    createSubscription: builder.mutation<Subscription, CreateSubscriptionInput>({
      queryFn: async (input) => {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([input])
          .select()
          .single()
        if (error) return { error }
        return { data: data as Subscription }
      },
      invalidatesTags: ['Subscription'],
    }),

    updateSubscription: builder.mutation<Subscription, UpdateSubscriptionInput>({
      queryFn: async ({ id, ...updates }) => {
        const { data, error } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data: data as Subscription }
      },
      invalidatesTags: ['Subscription'],
    }),

    deleteSubscription: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('subscriptions').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Subscription'],
    }),
  }),
})

export const {
  useGetSubscriptionsQuery,
  useGetCategoriesQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi
