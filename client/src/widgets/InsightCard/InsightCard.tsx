import { useMemo, useState } from 'react'
import type { Subscription } from '@/entities/subscription/model/types'
import { computeCategoryStats } from '@/entities/subscription/lib/subscriptionStats'
import { periodToMonths } from '@/entities/subscription/lib/period'
import { useMoney } from '@/shared/lib/useCurrency'
import './InsightCard.scss'

interface InsightCardProps {
  subscriptions: Subscription[]
  categoryNames: Record<string, string>
  monthTotal: number
}

interface Insight {
  title: string
  text: string
}

const plural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function InsightCard({ subscriptions, categoryNames, monthTotal }: InsightCardProps) {
  const stats = useMemo(() => computeCategoryStats(subscriptions, categoryNames), [subscriptions, categoryNames])
  const { symbol: currency, convert } = useMoney()
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 1000))

  const insights = useMemo(() => {
    const list: Insight[] = []
    const fmt = (n: number) => convert(Math.round(n)).toLocaleString('ru-RU', { useGrouping: false })
    const top = stats[0]
    const sorted = [...subscriptions].sort((a, b) => b.amount - a.amount)
    const expensive = sorted[0] ?? null
    const cheapest = sorted[sorted.length - 1] ?? null

    if (top && monthTotal > 0) {
      list.push({
        title: `${top.name} съедают ${top.percent}% бюджета`,
        text: `${fmt(top.amount)} ${currency} из ${fmt(monthTotal)} ${currency}. Оправдано, если пользуешься каждый день. Пользуешься?`,
      })
    }
    if (expensive) {
      list.push({
        title: `${expensive.title} — самая дорогая подписка`,
        text: `${fmt(expensive.amount)} ${currency}/мес, то есть ${fmt(expensive.amount * 12)} ${currency} в год. Точно отрабатывает свою цену?`,
      })
    }
    if (subscriptions.length >= 4) {
      list.push({
        title: `У тебя ${subscriptions.length} активных подписок`,
        text: `Вместе это ${fmt(monthTotal)} ${currency}/мес — ${fmt(monthTotal * 12)} ${currency} в год. Может, какая-то уже не нужна?`,
      })
    }
    if (cheapest && expensive && cheapest.id !== expensive.id) {
      list.push({
        title: `${cheapest.title} — самая лёгкая подписка`,
        text: `${fmt(cheapest.amount)} ${currency}/мес. Такие незаметны, именно поэтому их забывают отменить.`,
      })
    }
    if (subscriptions.length >= 2 && monthTotal > 0) {
      list.push({
        title: `В среднем ${fmt(monthTotal / subscriptions.length)} ${currency} за сервис`,
        text: 'Удобная планка: если новый сервис стоит заметно дороже — есть повод подумать.',
      })
    }
    if (monthTotal > 0) {
      list.push({
        title: `Каждый день подписки стоят ${fmt(monthTotal / 30)} ${currency}`,
        text: 'В пересчёте на день сумма выглядит иначе — хороший ориентир для новых покупок.',
      })
    }
    if (monthTotal >= 350) {
      list.push({
        title: `Это примерно ${Math.round(monthTotal / 350)} чашек кофе`,
        text: `Если считать капучино по 350 ${currency}. Твой месячный бюджет на подписки в кофейных единицах.`,
      })
    }
    const newest = [...subscriptions].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    if (newest && subscriptions.length >= 2) {
      list.push({
        title: `Свежая подписка — ${newest.title}`,
        text: `${fmt(newest.amount)} ${currency}/мес. Дай ей пару циклов: если не заходит — смело отменяй.`,
      })
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const withDiff = subscriptions.map((sub) => ({
      sub,
      diff: Math.round((new Date(`${sub.next_payment_date}T00:00:00`).getTime() - now.getTime()) / 86400000),
    }))
    const nearest = withDiff.filter((x) => x.diff >= 0).sort((a, b) => a.diff - b.diff)[0]
    if (nearest) {
      list.push({
        title: `Ближайшее списание — ${nearest.sub.title}`,
        text:
          nearest.diff === 0
            ? `Сегодня спишется ${fmt(nearest.sub.amount)} ${currency}. Проверь, что на карте хватает.`
            : `Через ${nearest.diff} ${plural(nearest.diff, 'день', 'дня', 'дней')} спишется ${fmt(nearest.sub.amount)} ${currency}.`,
      })
    }
    if (expensive && monthTotal > 0 && expensive.amount / monthTotal > 0.45) {
      list.push({
        title: `${expensive.title} тянет почти половину бюджета`,
        text: `${Math.round((expensive.amount / monthTotal) * 100)}% всех трат — один сервис. Если им не пользуешься ежедневно, это первый кандидат на выход.`,
      })
    }
    if (stats.length >= 3) {
      list.push({
        title: `Траты размазаны по ${stats.length} категориям`,
        text: `Лидер — ${stats[0].name} (${stats[0].percent}%). Неплохой разброс, но пересматривай хвост списка.`,
      })
    }
    const yearly = subscriptions.find((sub) => periodToMonths(sub.period) === 12)
    if (yearly) {
      list.push({
        title: `${yearly.title} спишется раз в год`,
        text: `${fmt(yearly.amount)} ${currency} за цикл. Годовые подписки легко забыть — напомним заранее.`,
      })
    }
    const overdue = withDiff.filter((x) => x.diff < 0)
    if (overdue.length > 0) {
      list.push({
        title: `${overdue.length} ${plural(overdue.length, 'подписка ждёт', 'подписки ждут', 'подписок ждут')} оплаты`,
        text: 'Открой карточку подписки и нажми «Оплатить» — дата следующего списания пересчитается автоматически.',
      })
    }
    return list
  }, [stats, subscriptions, monthTotal, currency, convert])

  if (insights.length === 0) return null

  const current = index % insights.length
  const insight = insights[current]

  return (
    <div
      className="insight-card rise"
      style={{ animationDelay: '0.3s' }}
      onClick={() => setIndex((value) => (value + 1) % insights.length)}
      title={insights.length > 1 ? 'Нажми, чтобы увидеть ещё' : undefined}
    >
      <div className="insight-card__label">
        <i></i>Инсайт
        {insights.length > 1 && (
          <span className="insight-card__dots">
            {insights.map((_, dotIndex) => (
              <b
                key={dotIndex}
                className={`insight-card__dot${dotIndex === current ? ' insight-card__dot--on' : ''}`}
              ></b>
            ))}
          </span>
        )}
      </div>
      <div className="insight-card__title swap" key={`title-${current}`}>
        {insight.title}
      </div>
      <div className="insight-card__text swap" key={`text-${current}`}>
        {insight.text}
      </div>
    </div>
  )
}
