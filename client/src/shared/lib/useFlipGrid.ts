import { useLayoutEffect, useRef, type RefObject } from 'react'

export function useFlipGrid<T extends HTMLElement>(ref: RefObject<T | null>) {
  const positionsRef = useRef<Map<string, { left: number; top: number }>>(new Map())
  const heightRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const container = ref.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const prevHeight = heightRef.current
    if (prevHeight !== null && Math.abs(prevHeight - containerRect.height) > 1) {
      const heightAnimation = container.animate(
        [{ height: `${prevHeight}px` }, { height: `${containerRect.height}px` }],
        { duration: 320, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
      )
      container.style.overflow = 'hidden'
      heightAnimation.finished
        .catch(() => {})
        .then(() => {
          container.style.overflow = ''
        })
    }
    heightRef.current = containerRect.height

    const next = new Map<string, { left: number; top: number }>()
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      const id = el.dataset.flipId as string
      const rect = el.getBoundingClientRect()
      next.set(id, { left: rect.left, top: rect.top })
      const prev = positionsRef.current.get(id)
      if (prev) {
        const dx = prev.left - rect.left
        const dy = prev.top - rect.top
        if (dx !== 0 || dy !== 0) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
            { duration: 320, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
          )
        }
      }
    })
    positionsRef.current = next
  })
}
