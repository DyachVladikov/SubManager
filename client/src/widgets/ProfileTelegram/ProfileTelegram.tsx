import { useEffect, useState } from "react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/entities/profile/api/profileApi";
import { supabase } from "@/shared/config/supabase";
import "./ProfileTelegram.scss";

const BOT_URL = "https://t.me/app_sub_manager_bot";

export function ProfileTelegram() {
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profile } = useGetProfileQuery(undefined, {
    pollingInterval: waiting ? 3000 : 0,
  });
  const [updateProfile, { isLoading: unlinking }] = useUpdateProfileMutation();

  const linked = Boolean(profile?.telegram_id);

  useEffect(() => {
    if (linked) setWaiting(false);
  }, [linked]);

  const handleLink = async () => {
    setError(null);
    const tgWindow = window.open("", "_blank");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      tgWindow?.close();
      return;
    }
    const token = `link_${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`;
    const { error: insertError } = await supabase.from("link_tokens").insert({
      token,
      user_id: userData.user.id,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
    if (insertError) {
      tgWindow?.close();
      setError("Не удалось создать ссылку. Попробуй ещё раз.");
      return;
    }
    setWaiting(true);
    const url = `${BOT_URL}?start=${token}`;
    if (tgWindow) {
      tgWindow.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const handleUnlink = async () => {
    await updateProfile({ telegram_id: null, telegram_username: null });
  };

  return (
    <div className="profile-telegram rise" style={{ animationDelay: "0.14s" }}>
      <div className="profile-telegram__label">
        <i></i>Telegram
      </div>
      {linked ? (
        <div className="profile-telegram__row">
          <div className="profile-telegram__icon profile-telegram__icon--ok">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="profile-telegram__info">
            <b>@{profile?.telegram_username ?? "telegram"}</b>
            <span>
              привязан · бот @app_sub_manager_bot · уведомления и split активны
            </span>
          </div>
          <button
            className="profile-telegram__unlink"
            onClick={handleUnlink}
            disabled={unlinking}
          >
            Отвязать
          </button>
        </div>
      ) : (
        <>
          <div className="profile-telegram__row">
            <div className="profile-telegram__icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </div>
            <div className="profile-telegram__info">
              <b>Не привязан</b>
              <span>
                Бот напомнит о списаниях и переводах друзей. Без Telegram split
                недоступен.
              </span>
            </div>
          </div>
          {waiting ? (
            <>
              <p className="profile-telegram__hint">
                Открыл тебе бота — нажми в нём «Start». Ссылка живёт 15 минут,
                здесь всё обновится само.
              </p>
              <button
                className="profile-telegram__button"
                onClick={() => setWaiting(false)}
              >
                Отмена
              </button>
            </>
          ) : (
            <button className="profile-telegram__button" onClick={handleLink}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Привязать Telegram
            </button>
          )}
          {error && <p className="profile-telegram__error">{error}</p>}
        </>
      )}
    </div>
  );
}
