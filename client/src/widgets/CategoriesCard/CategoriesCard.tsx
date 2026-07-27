import type { CSSProperties } from 'react'
import { categories } from '@/mocks/subscriptions'
import './CategoriesCard.scss'

export function CategoriesCard() {
  return (
    <div className="categories-card rise" style={{ animationDelay: '0.12s' }}>
      <div className="categories-card__label">
        <i></i>По категориям
      </div>
      <div className="categories-card__donut-wrap" style={{ marginTop: '16px' }}>
        <div className="categories-card__donut">
          <svg width="196" height="196" viewBox="0 0 148 148">
            <defs>
              <linearGradient id="dg0" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b49ffb" />
                <stop offset="1" stopColor="#8f76f2" />
              </linearGradient>
              <linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8c6df6" />
                <stop offset="1" stopColor="#6947e6" />
              </linearGradient>
              <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6d5cc2" />
                <stop offset="1" stopColor="#493e8c" />
              </linearGradient>
              <linearGradient id="dg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4c448a" />
                <stop offset="1" stopColor="#332d5e" />
              </linearGradient>
              <linearGradient id="dg4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#352e5c" />
                <stop offset="1" stopColor="#221e3f" />
              </linearGradient>
            </defs>
            <circle cx="74" cy="74" r="66.5" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1.6" strokeDasharray="1.5 8.36" />
            <g>
              <circle cx="74" cy="74" r="54" fill="none" stroke="#1c1c28" strokeWidth="17" />
              <circle className="categories-card__seg" data-i="0" style={{ '--gc': '#a78bfa' } as CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg0)" strokeWidth="17" strokeDasharray="163 400" strokeDashoffset="0" />
              <circle className="categories-card__seg" data-i="1" style={{ '--gc': '#7c5cf0' } as CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg1)" strokeWidth="17" strokeDasharray="105.7 400" strokeDashoffset="-164.6" />
              <circle className="categories-card__seg" data-i="2" style={{ '--gc': '#5a4ea6' } as CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg2)" strokeWidth="17" strokeDasharray="31.4 400" strokeDashoffset="-271.8" />
              <circle className="categories-card__seg" data-i="3" style={{ '--gc': '#3f3870' } as CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg3)" strokeWidth="17" strokeDasharray="20.9 400" strokeDashoffset="-304.7" />
              <circle className="categories-card__seg" data-i="4" style={{ '--gc': '#28254a' } as CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg4)" strokeWidth="17" strokeDasharray="10.7 400" strokeDashoffset="-327.1" />
            </g>
          </svg>
          <div className="categories-card__donut-center">
            <span className="categories-card__donut-percent"></span>
            <b>{categories.reduce((a, c) => a + c.amount, 0).toLocaleString('ru-RU')} ₽</b>
            <span className="categories-card__donut-label">в месяц</span>
          </div>
          <div className="categories-card__mark"></div>
        </div>
        <div className="categories-card__list">
          {categories.map((cat) => (
            <div className="categories-card__row" key={cat.name}>
              <span className="categories-card__row-dot" style={{ background: `var(--cat-${cat.name})` }}></span>
              <span className="categories-card__row-name">{cat.name}</span>
              <span className="categories-card__row-percent">{cat.percent}</span>
              <b>{cat.amount.toLocaleString('ru-RU')} ₽</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
