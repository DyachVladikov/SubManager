import { AddSubscriptionForm } from '@/features/subscription/add/ui/AddSubscriptionForm'
import './AddSubscriptionSheet.scss'

interface AddSubscriptionSheetProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddSubscriptionSheet({ onClose, onSuccess }: AddSubscriptionSheetProps) {
  return (
    <>
      <div className="add-subscription-sheet__overlay" onClick={onClose}></div>
      <div className="add-subscription-sheet">
        <div className="add-subscription-sheet__grab"></div>
        <div className="add-subscription-sheet__head">
          <div className="add-subscription-sheet__title">
            <i></i>Новая подписка
          </div>
          <div className="add-subscription-sheet__close-btn" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
        </div>
        <AddSubscriptionForm onClose={onClose} onSuccess={onSuccess} />
      </div>
    </>
  )
}
