import { useRef, useState } from "react";

export type ToastType = "success" | "delete" | "error";

export function useToast() {
  const [toast, setToast] = useState<{ type: ToastType; text?: string } | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: ToastType, text?: string) => {
    setToast({ type, text });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2500);
  };

  return { toast, showToast };
}
