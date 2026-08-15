import { TabBar, type TabKey } from '@/widgets/TabBar'
import './ComingSoon.scss'

interface ComingSoonProps {
  active: TabKey
  onNavigate: (tab: TabKey) => void
}

export function ComingSoon({ active, onNavigate }: ComingSoonProps) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__glow"></div>
      <p className="coming-soon__text">Скоро</p>
      <TabBar active={active} onNavigate={onNavigate} onAdd={() => onNavigate('home')} />
    </div>
  )
}
