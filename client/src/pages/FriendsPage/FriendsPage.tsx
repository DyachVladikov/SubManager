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
import { AddSubscriptionSheet } from "@/widgets/AddSubscriptionSheet";
import "./FriendsPage.scss";
import { supabase } from "@/shared/config/supabase";

interface FriendsPageProps {
  onNavigate: (tab: TabKey) => void;
}

export function FriendsPage({ onNavigate }: FriendsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast, showToast } = useToast();
  const { data: splits = [], isLoading } = useGetSplitsQuery();
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

  const handlePaid = async (split: Split) => {
    await updateSplitStatus({ id: split.id, status: "paid" });
    showToast("success");
  };
  const handleRemind = async (split: Split) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch(`${import.meta.env.VITE_BOT_API_URL}/api/remind`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ split_id: split.id }),
    });
    showToast(res.ok ? "success" : "delete");
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
            subscriptions={subscriptionById}
            onRemind={() => handleRemind}
            onPaid={handlePaid}
          />
        </div>
        <div className="friends-page__column">
          <FriendsPaid splits={paidSplits} subscriptions={subscriptionById} />
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

      {toast && <Toast type={toast} />}
    </div>
  );
}
