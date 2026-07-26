import type { InputHTMLAttributes } from 'react'
import './FormField.scss'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <div className={`frow ${error ? 'has-error' : ''}`}>
      <span className="flabel">{label}</span>
      <input className="finput" {...props} />
      {error && <span className="ferror">{error}</span>}
    </div>
  )
}
