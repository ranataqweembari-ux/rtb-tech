import { X } from "lucide-react";

export default function EditorTabs({ tabs, activeFileId, dirtyIds, onSelect, onClose }) {
  if (tabs.length === 0) return null;
  return (
    <div
      className="flex items-center border-b overflow-x-auto shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      {tabs.map((f) => {
        const isActive = f.id === activeFileId;
        const isDirty = dirtyIds.has(f.id);
        return (
          <div
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="group flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer border-r shrink-0"
            style={{
              borderColor: "var(--border-color)",
              background: isActive ? "var(--bg-primary)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              borderTop: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <span>{f.filename}</span>
            {isDirty ? (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(f.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-bg-tertiary rounded p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
