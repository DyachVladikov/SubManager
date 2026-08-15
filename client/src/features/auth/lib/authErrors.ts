export function getAuthErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Network request failed')) {
    return 'Нет соединения с сервером. Проверь интернет и попробуй ещё раз'
  }
  if (message.includes('request timeout')) {
    return 'Сервер долго не отвечает. Закрой лишние вкладки с приложением и попробуй ещё раз'
  }
  if (message.includes('Invalid login credentials')) {
    return 'Неверный email или пароль'
  }
  if (message.includes('Email not confirmed')) {
    return 'Подтверди почту — письмо уже ждёт в ящике'
  }
  if (message.includes('User already registered')) {
    return 'Такой email уже зарегистрирован — попробуй войти'
  }
  if (message.includes('Password should be')) {
    return 'Пароль должен быть не короче 6 символов'
  }
  return 'Ошибка авторизации. Попробуй ещё раз'
}
