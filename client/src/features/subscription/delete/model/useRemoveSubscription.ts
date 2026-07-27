import { useState } from 'react'
import { useDeleteSubscriptionMutation } from '@/entities/subscription/api/subscriptionApi'

interface UseRemoveSubscriptionOptions {
  onDeleted?: () => void
}

export function useRemoveSubscription({ onDeleted }: UseRemoveSubscriptionOptions = {}) {
  const [removingIds, setRemovingIds] = useState<string[]>([])
  const [deleteSubscription] = useDeleteSubscriptionMutation()

  const removeSubscription = (id: string) => {
    setRemovingIds((prev) => [...prev, id])
    setTimeout(async () => {
      try {
        await deleteSubscription(id).unwrap()
        onDeleted?.()
      } catch (error) {
        console.error('Failed to delete subscription:', error)
      } finally {
        setRemovingIds((prev) => prev.filter((x) => x !== id))
      }
    }, 350)
  }

  return { removingIds, removeSubscription }
}
