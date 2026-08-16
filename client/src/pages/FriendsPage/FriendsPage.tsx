import { useState } from 'react'
import { useGetSubscriptionsQuery } from '@/entities/subscription/api/subscriptionApi'
import { useGetSplitsQuery } from '@/entities/split/api/splitApi'
import { useToast } from '@/shared/lib/useToast'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'
import { Toast } from '@/shared/ui/Toast'
import { DashboardHeader } from '@/widgets/DashboardHeader'
import { TabBar, type TabKey } from '@/widgets/TabBar'
import { FriendsSummary } from '@/widgets/FriendsSummary'
import { FriendsPending } from '@/widgets/FriendsPending'
import { AddSubscriptionSheet } from '@/widgets/AddSubscriptionSheet'
import './FriendsPage.scss'

interface FriendsPageProps {
  onNavigate: (tab: TabKey) => void
}

export function FriendsPage({ onNavigate }: FriendsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast, showToast } = useToast()
  const { data: splits = [], isLoading } = useGetSplitsQuery()
  const { data: subscriptions = [] } = useGetSubscriptionsQuery()
  useBodyScrollLock(sheetOpen)

  const subscriptionById = subscriptions.reduce<Record<string, (typeof subscriptions)[number]>>((acc, sub) => {
    acc[sub.id] = sub
    return acc
  }, {})
  const pendingSplits = splits.filter((split) => split.status === 'pending')

  if (isLoading) {
    return (
      <div className="friends-page">
        <div className="friends-page__glow"></div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="friends-page">
      <div className="friends-page__glow"></div>

      <DashboardHeader />
      <div className="friends-page__title rise" style={{ animationDelay: '0.05s' }}>
        Друзья
      </div>

      <div className="friends-page__content">
        <FriendsSummary splits={splits} onRemindAll={() => showToast('success')} />
        <FriendsPending splits={pendingSplits} subscriptions={subscriptionById} onRemind={() => showToast('success')} />
      </div>

      <TabBar active="friends" onNavigate={onNavigate} onAdd={() => setSheetOpen(true)} />

      {sheetOpen && <AddSubscriptionSheet onClose={() => setSheetOpen(false)} onSuccess={() => showToast('success')} />}

      {toast && <Toast type={toast} />}
    </div>
  )
}
