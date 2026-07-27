import { LuCheck, LuTrash2 } from 'react-icons/lu'
import type { ToastType } from '@/shared/lib/useToast'
import './Toast.scss'

interface ToastProps {
  type: ToastType
}

export function Toast({ type }: ToastProps) {
  return (
    <div className="toast-overlay">
      <div className="toast">
        <div className={`toast__icon toast__icon--${type}`}>
          {type === 'success' ? <LuCheck size={30} /> : <LuTrash2 size={28} />}
        </div>
        <span className="toast__text">{type === 'success' ? 'Успех' : 'Удалено'}</span>
      </div>
    </div>
  )
}
