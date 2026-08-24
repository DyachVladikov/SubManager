export const toHumanError = (error: unknown): string => {
  const message = (error as { message?: string })?.message ?? String(error);
  if (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("Load failed")
  ) {
    return "Нет соединения с сервером. Проверь интернет и попробуй ещё раз.";
  }
  if (message.includes("row-level security")) {
    return "Нет доступа к этим данным. Попробуй выйти и зайти в аккаунт заново.";
  }
  if (message.includes("JWT") || message.includes("session")) {
    return "Сессия устарела. Перезайди в аккаунт.";
  }
  return "Не получилось сохранить. Попробуй ещё раз чуть позже.";
};
