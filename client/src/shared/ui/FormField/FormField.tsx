import type { InputHTMLAttributes } from 'react'
import './FormField.scss'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <span className="form-field__label">{label}</span>
      <input className="form-field__input" {...props} />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}
