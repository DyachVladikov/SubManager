import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { baseApi } from '@/shared/api/baseApi'
import { useGetSubscriptionsQuery, useGetCategoriesQuery } from '@/entities/subscription/api/subscriptionApi'
import { downloadCsv } from '@/shared/lib/exportCsv'
import './ProfileData.scss'

interface ProfileDataProps {
  onNotify: () => void
}

export function ProfileData({ onNotify }: ProfileDataProps) {
  const dispatch = useDispatch()
  const { data: subscriptions = [] } = useGetSubscriptionsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const cacheSize = useMemo(() => {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) total += key.length + (localStorage.getItem(key)?.length ?? 0)
    }
    return total < 1024 ? `${total} Б` : `${(total / 1024).toFixed(1).replace('.', ',')} КБ`
  }, [])

  const handleExport = () => {
    const categoryById = categories.reduce<Record<string, string>>((acc, cat) => {
      acc[cat.id] = cat.name
      return acc
    }, {})
    downloadCsv(
      'submanager.csv',
      subscriptions.map((sub) => ({
        'Название': sub.title,
        'Сумма': sub.amount,
        'Валюта': sub.currency,
        'Категория': (sub.category_id && categoryById[sub.category_id]) || 'Другое',
        'Следующее списание': sub.next_payment_date,
        'Создана': sub.created_at.slice(0, 10),
      })),
    )
    onNotify()
  }

  const handleClearCache = () => {
    dispatch(baseApi.util.resetApiState())
    onNotify()
  }

  return (
    <div className="profile-data rise" style={{ animationDelay: '0.26s' }}>
      <div className="profile-data__label">
        <i></i>Данные
      </div>
      <div className="profile-data__row" onClick={handleExport}>
        <div className="profile-data__name">
          <div className="profile-data__icon">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          </div>
          Экспорт в CSV
        </div>
        <span className="profile-data__chev">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>
      <div className="profile-data__row" onClick={handleClearCache}>
        <div className="profile-data__name">
          <div className="profile-data__icon">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          Очистить кэш
        </div>
        <span className="profile-data__chev">
          <small>{cacheSize}</small>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>
  )
}
