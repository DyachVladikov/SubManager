import type { Subscription as DbSubscription } from '@/entities/subscription/model/types'
import type { Subscription as MockSubscription } from '@/mocks/subscriptions'

const monthNamesShort = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function formatNextDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = monthNamesShort[date.getMonth()]
  return `${day} ${month}`
}

export function calculateDaysLeft(dateString: string): string {
  const now = new Date()
  const target = new Date(dateString)
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'просрочено'
  if (diffDays === 0) return 'сегодня'
  if (diffDays === 1) return 'завтра'
  if (diffDays < 7) return `через ${diffDays} дн`
  if (diffDays < 30) return `через ${Math.floor(diffDays / 7)} нед`
  return `через ${Math.floor(diffDays / 30)} мес`
}

export function mapSubscription(dbSub: DbSubscription, categoryName?: string): MockSubscription {
  return {
    id: dbSub.id,
    name: dbSub.title,
    price: dbSub.amount,
    color: dbSub.color_hex || '#a78bfa',
    letter: dbSub.title[0].toUpperCase(),
    category: categoryName || 'Другое',
    nextDate: formatNextDate(dbSub.next_payment_date),
    daysLeft: calculateDaysLeft(dbSub.next_payment_date),
    history: [],
    split: undefined,
    dark: false,
  }
}
