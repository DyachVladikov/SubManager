import { brandIcons } from '../../model/brandIcons'
import './SubscriptionLogo.scss'

interface SubscriptionLogoProps {
  name: string
  color: string
  dark?: boolean
  className?: string
  iconClassName?: string
}

export default function SubscriptionLogo({ name, color, dark, className, iconClassName }: SubscriptionLogoProps) {
  const path = brandIcons[name]
  return (
    <div className={className} style={{ background: color, color: dark ? '#1a1a1a' : '#fff' }}>
      {path ? (
        <svg className={`subscription-logo__icon${iconClassName ? ` ${iconClassName}` : ''}`} viewBox="0 0 24 24">
          <path d={path} />
        </svg>
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  )
}
