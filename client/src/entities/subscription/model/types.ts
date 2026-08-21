export interface Subscription {
  id: string
  user_id: string
  category_id: string | null
  title: string
  amount: number
  currency: string
  next_payment_date: string
  color_hex: string | null
  period: string | null
  remind_before_days: number
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionInput {
  user_id: string
  title: string
  amount: number
  currency?: string
  next_payment_date: string
  category_id?: string | null
  color_hex?: string | null
  period?: string | null
  remind_before_days?: number
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: string
}

export interface Category {
  id: string
  name: string
  icon_name: string | null
  created_at: string
}
