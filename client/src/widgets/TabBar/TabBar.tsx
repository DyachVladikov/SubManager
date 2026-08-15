import { LuHouse, LuChartColumn, LuPlus, LuUsers, LuUser } from 'react-icons/lu'
import './TabBar.scss'

export type TabKey = 'home' | 'analytics' | 'friends' | 'profile'

interface TabBarProps {
  active: TabKey
  onNavigate: (tab: TabKey) => void
  onAdd: () => void
}

const leftTabs: { key: TabKey; label: string; icon: typeof LuHouse }[] = [
  { key: 'home', label: 'Главная', icon: LuHouse },
  { key: 'analytics', label: 'Аналитика', icon: LuChartColumn },
]

const rightTabs: { key: TabKey; label: string; icon: typeof LuHouse }[] = [
  { key: 'friends', label: 'Друзья', icon: LuUsers },
  { key: 'profile', label: 'Профиль', icon: LuUser },
]

export function TabBar({ active, onNavigate, onAdd }: TabBarProps) {
  const renderTab = ({ key, label, icon: Icon }: (typeof leftTabs)[number]) => (
    <div
      key={key}
      className={`tabbar__tab${active === key ? ' tabbar__tab--active' : ''}`}
      onClick={() => onNavigate(key)}
    >
      <Icon size={20} />
      {label}
      {active === key && <span className="tabbar__pip"></span>}
    </div>
  )

  return (
    <div className="tabbar rise" style={{ animationDelay: '0.36s' }}>
      {leftTabs.map(renderTab)}
      <div className="tabbar__fab" onClick={onAdd}>
        <LuPlus size={24} />
      </div>
      {rightTabs.map(renderTab)}
    </div>
  )
}
