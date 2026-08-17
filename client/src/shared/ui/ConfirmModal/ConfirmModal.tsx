import './ConfirmModal.scss'

interface ConfirmModalProps {
  title: string
  text: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, text, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal__title">{title}</div>
        <p className="confirm-modal__text">{text}</p>
        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>
            Отмена
          </button>
          <button className="confirm-modal__btn confirm-modal__btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
