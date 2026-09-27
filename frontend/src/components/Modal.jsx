import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, onClose, children, width = 420 }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(8, 9, 12, 0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-lg border shadow-2xl"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", width }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2 className="text-[14px] font-semibold">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
