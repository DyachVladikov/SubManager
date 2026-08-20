import { useState, useEffect } from "react";
import { supabase } from "@/shared/config/supabase";
import { withTimeout } from "@/shared/lib/withTimeout";
import { getAuthErrorMessage } from "../lib/authErrors";
import "./AuthPage.scss";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setMessage(
        "Вход через Google не удался. Попробуй ещё раз или войди по почте",
      );
      window.history.replaceState({}, "", window.location.pathname);
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          15000,
        );
        if (error) throw error;
        setMessage("Вход выполнен");
      } else {
        const { error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
          }),
          15000,
        );
        if (error) throw error;
        setMessage("Проверь почту для подтверждения");
      }
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      setMessage(getAuthErrorMessage(error));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__glow"></div>
      <div className="auth-page__glow auth-page__glow--bottom"></div>

      <div className="auth-page__left">
        <div
          className="auth-page__brand rise"
          style={{ animationDelay: "0.02s" }}
        >
          <div className="auth-page__logo-tile">S</div>
          <div className="auth-page__wordmark">
            Sub<b>Manager</b>
            <small>subscription tracker</small>
          </div>
        </div>

        <div
          className="auth-page__head rise"
          style={{ animationDelay: "0.08s" }}
        >
          <h1>
            Все подписки.
            <br />
            <span>Один взгляд.</span>
          </h1>
          <p>
            Сколько уходит на сервисы, когда спишут деньги и кто из друзей ещё
            не скинул за сплит — в одном месте.
          </p>
        </div>

        <div
          className="auth-page__note rise"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="auth-page__note-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.04 15.51l-.38 5.34c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.66.25 1.92-.9L21.9 4.6c.31-1.42-.51-1.97-1.46-1.63L2.7 9.92c-1.39.54-1.37 1.31-.24 1.66l4.55 1.42 10.57-6.66c.5-.31.95-.14.58.19L9.04 15.51z" />
            </svg>
          </div>
          <div>
            <b>Открываешь из Telegram?</b>
            <span>
              В Mini App вход не нужен — открыл мини-апп, и ты уже внутри.
              Аккаунт привяжется сам по initData.
            </span>
          </div>
        </div>

        <div
          className="auth-page__terms rise"
          style={{ animationDelay: "0.26s" }}
        >
          Продолжая, ты принимаешь <a>условия использования</a>
          <br />и <a>политику конфиденциальности</a>
        </div>
      </div>

      <div className="auth-page__right">
        <div
          className="auth-page__card rise"
          style={{ animationDelay: "0.14s" }}
        >
          <button
            className="auth-page__google-btn"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>
              {loading ? "Подключаем Google…" : "Продолжить с Google"}
            </span>
          </button>

          <div className="auth-page__divider">или</div>

          <form onSubmit={handleAuth}>
            <div className="auth-page__field">
              <label>Email</label>
              <div className="auth-page__input-wrap">
                <input
                  className="auth-page__input"
                  type="email"
                  placeholder="Email@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label>Пароль</label>
              <div className="auth-page__input-wrap">
                <input
                  className="auth-page__input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="auth-page__eye"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <a
                className="auth-page__forgot"
                onClick={() => setMessage("Восстановление пока не реализовано")}
              >
                Забыл пароль?
              </a>
            )}

            <button
              className="auth-page__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-page__spinner"></span>
              ) : isLogin ? (
                "Войти"
              ) : (
                "Создать аккаунт"
              )}
            </button>
          </form>

          <div className="auth-page__switch-line">
            {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <a onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Регистрация" : "Войти"}
            </a>
          </div>

          {message && <p className="auth-page__message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
