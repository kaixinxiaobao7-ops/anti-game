import type { ToastEntry } from "../game/types";

export function ToastStack({ toasts }: { toasts: ToastEntry[] }) {
  return (
    <div className="toast-layer" id="toastLayer" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast${toast.variant === "ember" ? " is-ember" : ""}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
