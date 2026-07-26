import { useState } from 'react'
import { useCreateSubscriptionMutation } from '@/entities/subscription/api/subscriptionApi'
import './AddSubscriptionForm.scss'

const presetColors = ['#e50914', '#ff7a00', '#ffd34d', '#1db954', '#3a9bf0', '#a78bfa']

interface AddSubscriptionFormProps {
  onClose: () => void
  initialName?: string
  initialPrice?: number
  initialColor?: string
}

export function AddSubscriptionForm({ onClose, initialName = '', initialPrice = 0, initialColor = '#a78bfa' }: AddSubscriptionFormProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [date, setDate] = useState('')
  const [color, setColor] = useState(initialColor)
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !date) return

    try {
      await createSubscription({
        title: name,
        amount: price,
        currency: 'RUB',
        next_payment_date: date,
        color_hex: color,
      }).unwrap()
      onClose()
    } catch (error) {
      console.error('Failed to create subscription:', error)
    }
  }

  return (
    <form className="add-subscription-form" onSubmit={handleSubmit}>
      <div className="frow">
        <span className="flabel">Название</span>
        <input
          className="finput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Netflix"
          required
        />
      </div>
      <div className="frow">
        <span className="flabel">Сумма · ₽/мес</span>
        <input
          className="finput"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="799"
          required
        />
      </div>
      <div className="frow">
        <span className="flabel">Следующее списание</span>
        <input
          className="finput"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="frow">
        <span className="flabel">Цвет карточки</span>
        <div className="colors">
          {presetColors.map((c) => (
            <div
              key={c}
              className={`cdot ${color === c ? 'on' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            ></div>
          ))}
        </div>
      </div>
      <button className="addbtn" type="submit" disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Добавить подписку'}
      </button>
    </form>
  )
}
