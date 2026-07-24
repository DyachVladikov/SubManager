import { useState } from 'react'
import { supabase } from '@/shared/config/supabase'
import './AuthPage.scss'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('Вход выполнен')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Проверь почту для подтверждения')
      }
    } catch (error: any) {
      setMessage(error.message || 'Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="auth-page">
      <div className="glow"></div>
      <div className="glow2"></div>

      <div className="brandwrap rise" style={{ animationDelay: '0.02s' }}>
        <div className="logotile">S</div>
        <div className="wordmark">
          Sub<b>Manager</b>
          <small>subscription tracker</small>
        </div>
      </div>

      <div className="head rise" style={{ animationDelay: '0.08s' }}>
        <h1>
          Все подписки.
          <br />
          <span>Один взгляд.</span>
        </h1>
        <p>
          Сколько уходит на сервисы, когда спишут деньги и кто из друзей ещё не скинул за сплит — в
          одном месте.
        </p>
      </div>

      <div className="card rise" style={{ animationDelay: '0.14s' }}>
        <button className="gbtn" onClick={handleGoogle} disabled={loading}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#4285F4">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          <span>{loading ? 'Подключаем Google…' : 'Продолжить с Google'}</span>
        </button>

        <div className="divider">или</div>

        <form onSubmit={handleAuth}>
          <div className="frow">
            <label>Email</label>
            <div className="inp">
              <input
                type="email"
                placeholder="vlad@gmail.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="frow">
            <label>Пароль</label>
            <div className="inp">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="eye"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <a className="forgot" onClick={() => setMessage('Восстановление пока не реализовано')}>
              Забыл пароль?
            </a>
          )}

          <button className="sbtn" type="submit" disabled={loading}>
            {loading ? <span className="spin"></span> : isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="swline">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <a onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Регистрация' : 'Войти'}
          </a>
        </div>

        {message && <p className="auth-message">{message}</p>}
      </div>

      <div className="tmanote rise" style={{ animationDelay: '0.2s' }}>
        <div className="tmico">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.04 15.51l-.38 5.34c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.66.25 1.92-.9L21.9 4.6c.31-1.42-.51-1.97-1.46-1.63L2.7 9.92c-1.39.54-1.37 1.31-.24 1.66l4.55 1.42 10.57-6.66c.5-.31.95-.14.58.19L9.04 15.51z" />
          </svg>
        </div>
        <div>
          <b>Открываешь из Telegram?</b>
          <span>В Mini App вход не нужен — открыл мини-апп, и ты уже внутри. Аккаунт привяжется сам по initData.</span>
        </div>
      </div>

      <div className="terms rise" style={{ animationDelay: '0.26s' }}>
        Продолжая, ты принимаешь <a>условия использования</a>
        <br />и <a>политику конфиденциальности</a>
      </div>
    </div>
  )
}
