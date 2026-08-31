import { useState } from "react";
import {
  useGetMySplitDebtsQuery,
  useSetSplitDeclinedMutation,
} from "@/entities/split/api/splitApi";
import { useMoney } from "@/shared/lib/useCurrency";
import "./FriendsDebts.scss";

interface FriendsDebtsProps {
  onNotify: (type: "success" | "error", text: string) => void;
}

export function FriendsDebts({ onNotify }: FriendsDebtsProps) {
  const { data: debts = [] } = useGetMySplitDebtsQuery();
  const [setSplitDeclined] = useSetSplitDeclinedMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { symbol: currency, convert } = useMoney();

  if (debts.length === 0) return null;

  const handleToggle = async (splitId: string, declined: boolean) => {
    setPendingId(splitId);
    try {
      const result = await setSplitDeclined({ splitId, declined }).unwrap();
      if (result === "ok") {
        onNotify(
          "success",
          declined ? "Ты вышел из сплита" : "Ты снова в сплите",
        );
        return;
      }
      const errors: Record<string, string> = {
        no_username: "Привяжи Telegram в профиле, чтобы управлять долями",
        not_yours: "Это не твоя доля",
        already_paid: "Доля уже оплачена",
      };
      onNotify("error", errors[result] ?? "Не удалось. Попробуй позже");
    } catch {
      onNotify("error", "Не удалось. Попробуй позже");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <div className="friends-debts__header rise" style={{ animationDelay: "0.1s" }}>
        <h2 className="friends-debts__title">
          <i></i>Мои доли
        </h2>
      </div>
      <div className="friends-debts__card rise" style={{ animationDelay: "0.14s" }}>
        {debts.map((debt) => {
          const owner = (debt.owner_username ?? "друг").replace(/^@/, "");
          const busy = pendingId === debt.split_id;
          return (
            <div
              className={`friends-debts__row${debt.status === "declined" ? " friends-debts__row--declined" : ""}`}
              key={debt.split_id}
            >
              <div className="friends-debts__info">
                <b>{debt.subscription_title}</b>
                <div className="friends-debts__sub">
                  владелец · @{owner}
                </div>
              </div>
              <div className="friends-debts__right">
                <b>
                  {convert(debt.amount).toLocaleString("ru-RU", {
                    useGrouping: false,
                  })}{" "}
                  {currency}
                </b>
                {debt.status === "paid" ? (
                  <span className="friends-debts__status friends-debts__status--paid">
                    оплачено
                  </span>
                ) : debt.status === "declined" ? (
                  <button
                    className="friends-debts__action friends-debts__action--restore"
                    onClick={() => handleToggle(debt.split_id, false)}
                    disabled={busy}
                  >
                    Участвую
                  </button>
                ) : (
                  <button
                    className="friends-debts__action"
                    onClick={() => handleToggle(debt.split_id, true)}
                    disabled={busy}
                  >
                    Отклонить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
