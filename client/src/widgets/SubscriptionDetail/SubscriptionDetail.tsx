import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import type { Subscription } from '@/mocks/subscriptions'
import { useGetSplitsBySubscriptionQuery } from '@/entities/split/api/splitApi'
import { useMoney } from '@/shared/lib/useCurrency'
import './SubscriptionDetail.scss'

interface SubscriptionDetailProps {
  subscription: Subscription
  open: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function SubscriptionDetail({ subscription, open, onClose, onDelete, onEdit }: SubscriptionDetailProps) {
  const { symbol: currency, convert } = useMoney()
  const { data: splits = [] } = useGetSplitsBySubscriptionQuery(subscription.id)
  const remindDays = subscription.remindBeforeDays ?? 1
  const remindText =
    remindDays === 0
      ? 'в день списания, в Telegram'
      : remindDays === 1
        ? 'за день до списания, в Telegram'
        : `за ${remindDays} ${remindDays < 5 ? 'дня' : 'дней'} до списания, в Telegram`

  const [shown, setShown] = useState(false)

  useEffect(() => {
    let cancelled = false
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setShown(true)
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const closeWithAnimation = useCallback(
    (after?: () => void) => {
      setShown(false)
      window.setTimeout(() => (after ? after() : onClose()), 300)
    },
    [onClose],
  )

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWithAnimation()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeWithAnimation])

  return (
    <>
      <div
        className={`subscription-detail__backdrop ${open && shown ? 'subscription-detail__backdrop--open' : ''}`}
        onClick={() => closeWithAnimation()}
      ></div>
      <div className={`subscription-detail ${open && shown ? 'subscription-detail--open' : ''}`}>
      <div className="subscription-detail__glow" style={{ '--bc': subscription.color } as CSSProperties}></div>
      <div className="subscription-detail__head">
        <div className="subscription-detail__head-btn" onClick={() => closeWithAnimation()}>
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </div>
        <span className="subscription-detail__head-label">Подписка</span>
        <div className="subscription-detail__head-btn" onClick={() => closeWithAnimation(() => onEdit(subscription.id))}>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </div>
      </div>
      <div
        className="subscription-detail__logo"
        style={{ background: subscription.color, color: subscription.dark ? '#1a1a1a' : '#fff' }}
      >
        {subscription.letter}
      </div>
      <div className="subscription-detail__name">{subscription.name}</div>
      <div className="subscription-detail__price">{convert(subscription.price).toLocaleString('ru-RU', { useGrouping: false })} {currency} / мес</div>
      <div className="subscription-detail__chips">
        <span className="subscription-detail__chip subscription-detail__chip--ok">
          <i></i>активна
        </span>
        <span className="subscription-detail__chip">
          <i></i>
          {subscription.nextDate} · {subscription.daysLeft}
        </span>
      </div>
      <div className="subscription-detail__grid">
        <div className="subscription-detail__stat">
          <div className="subscription-detail__stat-label">В год</div>
          <div className="subscription-detail__stat-value">
            <span>{convert(subscription.price * 12).toLocaleString('ru-RU', { useGrouping: false })}</span> {currency}
          </div>
        </div>
        <div className="subscription-detail__stat">
          <div className="subscription-detail__stat-label">Категория</div>
          <div className="subscription-detail__stat-value" style={{ fontSize: '19px', paddingTop: '2px' }}>
            {subscription.category}
          </div>
        </div>
      </div>
      <div className="subscription-detail__card">
        {splits.length > 0 ? (
          <>
            <div className="subscription-detail__split-head">
              <div className="subscription-detail__label">
                <i></i>Split
              </div>
              <span className="subscription-detail__split-count">{splits.length} чел</span>
            </div>
            {splits.map((p) => (
              <div className="subscription-detail__row" key={p.id}>
                <div className="subscription-detail__avatar" style={{ background: `linear-gradient(135deg,#8c6df6,#6947e6)` }}>
                  {p.debtor_username.replace(/^@/, '')[0].toUpperCase()}
                </div>
                <div className="subscription-detail__person">
                  {p.debtor_username.replace(/^@/, '')}
                  <small>@{p.debtor_username.replace(/^@/, '')}</small>
                </div>
                <div className="subscription-detail__amount">
                  {convert(p.amount).toLocaleString('ru-RU', { useGrouping: false })} {currency}<br />
                  <span className={`subscription-detail__status ${p.status === 'paid' ? 'subscription-detail__status--paid' : 'subscription-detail__status--pending'}`}>
                    {p.status === 'paid' ? 'оплатил' : 'ждём'}
                  </span>
                </div>
              </div>
            ))}
            <div className="subscription-detail__split-footer">
              <span className="subscription-detail__split-label">Твоя доля</span>
              <b>{convert(subscription.price - splits.reduce((a, p) => a + p.amount, 0)).toLocaleString('ru-RU', { useGrouping: false })} {currency}/мес</b>
            </div>
          </>
        ) : (
          <>
            <div className="subscription-detail__cta-icon">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="subscription-detail__cta-title">Разделить оплату</div>
            <div className="subscription-detail__cta-text">
              Добавь друзей по @username — каждый платит свою долю, бот сам напомнит о переводе за день до списания.
            </div>
            <button className="subscription-detail__cta-btn" onClick={() => closeWithAnimation(() => onEdit(subscription.id))}>
              Настроить split
            </button>
            <div className="subscription-detail__cta-lock">
              <svg width="11" height="11" viewBox="0 0 24 24">
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              нужна привязка Telegram
            </div>
          </>
        )}
      </div>
      <div className="subscription-detail__card">
        <div className="subscription-detail__label">
          <i></i>История платежей
        </div>
        <div style={{ marginTop: '6px' }}>
          {subscription.history.map((h) => (
            <div className="subscription-detail__history-row" key={h}>
              <span className="subscription-detail__history-date">{h}</span>
              <b>
                <svg width="11" height="11" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {convert(subscription.price).toLocaleString('ru-RU', { useGrouping: false })} {currency}
              </b>
            </div>
          ))}
        </div>
      </div>
      <div className="subscription-detail__card">
        <div className="subscription-detail__setting">
          <div>
            Напоминание о списании<small>{remindText}</small>
          </div>
          <div className="subscription-detail__head-btn" onClick={() => closeWithAnimation(() => onEdit(subscription.id))}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="subscription-detail__actions">
        <button className="subscription-detail__edit-btn" onClick={() => closeWithAnimation(() => onEdit(subscription.id))}>
          Редактировать
        </button>
        <button className="subscription-detail__remove-btn" onClick={() => closeWithAnimation(() => onDelete(subscription.id))}>
          Удалить
        </button>
      </div>
      </div>
    </>
  )
}
