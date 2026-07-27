import { useState } from 'react'
import { useGetSubscriptionsQuery } from '@/entities/subscription/api/subscriptionApi'
import { mapSubscription } from '@/entities/subscription/lib/mapSubscription'
import { useRemoveSubscription } from '@/features/subscription/delete'
import { useToast } from '@/shared/lib/useToast'
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
  const { toast, showToast } = useToast()
  const { removingIds, removeSubscription } = useRemoveSubscription({
    onDeleted: () => showToast('delete'),
  })

  const { data: dbSubscriptions = [], isLoading } = useGetSubscriptionsQuery()
  const subscriptions = dbSubscriptions.map(mapSubscription)

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

  const selected = subscriptions.find((s) => s.id === selectedSub)

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
      <HeroCard mode={mode} onModeChange={setMode} />
      <CategoriesCard />
      <UpcomingRail subscriptions={subscriptions} />
      <SubscriptionsGrid
        subscriptions={subscriptions}
        removingIds={removingIds}
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
        />
      )}

      {sheetOpen && (
        <AddSubscriptionSheet onClose={() => setSheetOpen(false)} onSuccess={() => showToast('success')} />
      )}

      {toast && <Toast type={toast} />}
    </div>
  )
}
