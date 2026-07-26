import type { InputHTMLAttributes } from 'react'
import './FormField.scss'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <div className="frow">
      <span className="flabel">{label}</span>
      <input className="finput" {...props} />
    </div>
  )
}
