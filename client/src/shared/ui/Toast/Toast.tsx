import { LuCheck, LuTrash2, LuX } from "react-icons/lu";
import type { ToastType } from "@/shared/lib/useToast";
import "./Toast.scss";

interface ToastProps {
  type: ToastType;
  text?: string;
}

const config = {
  success: { icon: <LuCheck size={30} />, text: "Успех" },
  delete: { icon: <LuTrash2 size={28} />, text: "Удалено" },
  error: { icon: <LuX size={30} />, text: "Ошибка" },
} as const;

export function Toast({ type, text }: ToastProps) {
  const current = config[type];
  return (
    <div className="toast-overlay">
      <div className="toast">
        <div className={`toast__icon toast__icon--${type}`}>{current.icon}</div>
        <span className="toast__text">{text ?? current.text}</span>
      </div>
    </div>
  );
}
