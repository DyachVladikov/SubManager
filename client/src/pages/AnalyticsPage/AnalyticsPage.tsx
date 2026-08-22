import { useMemo, useState } from 'react'
import { useGetSubscriptionsQuery, useGetCategoriesQuery } from '@/entities/subscription/api/subscriptionApi'
import { useGetSplitsQuery } from '@/entities/split/api/splitApi'
import { computeAnalyticsStats } from '@/entities/subscription/lib/analyticsStats'
import { mapSubscription } from '@/entities/subscription/lib/mapSubscription'
import { useRemoveSubscription } from '@/features/subscription/delete'
import { useToast } from '@/shared/lib/useToast'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'
import { Toast } from '@/shared/ui/Toast'
import { DashboardHeader } from '@/widgets/DashboardHeader'
import { TabBar, type TabKey } from '@/widgets/TabBar'
import { AnalyticsChart } from '@/widgets/AnalyticsChart'
import { AnalyticsStats } from '@/widgets/AnalyticsStats'
import { AnalyticsCategories } from '@/widgets/AnalyticsCategories'
import { AnalyticsTop } from '@/widgets/AnalyticsTop'
import { InsightCard } from '@/widgets/InsightCard'
import { SubscriptionDetail } from '@/widgets/SubscriptionDetail'
import { AddSubscriptionSheet } from '@/widgets/AddSubscriptionSheet'
import './AnalyticsPage.scss'

interface AnalyticsPageProps {
  onNavigate: (tab: TabKey) => void
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast, showToast } = useToast()
  const { removeSubscription } = useRemoveSubscription({
    onDeleted: () => showToast('delete'),
  })

  const { data: dbSubscriptions = [], isLoading } = useGetSubscriptionsQuery()
  const { data: splits = [] } = useGetSplitsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const categoryNames = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {})
  const subscriptions = dbSubscriptions.map((sub) => mapSubscription(sub, sub.category_id ? categoryNames[sub.category_id] : undefined))

  const stats = useMemo(() => computeAnalyticsStats(dbSubscriptions, splits), [dbSubscriptions, splits])

  const openDetail = (id: string) => {
    setSelectedSub(id)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedSub(null)
  }

  const handleDelete = (id: string) => {
    closeDetail()
    removeSubscription(id)
  }

  const handleEdit = (id: string) => {
    closeDetail()
    setEditingId(id)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setEditingId(null)
  }

  const selected = subscriptions.find((s) => s.id === selectedSub)
  useBodyScrollLock(sheetOpen || selectedSub !== null)
  const editingRaw = dbSubscriptions.find((s) => s.id === editingId)
  const editing = editingRaw
    ? {
        id: editingRaw.id,
        name: editingRaw.title,
        price: String(editingRaw.amount),
        date: editingRaw.next_payment_date,
        color: editingRaw.color_hex || '#a78bfa',
        categoryId: editingRaw.category_id,
        remindDays: editingRaw.remind_before_days,
        period: editingRaw.period,
      }
    : null

  if (isLoading) {
    return (
      <div className="analytics-page">
        <div className="analytics-page__glow"></div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="analytics-page__glow"></div>

      <DashboardHeader onBrandClick={() => onNavigate('profile')} />
      <div className="analytics-page__title rise" style={{ animationDelay: '0.05s' }}>
        Аналитика
      </div>

      <div className="analytics-page__content">
        <AnalyticsChart months={stats.monthlyTotals} />
        <AnalyticsStats stats={stats} />
        <AnalyticsCategories subscriptions={dbSubscriptions} categoryNames={categoryNames} />
        <AnalyticsTop subscriptions={dbSubscriptions} categoryNames={categoryNames} monthTotal={stats.monthTotal} onOpen={openDetail} />
        <InsightCard subscriptions={dbSubscriptions} categoryNames={categoryNames} monthTotal={stats.monthTotal} />
      </div>

      <TabBar active="analytics" onNavigate={onNavigate} onAdd={() => setSheetOpen(true)} />

      {selected && (
        <SubscriptionDetail
          subscription={selected}
          open={detailOpen}
          onClose={closeDetail}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {sheetOpen && (
        <AddSubscriptionSheet onClose={closeSheet} onSuccess={() => showToast('success')} editing={editing} />
      )}

      {toast && <Toast type={toast} />}
    </div>
  )
}
