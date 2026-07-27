import { LuHouse, LuChartColumn, LuPlus, LuUsers, LuUser } from 'react-icons/lu'
import './DashboardTabBar.scss'

interface DashboardTabBarProps {
  onAdd: () => void
}

export function DashboardTabBar({ onAdd }: DashboardTabBarProps) {
  return (
    <div className="dashboard-tab-bar rise" style={{ animationDelay: '0.36s' }}>
      <div className="dashboard-tab-bar__tab dashboard-tab-bar__tab--active">
        <LuHouse size={20} />
        Главная
        <span className="dashboard-tab-bar__pip"></span>
      </div>
      <div className="dashboard-tab-bar__tab">
        <LuChartColumn size={20} />
        Аналитика
      </div>
      <div className="dashboard-tab-bar__fab" onClick={onAdd}>
        <LuPlus size={24} />
      </div>
      <div className="dashboard-tab-bar__tab">
        <LuUsers size={20} />
        Друзья
      </div>
      <div className="dashboard-tab-bar__tab">
        <LuUser size={20} />
        Профиль
      </div>
    </div>
  )
}
