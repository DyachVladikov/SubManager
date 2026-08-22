import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'
import {
  addToOutbox,
  appendCachedList,
  isOfflineError,
  readCache,
  removeCachedList,
  updateCachedList,
  writeCache,
} from '@/shared/lib/offlineDb'

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

const SPLITS_KEY = 'splits'

export const splitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSplits: builder.query<Split[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from('splits').select('*')
          if (error) throw error
          void writeCache(SPLITS_KEY, data)
          return { data: data as Split[] }
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Split[]>(SPLITS_KEY)
            if (cached) return { data: cached }
          }
          return { error: error as { message: string } }
        }
      },
      providesTags: ['Subscription'],
    }),

    getSplitsBySubscription: builder.query<Split[], string>({
      queryFn: async (subscriptionId) => {
        try {
          const { data, error } = await supabase
            .from('splits')
            .select('*')
            .eq('subscription_id', subscriptionId)
          if (error) throw error
          return { data: data as Split[] }
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Split[]>(SPLITS_KEY)
            if (cached) return { data: cached.filter((split) => split.subscription_id === subscriptionId) }
          }
          return { error: error as { message: string } }
        }
      },
      providesTags: ['Subscription'],
    }),

    createSplit: builder.mutation<Split, CreateSplitInput>({
      queryFn: async (input) => {
        try {
          const { data, error } = await supabase
            .from('splits')
            .insert([input])
            .select()
            .single()
          if (error) throw error
          return { data: data as Split }
        } catch (error) {
          if (!isOfflineError(error)) return { error: error as { message: string } }
          const now = new Date().toISOString()
          const local: Split = {
            id: crypto.randomUUID(),
            status: 'pending',
            ...input,
            created_at: now,
            updated_at: now,
          }
          await addToOutbox({ table: 'splits', op: 'insert', payload: { ...local } as Record<string, unknown> })
          await appendCachedList(SPLITS_KEY, local)
          return { data: local }
        }
      },
      invalidatesTags: ['Subscription'],
    }),

    updateSplitStatus: builder.mutation<Split, { id: string; status: 'pending' | 'paid' }>({
      queryFn: async ({ id, status }) => {
        try {
          const { data, error } = await supabase
            .from('splits')
            .update({ status })
            .eq('id', id)
            .select()
            .single()
          if (error) throw error
          return { data: data as Split }
        } catch (error) {
          if (!isOfflineError(error)) return { error: error as { message: string } }
          const cached = (await readCache<Split[]>(SPLITS_KEY)) ?? []
          const current = cached.find((split) => split.id === id)
          if (!current) return { error: { message: 'Нет сети и запись не найдена в кеше' } }
          const merged: Split = { ...current, status, updated_at: new Date().toISOString() }
          await addToOutbox({ table: 'splits', op: 'update', payload: { id, status } })
          await updateCachedList<Split>(SPLITS_KEY, id, { status })
          return { data: merged }
        }
      },
      invalidatesTags: ['Subscription'],
    }),

    deleteSplit: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase.from('splits').delete().eq('id', id)
          if (error) throw error
          return { data: undefined }
        } catch (error) {
          if (!isOfflineError(error)) return { error: error as { message: string } }
          await addToOutbox({ table: 'splits', op: 'delete', payload: { id } })
          await removeCachedList(SPLITS_KEY, id)
          return { data: undefined }
        }
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
