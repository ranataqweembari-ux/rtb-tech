import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: "var(--success)",
  error: "var(--danger)",
  info: "var(--accent)",
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || Info;
        return (
          <div
            key={t.id}
            className="flex items-start gap-2.5 rounded-md border px-3.5 py-3 shadow-lg animate-toast-in"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <Icon size={17} style={{ color: COLORS[t.variant] || COLORS.info, flexShrink: 0, marginTop: 1 }} />
            <p className="text-[13px] leading-snug flex-1">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-toast-in { animation: toast-in 0.15s ease-out; }
      `}</style>
    </div>
  );
}
