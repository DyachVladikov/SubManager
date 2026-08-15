import { useMemo, useState } from 'react'
import { useGetSubscriptionsQuery, useGetCategoriesQuery } from '@/entities/subscription/api/subscriptionApi'
import { useGetSplitsQuery } from '@/entities/split/api/splitApi'
import { computeAnalyticsStats } from '@/entities/subscription/lib/analyticsStats'
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
import { AddSubscriptionSheet } from '@/widgets/AddSubscriptionSheet'
import './AnalyticsPage.scss'

interface AnalyticsPageProps {
  onNavigate: (tab: TabKey) => void
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast, showToast } = useToast()

  const { data: subscriptions = [], isLoading } = useGetSubscriptionsQuery()
  const { data: splits = [] } = useGetSplitsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const categoryNames = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {})

  const stats = useMemo(() => computeAnalyticsStats(subscriptions, splits), [subscriptions, splits])
  useBodyScrollLock(sheetOpen)

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

      <DashboardHeader />
      <div className="analytics-page__title rise" style={{ animationDelay: '0.05s' }}>
        Аналитика
      </div>

      <div className="analytics-page__content">
        <AnalyticsChart months={stats.monthlyTotals} />
        <AnalyticsStats stats={stats} />
        <AnalyticsCategories subscriptions={subscriptions} categoryNames={categoryNames} />
        <AnalyticsTop subscriptions={subscriptions} categoryNames={categoryNames} monthTotal={stats.monthTotal} />
        <InsightCard subscriptions={subscriptions} categoryNames={categoryNames} monthTotal={stats.monthTotal} />
      </div>

      <TabBar active="analytics" onNavigate={onNavigate} onAdd={() => setSheetOpen(true)} />

      {sheetOpen && <AddSubscriptionSheet onClose={() => setSheetOpen(false)} onSuccess={() => showToast('success')} />}

      {toast && <Toast type={toast} />}
    </div>
  )
}
