import { useState } from 'react'
import { subscriptions, categories, monthNames, yearNames, heroData } from '@/mocks/subscriptions'
import './DashboardPage.scss'

export function DashboardPage() {
  const [mode, setMode] = useState<'month' | 'year'>('month')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const data = heroData[mode]
  const chartNames = mode === 'month' ? monthNames : yearNames

  const openDetail = (id: string) => {
    setSelectedSub(id)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedSub(null)
  }

  const selected = subscriptions.find((s) => s.id === selectedSub)

  return (
    <div className="dashboard-page">
      <div className="glow"></div>

      <header className="rise" style={{ animationDelay: '0.02s' }}>
        <div className="brand">
          <div className="avatar">В</div>
          <div className="hi">
            <small>Добрый вечер</small>
            <b>Влад</b>
          </div>
        </div>
        <div className="iconbtn">
          <svg className="ic" width="19" height="19" viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="dot"></span>
        </div>
      </header>

      <div className="card hero rise" style={{ animationDelay: '0.06s' }}>
        <div className="topline">
          <div className="label">
            <i></i>
            <span>{data.label}</span>
          </div>
          <div className={`segctl ${mode === 'year' ? 'y' : ''}`}>
            <span className="pill"></span>
            <button className={mode === 'month' ? 'on' : ''} onClick={() => setMode('month')}>
              Месяц
            </button>
            <button className={mode === 'year' ? 'on' : ''} onClick={() => setMode('year')}>
              Год
            </button>
          </div>
        </div>
        <div className="sum">
          <div className="num">{data.value.toLocaleString('ru-RU')}</div>
          <div className="per">₽</div>
        </div>
        <div className="herorow">
          <span className="chip">
            <svg className="ic" width="11" height="11" viewBox="0 0 24 24">
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
            <span>{data.delta}</span>
          </span>
          <span className="servs">{data.services}</span>
        </div>
        <div className="hchart">
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
          <div className="xtip"></div>
          <div className="range">
            <span>{chartNames[0]}</span>
            <span>{chartNames[chartNames.length - 1]}</span>
          </div>
        </div>
        <div className="mprog">
          <div className="mprow">
            <span>
              <i className="dot dotA"></i>
              <span>{data.paid}</span> · <b>{data.paidValue}</b>
            </span>
            <span>
              <i className="dot dotB"></i>
              <span>{data.remaining}</span> · <b>{data.remainingValue}</b>
            </span>
          </div>
          <div className="mpbar">
            <i style={{ width: `${data.progress}%` }}></i>
          </div>
        </div>
      </div>

      <div className="card rise" style={{ animationDelay: '0.12s' }}>
        <div className="label">
          <i></i>По категориям
        </div>
        <div className="donutwrap" style={{ marginTop: '16px' }}>
          <div className="donut">
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
                <circle className="seg" data-i="0" style={{ '--gc': '#a78bfa' } as React.CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg0)" strokeWidth="17" strokeDasharray="163 400" strokeDashoffset="0" />
                <circle className="seg" data-i="1" style={{ '--gc': '#7c5cf0' } as React.CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg1)" strokeWidth="17" strokeDasharray="105.7 400" strokeDashoffset="-164.6" />
                <circle className="seg" data-i="2" style={{ '--gc': '#5a4ea6' } as React.CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg2)" strokeWidth="17" strokeDasharray="31.4 400" strokeDashoffset="-271.8" />
                <circle className="seg" data-i="3" style={{ '--gc': '#3f3870' } as React.CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg3)" strokeWidth="17" strokeDasharray="20.9 400" strokeDashoffset="-304.7" />
                <circle className="seg" data-i="4" style={{ '--gc': '#28254a' } as React.CSSProperties} cx="74" cy="74" r="54" fill="none" stroke="url(#dg4)" strokeWidth="17" strokeDasharray="10.7 400" strokeDashoffset="-327.1" />
              </g>
            </svg>
            <div className="c">
              <span className="cp"></span>
              <b>{categories.reduce((a, c) => a + c.amount, 0).toLocaleString('ru-RU')} ₽</b>
              <span className="cl">в месяц</span>
            </div>
            <div className="mark"></div>
          </div>
          <div className="lgrid">
            {categories.map((cat) => (
              <div className="lrow" key={cat.name}>
                <span className="d" style={{ background: `var(--cat-${cat.name})` }}></span>
                <span className="nm">{cat.name}</span>
                <span className="pc">{cat.percent}</span>
                <b>{cat.amount.toLocaleString('ru-RU')} ₽</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sec rise" style={{ animationDelay: '0.18s' }}>
        <h2>
          <i></i>Ближайшие списания
        </h2>
        <span className="more">
          все
          <svg className="ic" width="11" height="11" viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <div className="rail rise" style={{ animationDelay: '0.22s' }}>
        {subscriptions.slice(0, 5).map((sub) => (
          <div className={`tcard ${sub.daysLeft === 'завтра' ? 'hot' : ''}`} key={sub.id}>
            <div className="date">
              {sub.daysLeft === 'завтра' && <span className="badge">завтра</span>}
              <b>{sub.nextDate.split(' ')[0]}</b>
              <span>{sub.nextDate.split(' ')[1]}</span>
            </div>
            <div className="sep"></div>
            <div className="logo" style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}>
              {sub.letter}
            </div>
            <div>
              <div className="nm">{sub.name}</div>
              <div className="am">{sub.price.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sec rise" style={{ animationDelay: '0.26s' }}>
        <h2>
          <i></i>Мои подписки
        </h2>
        <span className="more">
          все
          <svg className="ic" width="11" height="11" viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <div className="grid rise" style={{ animationDelay: '0.3s' }}>
        {subscriptions.map((sub) => (
          <div className="sub" key={sub.id} onClick={() => openDetail(sub.id)}>
            <div className="top">
              <div className="logo" style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}>
                {sub.letter}
              </div>
              {sub.split && (
                <span className="split">
                  <svg className="ic" width="9" height="9" viewBox="0 0 24 24">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  {sub.split.length}
                </span>
              )}
            </div>
            <h3>{sub.name}</h3>
            <div className="pr">
              <b>{sub.price.toLocaleString('ru-RU')} ₽</b> <span>/ мес</span>
            </div>
            <div className="dl">
              <span>{sub.nextDate}</span>
              <span>{sub.daysLeft}</span>
            </div>
            <div className="bar">
              <i style={{ width: `${100 - parseInt(sub.daysLeft)}%` }}></i>
            </div>
          </div>
        ))}
        <div className="sub add" onClick={() => setSheetOpen(true)}>
          <div className="plus">
            <svg className="ic" width="16" height="16" viewBox="0 0 24 24">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
          <span>Добавить</span>
        </div>
      </div>

      <div className="tabbar rise" style={{ animationDelay: '0.36s' }}>
        <div className="tab on">
          <svg className="ic" width="20" height="20" viewBox="0 0 24 24">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          Главная
          <span className="pip"></span>
        </div>
        <div className="tab">
          <svg className="ic" width="20" height="20" viewBox="0 0 24 24">
            <line x1="6" y1="20" x2="6" y2="14" />
            <line x1="12" y1="20" x2="12" y2="8" />
            <line x1="18" y1="20" x2="18" y2="4" />
          </svg>
          Аналитика
        </div>
        <div className="fab" onClick={() => setSheetOpen(true)}>
          <svg className="ic" width="24" height="24" viewBox="0 0 24 24" style={{ strokeWidth: 2.2 }}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
        <div className="tab">
          <svg className="ic" width="20" height="20" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Друзья
        </div>
        <div className="tab">
          <svg className="ic" width="20" height="20" viewBox="0 0 24 24">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Профиль
        </div>
      </div>

      {selected && (
        <div className={`detail ${detailOpen ? 'on' : ''}`}>
          <div className="dglow" style={{ '--bc': selected.color } as React.CSSProperties}></div>
          <div className="dhead drise">
            <div className="xbtn" onClick={closeDetail}>
              <svg className="ic" width="15" height="15" viewBox="0 0 24 24">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </div>
            <span className="lbl">Подписка</span>
            <div className="xbtn">
              <svg className="ic" width="14" height="14" viewBox="0 0 24 24">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </div>
          </div>
          <div className="dlogo drise" style={{ background: selected.color, color: selected.dark ? '#1a1a1a' : '#fff' }}>
            {selected.letter}
          </div>
          <div className="dname drise">{selected.name}</div>
          <div className="dprice drise">{selected.price.toLocaleString('ru-RU')} ₽ / мес</div>
          <div className="dchips drise">
            <span className="dchip2 ok">
              <i></i>активна
            </span>
            <span className="dchip2">
              <i></i>
              {selected.nextDate} · {selected.daysLeft}
            </span>
          </div>
          <div className="dgrid drise">
            <div className="dstat">
              <div className="sl">В год</div>
              <div className="sv">
                <span>{(selected.price * 12).toLocaleString('ru-RU')}</span> ₽
              </div>
            </div>
            <div className="dstat">
              <div className="sl">Категория</div>
              <div className="sv" style={{ fontSize: '19px', paddingTop: '2px' }}>
                {selected.category}
              </div>
            </div>
          </div>
          <div className="dcard drise">
            {selected.split ? (
              <>
                <div className="dsplit-head">
                  <div className="label">
                    <i></i>Split
                  </div>
                  <span className="dcnt">{selected.split.length} чел</span>
                </div>
                {selected.split.map((p) => (
                  <div className="drow" key={p.username}>
                    <div className="dav" style={{ background: `linear-gradient(135deg,#8c6df6,#6947e6)` }}>
                      {p.name[0]}
                    </div>
                    <div className="dnm">
                      {p.name}
                      <small>{p.username}</small>
                    </div>
                    <div className="dam">
                      {p.amount} ₽<br />
                      <span className={`st ${p.paid ? 'o' : 'p'}`}>{p.paid ? 'оплатил' : 'ждём'}</span>
                    </div>
                  </div>
                ))}
                <div className="dfoot">
                  <span className="t">Твоя доля</span>
                  <b>{selected.price - selected.split.reduce((a, p) => a + p.amount, 0)} ₽/мес</b>
                </div>
              </>
            ) : (
              <>
                <div className="ctaico">
                  <svg className="ic" width="22" height="22" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="dcta-t">Разделить оплату</div>
                <div className="dcta-s">
                  Добавь друзей по @username — каждый платит свою долю, бот сам напомнит о переводе за день до списания.
                </div>
                <button className="dcta-b">Настроить split</button>
                <div className="dlock">
                  <svg className="ic" width="11" height="11" viewBox="0 0 24 24">
                    <rect width="18" height="11" x="3" y="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  нужна привязка Telegram
                </div>
              </>
            )}
          </div>
          <div className="dcard drise">
            <div className="label">
              <i></i>История платежей
            </div>
            <div style={{ marginTop: '6px' }}>
              {selected.history.map((h) => (
                <div className="hrow" key={h}>
                  <span className="hd">{h}</span>
                  <b>
                    <svg className="ic" width="11" height="11" viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {selected.price.toLocaleString('ru-RU')} ₽
                  </b>
                </div>
              ))}
            </div>
          </div>
          <div className="dcard drise">
            <div className="setrow">
              <div>
                Напоминать о списании<small>за день, в Telegram</small>
              </div>
              <div className="sw on"></div>
            </div>
          </div>
          <div className="dact drise">
            <button className="ebtn">Редактировать</button>
            <button className="rbtn2">Удалить</button>
          </div>
        </div>
      )}

      {sheetOpen && (
        <>
          <div className="overlay on" onClick={() => setSheetOpen(false)}></div>
          <div className="sheet on">
            <div className="grab"></div>
            <div className="shhead">
              <div className="shtitle">
                <i></i>Новая подписка
              </div>
              <div className="xbtn" onClick={() => setSheetOpen(false)}>
                <svg className="ic" width="14" height="14" viewBox="0 0 24 24">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </div>
            </div>
            <div className="presets">
              {subscriptions.slice(0, 8).map((sub) => (
                <div className="preset" key={sub.id} onClick={() => setSheetOpen(false)}>
                  <div className="logo" style={{ background: sub.color, color: sub.dark ? '#1a1a1a' : '#fff' }}>
                    {sub.letter}
                  </div>
                  <span>{sub.name}</span>
                </div>
              ))}
            </div>
            <div className="shdiv">или</div>
            <button className="custombtn" onClick={() => setSheetOpen(false)}>
              <svg className="ic" width="14" height="14" viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Своя подписка
            </button>
          </div>
        </>
      )}
    </div>
  )
}
