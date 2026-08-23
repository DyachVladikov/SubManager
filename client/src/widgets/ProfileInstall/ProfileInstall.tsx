import { useState } from 'react'
import { LuDownload, LuShare } from 'react-icons/lu'
import { useInstallPrompt } from '@/shared/lib/useInstallPrompt'
import './ProfileInstall.scss'

export function ProfileInstall() {
  const { canInstall, promptInstall, isIos, isStandalone } = useInstallPrompt()
  const [helpOpen, setHelpOpen] = useState(false)

  if (isStandalone) return null
  if (!canInstall && !isIos) return null

  const handleClick = () => {
    if (canInstall) {
      void promptInstall()
    } else {
      setHelpOpen((value) => !value)
    }
  }

  return (
    <div className="profile-install rise" style={{ animationDelay: '0.2s' }}>
      <div className="profile-install__row" onClick={handleClick}>
        <div className="profile-install__name">
          <div className="profile-install__icon">
            <LuDownload size={16} />
          </div>
          <div className="profile-install__text">
            Установить приложение
            <small>работает и без интернета</small>
          </div>
        </div>
        <span className="profile-install__btn">Установить</span>
      </div>
      {helpOpen && (
        <div className="profile-install__help">
          <LuShare size={14} />
          <span>
            В Safari нажми «Поделиться» <b>→</b> «На экран «Домой»»
          </span>
        </div>
      )}
    </div>
  )
}
