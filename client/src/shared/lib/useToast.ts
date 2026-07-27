import { useRef, useState } from 'react'

export type ToastType = 'success' | 'delete'

export function useToast() {
  const [toast, setToast] = useState<ToastType | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: ToastType) => {
    setToast(type)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 1800)
  }

  return { toast, showToast }
}
