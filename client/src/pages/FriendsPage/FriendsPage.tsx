import { useState } from "react";
import { useGetSubscriptionsQuery } from "@/entities/subscription/api/subscriptionApi";
import {
  useGetSplitsQuery,
  useUpdateSplitStatusMutation,
  type Split,
} from "@/entities/split/api/splitApi";
import { useToast } from "@/shared/lib/useToast";
import { useBodyScrollLock } from "@/shared/lib/useBodyScrollLock";
import { Toast } from "@/shared/ui/Toast";
import { DashboardHeader } from "@/widgets/DashboardHeader";
import { Loader } from "@/shared/ui/Loader";
import { TabBar, type TabKey } from "@/widgets/TabBar";
import { FriendsSummary } from "@/widgets/FriendsSummary";
import { FriendsPending } from "@/widgets/FriendsPending";
import { FriendsPaid } from "@/widgets/FriendsPaid";
import { FriendsDebts } from "@/widgets/FriendsDebts";
import { AddSubscriptionSheet } from "@/widgets/AddSubscriptionSheet";
import "./FriendsPage.scss";
import { supabase } from "@/shared/config/supabase";

interface FriendsPageProps {
  onNavigate: (tab: TabKey) => void;
}

export function FriendsPage({ onNavigate }: FriendsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast, showToast } = useToast();
  const {
    data: splits = [],
    isLoading,
    refetch: refetchSplits,
  } = useGetSplitsQuery();
  const { data: subscriptions = [] } = useGetSubscriptionsQuery();
  const [updateSplitStatus] = useUpdateSplitStatusMutation();
  useBodyScrollLock(sheetOpen);

  const subscriptionById = subscriptions.reduce<
    Record<string, (typeof subscriptions)[number]>
  >((acc, sub) => {
    acc[sub.id] = sub;
    return acc;
  }, {});
  const pendingSplits = splits.filter((split) => split.status === "pending");
  const paidSplits = splits.filter((split) => split.status === "paid");
  const declinedSplits = splits.filter((split) => split.status === "declined");

  const handlePaid = async (split: Split) => {
    await updateSplitStatus({ id: split.id, status: "paid" });
    showToast("success");
  };
  const remindErrors: Record<string, string> = {
    debtor_no_telegram:
      "Этот пользователь ещё не запускал бота — напомнить некуда",
    too_often: "Напоминание уже отправлено, повторное будет доступно позже",
    split_not_found: "Доля не найдена",
    split_declined: "Друг отклонил эту долю",
    already_paid: "Доля уже оплачена",
    not_yours: "Это не твой сплит",
    no_token: "Перезайди в аккаунт",
    bad_token: "Сессия устарела — перезайди",
  };

  const handleRemind = async (split: Split) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        showToast("error", "Перезайди в аккаунт");
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_BOT_API_URL}/api/remind`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ split_id: split.id }),
        },
      );
      if (res.ok) {
        showToast("success", "Напоминание отправлено");
        refetchSplits();
        return;
      }
      const body = await res.json().catch(() => null);
      showToast(
        "error",
        remindErrors[body?.error] ?? "Не удалось отправить. Попробуй позже",
      );
    } catch (err) {
      console.error("remind:", err);
      showToast("error", "Нет соединения с сервером");
    }
  };

  if (isLoading) {
    return (
      <div className="friends-page">
        <div className="friends-page__glow"></div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-page__glow"></div>

      <DashboardHeader onBrandClick={() => onNavigate("profile")} />
      <div
        className="friends-page__title rise"
        style={{ animationDelay: "0.05s" }}
      >
        Друзья
      </div>

      <div className="friends-page__content">
        <FriendsSummary
          splits={splits}
          onRemindAll={() =>
            pendingSplits.forEach((split) => handleRemind(split))
          }
        />
        <div className="friends-page__column">
          <FriendsPending
            splits={pendingSplits}
            declinedSplits={declinedSplits}
            subscriptions={subscriptionById}
            onRemind={handleRemind}
            onPaid={handlePaid}
          />
        </div>
        <div className="friends-page__column">
          <FriendsPaid splits={paidSplits} subscriptions={subscriptionById} />
        </div>
        <div className="friends-page__column">
          <FriendsDebts onNotify={showToast} />
        </div>
      </div>

      <TabBar
        active="friends"
        onNavigate={onNavigate}
        onAdd={() => setSheetOpen(true)}
      />

      {sheetOpen && (
        <AddSubscriptionSheet
          onClose={() => setSheetOpen(false)}
          onSuccess={() => showToast("success")}
        />
      )}

      {toast && <Toast type={toast.type} text={toast.text} />}
    </div>
  );
}
