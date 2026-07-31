import { useState } from 'react'
import { useGetSubscriptionsQuery, useGetCategoriesQuery } from '@/entities/subscription/api/subscriptionApi'
import { useGetSplitsQuery } from '@/entities/split/api/splitApi'
import { mapSubscription } from '@/entities/subscription/lib/mapSubscription'
import { useRemoveSubscription } from '@/features/subscription/delete'
import { useToast } from '@/shared/lib/useToast'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'
import { Toast } from '@/shared/ui/Toast'
import { DashboardHeader } from '@/widgets/DashboardHeader'
import { HeroCard } from '@/widgets/HeroCard'
import { CategoriesCard } from '@/widgets/CategoriesCard'
import { UpcomingRail } from '@/widgets/UpcomingRail'
import { SubscriptionsGrid } from '@/widgets/SubscriptionsGrid'
import { DashboardTabBar } from '@/widgets/DashboardTabBar'
import { SubscriptionDetail } from '@/widgets/SubscriptionDetail'
import { AddSubscriptionSheet } from '@/widgets/AddSubscriptionSheet'
import './DashboardPage.scss'

export function DashboardPage() {
  const [mode, setMode] = useState<'month' | 'year'>('month')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast, showToast } = useToast()
  const { removingIds, removeSubscription } = useRemoveSubscription({
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
  const splitCounts = splits.reduce<Record<string, number>>((acc, split) => {
    acc[split.subscription_id] = (acc[split.subscription_id] || 0) + 1
    return acc
  }, {})

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
      }
    : null

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__glow"></div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__glow"></div>

      <DashboardHeader />
      <HeroCard mode={mode} onModeChange={setMode} subscriptions={dbSubscriptions} />
      <CategoriesCard subscriptions={dbSubscriptions} categoryNames={categoryNames} />
      <UpcomingRail subscriptions={subscriptions} />
      <SubscriptionsGrid
        subscriptions={subscriptions}
        removingIds={removingIds}
        splitCounts={splitCounts}
        onOpen={openDetail}
        onAdd={() => setSheetOpen(true)}
      />
      <DashboardTabBar onAdd={() => setSheetOpen(true)} />

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
