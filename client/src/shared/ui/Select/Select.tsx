import { useState, useEffect, useRef } from 'react'
import './Select.scss'

export interface SelectOption {
  value: string
  label: string
  color?: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Select({ options, value, onChange, placeholder = 'Выбери сервис' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const selected = options.find((option) => option.value === value)

  if (isMobile) {
    return (
      <div className="select">
        <select className="select__native" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`select ${open ? 'select--open' : ''}`} ref={rootRef}>
      <div className="select__trigger" onClick={() => setOpen(!open)}>
        {selected ? (
          <span className="select__value">
            {selected.color && <i className="select__dot" style={{ background: selected.color }}></i>}
            {selected.label}
          </span>
        ) : (
          <span className="select__placeholder">{placeholder}</span>
        )}
        <svg className="select__arrow" width="12" height="12" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {open && (
        <div className="select__dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`select__option ${option.value === value ? 'select__option--active' : ''}`}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.color && <i className="select__dot" style={{ background: option.color }}></i>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
