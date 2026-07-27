import { heroData, monthNames, yearNames } from '@/mocks/subscriptions'
import './HeroCard.scss'

interface HeroCardProps {
  mode: 'month' | 'year'
  onModeChange: (mode: 'month' | 'year') => void
}

export function HeroCard({ mode, onModeChange }: HeroCardProps) {
  const data = heroData[mode]
  const chartNames = mode === 'month' ? monthNames : yearNames

  return (
    <div className="hero-card rise" style={{ animationDelay: '0.06s' }}>
      <div className="hero-card__topline">
        <div className="hero-card__label">
          <i></i>
          <span>{data.label}</span>
        </div>
        <div className={`hero-card__segctl ${mode === 'year' ? 'hero-card__segctl--year' : ''}`}>
          <span className="hero-card__segctl-pill"></span>
          <button
            className={`hero-card__segctl-button ${mode === 'month' ? 'hero-card__segctl-button--active' : ''}`}
            onClick={() => onModeChange('month')}
          >
            Месяц
          </button>
          <button
            className={`hero-card__segctl-button ${mode === 'year' ? 'hero-card__segctl-button--active' : ''}`}
            onClick={() => onModeChange('year')}
          >
            Год
          </button>
        </div>
      </div>
      <div className="hero-card__sum">
        <div className="hero-card__num">{data.value.toLocaleString('ru-RU')}</div>
        <div className="hero-card__per">₽</div>
      </div>
      <div className="hero-card__row">
        <span className="hero-card__chip">
          <svg width="11" height="11" viewBox="0 0 24 24">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
          <span>{data.delta}</span>
        </span>
        <span className="hero-card__servs">{data.services}</span>
      </div>
      <div className="hero-card__chart">
        <svg width="100%" height="64" viewBox="0 0 350 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a78bfa" stopOpacity=".3" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,.05)" strokeDasharray="3 5" />
          <line x1="0" y1="44" x2="350" y2="44" stroke="rgba(255,255,255,.05)" strokeDasharray="3 5" />
          <path id="harea" fill="url(#sg)" />
          <path id="hfc" fill="none" stroke="#7c5cf0" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" opacity=".55" />
          <path id="hline" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
          <line id="hx" y1="4" y2="64" stroke="rgba(255,255,255,.25)" strokeDasharray="2 4" />
          <circle id="hendO" r="7" fill="#a78bfa" opacity=".18" />
          <circle id="hend" r="3" fill="#a78bfa" />
          <circle id="hdot" r="4" fill="#a78bfa" />
        </svg>
        <div className="hero-card__tip"></div>
        <div className="hero-card__range">
          <span>{chartNames[0]}</span>
          <span>{chartNames[chartNames.length - 1]}</span>
        </div>
      </div>
      <div className="hero-card__progress">
        <div className="hero-card__progress-row">
          <span>
            <i className="hero-card__dot hero-card__dot--paid"></i>
            <span>{data.paid}</span> · <b>{data.paidValue}</b>
          </span>
          <span>
            <i className="hero-card__dot hero-card__dot--remaining"></i>
            <span>{data.remaining}</span> · <b>{data.remainingValue}</b>
          </span>
        </div>
        <div className="hero-card__progress-bar">
          <i style={{ width: `${data.progress}%` }}></i>
        </div>
      </div>
    </div>
  )
}
