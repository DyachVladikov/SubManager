import { useState, useEffect } from 'react'
import { useCreateSubscriptionMutation, useUpdateSubscriptionMutation } from '@/entities/subscription/api/subscriptionApi'
import { useCreateSplitMutation } from '@/entities/split/api/splitApi'
import { FormField } from '@/shared/ui/FormField'
import { supabase } from '@/shared/config/supabase'
import './AddSubscriptionForm.scss'

const presetColors = ['#e50914', '#ff7a00', '#ffd34d', '#1db954', '#3a9bf0', '#a78bfa']

const popularServices = [
  { name: 'Netflix', color: '#e50914' },
  { name: 'Яндекс Плюс', color: '#fc3f1d' },
  { name: 'YouTube Premium', color: '#ff0000' },
  { name: 'Spotify', color: '#1db954' },
  { name: 'Кинопоиск', color: '#ff7a00' },
  { name: 'VK Музыка', color: '#0077ff' },
  { name: 'Okko', color: '#a78bfa' },
  { name: 'Apple Music', color: '#fa2d48' },
]

interface AddSubscriptionFormProps {
  onClose: () => void
  onSuccess?: () => void
  editingId?: string
  initialName?: string
  initialPrice?: string
  initialDate?: string
  initialColor?: string
}

export function AddSubscriptionForm({ onClose, onSuccess, editingId, initialName = '', initialPrice = '', initialDate = '', initialColor = '#a78bfa' }: AddSubscriptionFormProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [date, setDate] = useState(initialDate)
  const [color, setColor] = useState(initialColor)
  const [isSplit, setIsSplit] = useState(false)
  const [splitUsername, setSplitUsername] = useState('')
  const [splitAmount, setSplitAmount] = useState('')
  const [splitMode, setSplitMode] = useState<'rub' | 'pct'>('rub')
  const [userId, setUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation()
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation()
  const [createSplit] = useCreateSplitMutation()
  const isLoading = isCreating || isUpdating

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
    if (isSplit) {
      const value = Number(splitAmount)
      if (!splitAmount || value <= 0) {
        newErrors.splitAmount = 'Обязательное поле'
      } else if (splitMode === 'pct' && value >= 100) {
        newErrors.splitAmount = 'От 1 до 99'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !userId) return

    try {
      const splitAmountValue = splitMode === 'pct' ? Math.round((Number(price) * Number(splitAmount)) / 100) : Number(splitAmount)

      if (editingId) {
        await updateSubscription({
          id: editingId,
          title: name,
          amount: Number(price),
          next_payment_date: date,
          color_hex: color,
        }).unwrap()

        if (isSplit && splitUsername.trim()) {
          await createSplit({
            subscription_id: editingId,
            debtor_username: splitUsername,
            amount: splitAmountValue,
          }).unwrap()
        }
      } else {
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
            amount: splitAmountValue,
          }).unwrap()
        }
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save subscription:', error)
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
      {!editingId && (
        <div className="add-form__row">
          <span className="add-form__label">Популярные</span>
          <div className="add-form__presets">
            {popularServices.map((service) => (
              <div
                key={service.name}
                className="add-form__preset"
                onClick={() => {
                  setName(service.name)
                  setColor(service.color)
                  clearError('name')
                }}
              >
                <i style={{ background: service.color }}></i>
                {service.name}
              </div>
            ))}
          </div>
        </div>
      )}
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
          <div className="add-form__row">
            <div className="add-form__label-row">
              <span className="add-form__label">{splitMode === 'rub' ? 'Сумма доли' : 'Доля в процентах'}</span>
              <div className="add-form__unit-toggle">
                <span
                  className={`add-form__unit ${splitMode === 'rub' ? 'add-form__unit--active' : ''}`}
                  onClick={() => setSplitMode('rub')}
                >
                  ₽
                </span>
                <span
                  className={`add-form__unit ${splitMode === 'pct' ? 'add-form__unit--active' : ''}`}
                  onClick={() => setSplitMode('pct')}
                >
                  %
                </span>
              </div>
            </div>
            <FormField
              label=""
              type="number"
              value={splitAmount}
              onChange={(e) => {
                setSplitAmount(e.target.value)
                clearError('splitAmount')
              }}
              placeholder={splitMode === 'rub' ? '266' : '33'}
              error={errors.splitAmount}
            />
          </div>
        </>
      )}

      <button className="add-form__submit" type="submit" disabled={isLoading || !userId}>
        {isLoading ? 'Сохранение...' : editingId ? 'Сохранить' : 'Добавить подписку'}
      </button>
    </form>
  )
}
