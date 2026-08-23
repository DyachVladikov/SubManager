export interface Payment {
  id: string
  user_id: string
  subscription_id: string
  amount: number
  currency: string
  paid_at: string
  created_at: string
}

export interface CreatePaymentInput {
  user_id: string
  subscription_id: string
  amount: number
  currency?: string
  paid_at?: string
}
