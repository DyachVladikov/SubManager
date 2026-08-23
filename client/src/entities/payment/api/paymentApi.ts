import { baseApi } from '@/shared/api/baseApi'
import { supabase } from '@/shared/config/supabase'
import { addToOutbox, appendCachedList, isOfflineError, readCache, writeCache } from '@/shared/lib/offlineDb'
import type { CreatePaymentInput, Payment } from '../model/types'

const paymentsKey = (subscriptionId: string) => `payments:${subscriptionId}`

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], string>({
      queryFn: async (subscriptionId) => {
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .order('paid_at', { ascending: false })
          if (error) throw error
          void writeCache(paymentsKey(subscriptionId), data)
          return { data: data as Payment[] }
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Payment[]>(paymentsKey(subscriptionId))
            if (cached) return { data: cached }
          }
          return { error: error as { message: string } }
        }
      },
      providesTags: ['Payment'],
    }),

    addPayment: builder.mutation<Payment, CreatePaymentInput>({
      queryFn: async (input) => {
        try {
          const { data, error } = await supabase.from('payments').insert([input]).select().single()
          if (error) throw error
          return { data: data as Payment }
        } catch (error) {
          if (!isOfflineError(error)) return { error: error as { message: string } }
          const local: Payment = {
            id: crypto.randomUUID(),
            currency: 'RUB',
            paid_at: new Date().toISOString().slice(0, 10),
            ...input,
            created_at: new Date().toISOString(),
          }
          await addToOutbox({ table: 'payments', op: 'insert', payload: { ...local } as Record<string, unknown> })
          await appendCachedList(paymentsKey(input.subscription_id), local)
          return { data: local }
        }
      },
      invalidatesTags: ['Payment'],
    }),
  }),
})

export const { useGetPaymentsQuery, useAddPaymentMutation } = paymentApi
