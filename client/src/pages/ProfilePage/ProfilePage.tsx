import { useState } from 'react'
import { useAuth, useDeleteAccount } from '@/features/auth'
import { useToast } from '@/shared/lib/useToast'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'
import { Toast } from '@/shared/ui/Toast'
import { ConfirmModal } from '@/shared/ui/ConfirmModal'
import { DashboardHeader } from '@/widgets/DashboardHeader'
import { TabBar, type TabKey } from '@/widgets/TabBar'
import { ProfileAccount } from '@/widgets/ProfileAccount'
import { ProfileTelegram } from '@/widgets/ProfileTelegram'
import { ProfileSettings } from '@/widgets/ProfileSettings'
import { ProfileNotifications } from '@/widgets/ProfileNotifications'
import { ProfileData } from '@/widgets/ProfileData'
import { AddSubscriptionSheet } from '@/widgets/AddSubscriptionSheet'
import './ProfilePage.scss'

interface ProfilePageProps {
  onNavigate: (tab: TabKey) => void
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const { toast, showToast } = useToast()
  const { signOut } = useAuth()
  const { deleteAccount } = useDeleteAccount()
  useBodyScrollLock(sheetOpen || deleteConfirm || logoutConfirm)

  const handleDelete = async () => {
    try {
      await deleteAccount()
    } catch {
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-page__glow"></div>

      <DashboardHeader />
      <div className="profile-page__title rise" style={{ animationDelay: '0.05s' }}>
        Профиль
      </div>

      <div className="profile-page__content">
        <ProfileAccount />
        <div className="profile-page__column">
          <ProfileTelegram />
          <ProfileNotifications />
        </div>
        <div className="profile-page__column">
          <ProfileSettings />
          <ProfileData onNotify={() => showToast('success')} />
        </div>
        <button className="profile-page__logout rise" style={{ animationDelay: '0.3s' }} onClick={() => setLogoutConfirm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Выйти
        </button>
        <button className="profile-page__delete rise" style={{ animationDelay: '0.32s' }} onClick={() => setDeleteConfirm(true)}>
          Удалить аккаунт
        </button>
        <div className="profile-page__version rise" style={{ animationDelay: '0.34s' }}>
          SubManager · v0.1 · PWA
        </div>
      </div>

      <TabBar active="profile" onNavigate={onNavigate} onAdd={() => setSheetOpen(true)} />

      {sheetOpen && <AddSubscriptionSheet onClose={() => setSheetOpen(false)} onSuccess={() => showToast('success')} />}

      {deleteConfirm && (
        <ConfirmModal
          title="Удалить аккаунт?"
          text="Все подписки, сплиты и настройки будут удалены безвозвратно."
          confirmLabel="Удалить"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}

      {logoutConfirm && (
        <ConfirmModal
          title="Выйти из аккаунта?"
          text="Локальный кеш и очередь офлайн-операций на этом устройстве будут очищены."
          confirmLabel="Выйти"
          onConfirm={() => signOut()}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}

      {toast && <Toast type={toast} />}
    </div>
  )
}
