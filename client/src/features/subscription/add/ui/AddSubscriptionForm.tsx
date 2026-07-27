import { useState, useEffect } from 'react'
import { useCreateSubscriptionMutation } from '@/entities/subscription/api/subscriptionApi'
import { useCreateSplitMutation } from '@/entities/split/api/splitApi'
import { FormField } from '@/shared/ui/FormField'
import { supabase } from '@/shared/config/supabase'
import './AddSubscriptionForm.scss'

const presetColors = ['#e50914', '#ff7a00', '#ffd34d', '#1db954', '#3a9bf0', '#a78bfa']

interface AddSubscriptionFormProps {
  onClose: () => void
  onSuccess?: () => void
  initialName?: string
  initialPrice?: string
  initialColor?: string
}

export function AddSubscriptionForm({ onClose, onSuccess, initialName = '', initialPrice = '', initialColor = '#a78bfa' }: AddSubscriptionFormProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [date, setDate] = useState('')
  const [color, setColor] = useState(initialColor)
  const [isSplit, setIsSplit] = useState(false)
  const [splitUsername, setSplitUsername] = useState('')
  const [splitAmount, setSplitAmount] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation()
  const [createSplit] = useCreateSplitMutation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null)
    })
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Обязательное поле'
    if (!price || Number(price) <= 0) newErrors.price = 'Обязательное поле'
    if (!date) {
      newErrors.date = 'Обязательное поле'
    } else {
      const year = Number(date.split('-')[0])
      if (year < 2020 || year > 2100) newErrors.date = 'Некорректный год'
    }
    if (isSplit && !splitUsername.trim()) newErrors.splitUsername = 'Обязательное поле'
    if (isSplit && (!splitAmount || Number(splitAmount) <= 0)) newErrors.splitAmount = 'Обязательное поле'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !userId) return

    try {
      const subscription = await createSubscription({
        title: name,
        amount: Number(price),
        currency: 'RUB',
        next_payment_date: date,
        color_hex: color,
        user_id: userId,
      }).unwrap()

      if (isSplit && subscription) {
        await createSplit({
          subscription_id: subscription.id,
          debtor_username: splitUsername,
          amount: Number(splitAmount),
        }).unwrap()
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create subscription:', error)
    }
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Название"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          clearError('name')
        }}
        placeholder="Netflix"
        error={errors.name}
      />
      <FormField
        label="Сумма · ₽/мес"
        type="number"
        value={price}
        onChange={(e) => {
          setPrice(e.target.value)
          clearError('price')
        }}
        placeholder="799"
        error={errors.price}
      />
      <FormField
        label="Следующее списание"
        type="date"
        value={date}
        min={new Date().toISOString().split('T')[0]}
        max="2100-12-31"
        onChange={(e) => {
          const value = e.target.value
          if (value && value.split('-')[0].length > 4) return
          setDate(value)
          clearError('date')
        }}
        error={errors.date}
      />
      <div className="add-form__row">
        <span className="add-form__label">Цвет карточки</span>
        <div className="add-form__colors">
          {presetColors.map((c) => (
            <div
              key={c}
              className={`add-form__color ${color === c ? 'add-form__color--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            ></div>
          ))}
        </div>
      </div>

      <div className="add-form__row">
        <div className="add-form__setrow">
          <div>
            Разделить оплату
            <small>Добавить друга по @username</small>
          </div>
          <div className={`add-form__switch ${isSplit ? 'add-form__switch--on' : ''}`} onClick={() => setIsSplit(!isSplit)}></div>
        </div>
      </div>

      {isSplit && (
        <>
          <FormField
            label="Telegram username друга"
            type="text"
            value={splitUsername}
            onChange={(e) => {
              setSplitUsername(e.target.value)
              clearError('splitUsername')
            }}
            placeholder="@kostya"
            error={errors.splitUsername}
          />
          <FormField
            label="Сумма доли · ₽"
            type="number"
            value={splitAmount}
            onChange={(e) => {
              setSplitAmount(e.target.value)
              clearError('splitAmount')
            }}
            placeholder="266"
            error={errors.splitAmount}
          />
        </>
      )}

      <button className="add-form__submit" type="submit" disabled={isLoading || !userId}>
        {isLoading ? 'Сохранение...' : 'Добавить подписку'}
      </button>
    </form>
  )
}
