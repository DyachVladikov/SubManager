import { useState, useEffect } from 'react'
import { useCreateSubscriptionMutation, useUpdateSubscriptionMutation, useGetCategoriesQuery } from '@/entities/subscription/api/subscriptionApi'
import { useCreateSplitMutation } from '@/entities/split/api/splitApi'
import { presetCatalog } from '@/entities/subscription/model/presetCatalog'
import { FormField } from '@/shared/ui/FormField'
import { Select } from '@/shared/ui/Select'
import { supabase } from '@/shared/config/supabase'
import './AddSubscriptionForm.scss'

const presetColors = ['#e50914', '#ff7a00', '#ffd34d', '#1db954', '#3a9bf0', '#a78bfa']

const remindOptions = [
  { value: '0', label: 'В день списания' },
  { value: '1', label: 'За день до списания' },
  { value: '3', label: 'За 3 дня' },
  { value: '7', label: 'За 7 дней' },
]

const getDefaultDate = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

interface AddSubscriptionFormProps {
  onClose: () => void
  onSuccess?: () => void
  editingId?: string
  initialName?: string
  initialPrice?: string
  initialDate?: string
  initialColor?: string
  initialCategoryId?: string | null
  initialRemindDays?: number
}

export function AddSubscriptionForm({ onClose, onSuccess, editingId, initialName = '', initialPrice = '', initialDate = '', initialColor = '#a78bfa', initialCategoryId = null, initialRemindDays = 1 }: AddSubscriptionFormProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [date, setDate] = useState(initialDate || getDefaultDate())
  const [color, setColor] = useState(initialColor)
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId)
  const [remindDays, setRemindDays] = useState(String(initialRemindDays))
  const [presetCategory, setPresetCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [isSplit, setIsSplit] = useState(false)
  const [splitUsername, setSplitUsername] = useState('')
  const [splitAmount, setSplitAmount] = useState('')
  const [splitMode, setSplitMode] = useState<'rub' | 'pct'>('rub')
  const [userId, setUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation()
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createSplit] = useCreateSplitMutation()
  const isLoading = isCreating || isUpdating

  const nameToCategoryId = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.name] = cat.id
    return acc
  }, {})
  const activePresetCategory = presetCatalog.find((cat) => cat.name === presetCategory) || null
  const serviceOptions = (activePresetCategory?.services || []).map((service) => ({
    value: service.name,
    label: service.name,
    color: service.color,
  }))

  useEffect(() => {
    if (presetCategory || !initialCategoryId) return
    const dbCategory = categories.find((cat) => cat.id === initialCategoryId)
    if (dbCategory && presetCatalog.some((cat) => cat.name === dbCategory.name)) {
      setPresetCategory(dbCategory.name)
    }
  }, [categories, initialCategoryId, presetCategory])

  const handlePresetCategoryClick = (catName: string) => {
    if (presetCategory === catName) {
      setPresetCategory('')
      setCategoryId(null)
    } else {
      setPresetCategory(catName)
      setCategoryId(nameToCategoryId[catName] || null)
    }
    setSelectedService('')
  }

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName)
    const service = activePresetCategory?.services.find((s) => s.name === serviceName)
    if (!service) return
    setName(service.name)
    setColor(service.color)
    if (service.price) setPrice(String(service.price))
    clearError('name')
  }

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
          category_id: categoryId,
          remind_before_days: Number(remindDays),
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
          category_id: categoryId,
          user_id: userId,
          remind_before_days: Number(remindDays),
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
      <div className="add-form__row">
        <span className="add-form__label">Категория</span>
        <div className="add-form__presets">
          {presetCatalog.map((cat) => (
            <div
              key={cat.name}
              className={`add-form__preset ${presetCategory === cat.name ? 'add-form__preset--active' : ''}`}
              onClick={() => handlePresetCategoryClick(cat.name)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
      {serviceOptions.length > 0 && (
        <div className="add-form__row">
          <span className="add-form__label">Сервис</span>
          <Select options={serviceOptions} value={selectedService} onChange={handleServiceSelect} placeholder="Выбери сервис" />
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
        <span className="add-form__label">Напоминание в Telegram</span>
        <Select options={remindOptions} value={remindDays} onChange={setRemindDays} placeholder="Когда напомнить" />
      </div>
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
