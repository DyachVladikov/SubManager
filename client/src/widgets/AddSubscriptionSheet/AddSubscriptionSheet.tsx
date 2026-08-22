import { useRef, useState } from 'react'
import { AddSubscriptionForm } from '@/features/subscription/add/ui/AddSubscriptionForm'
import './AddSubscriptionSheet.scss'

export interface EditingSubscription {
  id: string
  name: string
  price: string
  date: string
  color: string
  categoryId: string | null
  remindDays?: number
  period?: string | null
}

interface AddSubscriptionSheetProps {
  onClose: () => void
  onSuccess: () => void
  editing?: EditingSubscription | null
}

export function AddSubscriptionSheet({ onClose, onSuccess, editing }: AddSubscriptionSheetProps) {
  const [dragY, setDragY] = useState(0)
  const startYRef = useRef<number | null>(null)

  const onTouchStart = (event: React.TouchEvent) => {
    if (window.matchMedia('(width > 1023px)').matches) return
    startYRef.current = event.touches[0].clientY
  }

  const onTouchMove = (event: React.TouchEvent) => {
    if (startYRef.current === null) return
    const dy = event.touches[0].clientY - startYRef.current
    if (dy > 0) setDragY(dy)
  }

  const onTouchEnd = () => {
    if (dragY > 90) {
      onClose()
      return
    }
    setDragY(0)
    startYRef.current = null
  }

  return (
    <>
      <div className="add-subscription-sheet__overlay" onClick={onClose}></div>
      <div
        className="add-subscription-sheet"
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          className="add-subscription-sheet__drag-zone"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="add-subscription-sheet__grab"></div>
          <div className="add-subscription-sheet__head">
            <div className="add-subscription-sheet__title">
              <i></i>{editing ? 'Редактирование' : 'Новая подписка'}
            </div>
            <div className="add-subscription-sheet__close-btn" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
          </div>
        </div>
        <AddSubscriptionForm
          onClose={onClose}
          onSuccess={onSuccess}
          editingId={editing?.id}
          initialName={editing?.name}
          initialPrice={editing?.price}
          initialDate={editing?.date}
          initialColor={editing?.color}
          initialCategoryId={editing?.categoryId}
          initialRemindDays={editing?.remindDays}
          initialPeriod={editing?.period}
        />
      </div>
    </>
  )
}
