import type { Subscription } from '@/mocks/subscriptions'
import './AllPaymentsSheet.scss'

interface AllPaymentsSheetProps {
  subscriptions: Subscription[]
  onClose: () => void
  onOpen: (id: string) => void
}

export function AllPaymentsSheet({ subscriptions, onClose, onOpen }: AllPaymentsSheetProps) {
  return (
    <>
      <div className="all-payments-sheet__overlay" onClick={onClose}></div>
      <div className="all-payments-sheet">
        <div className="all-payments-sheet__grab"></div>
        <div className="all-payments-sheet__head">
          <div className="all-payments-sheet__title">
            <i></i>Все списания
          </div>
          <div className="all-payments-sheet__close-btn" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
        </div>
        <div className="all-payments-sheet__list">
          {subscriptions.map((sub) => (
            <div className="all-payments-sheet__item" key={sub.id} onClick={() => onOpen(sub.id)}>
              <div className="all-payments-sheet__date">
                <b>{sub.nextDate.split(' ')[0]}</b>
                <span>{sub.nextDate.split(' ')[1]}</span>
              </div>
              <div
                className="all-payments-sheet__logo"
                style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}
              >
                {sub.letter}
              </div>
              <div className="all-payments-sheet__info">
                <div className="all-payments-sheet__name">{sub.name}</div>
                <div className="all-payments-sheet__left">{sub.daysLeft}</div>
              </div>
              <div className="all-payments-sheet__amount">{sub.price.toLocaleString('ru-RU')} ₽</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
