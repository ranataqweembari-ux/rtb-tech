import { useState } from "react";
import { Play, ChevronRight } from "lucide-react";
import { LEARNING_TOPICS } from "../data/learningContent";

export default function Learning({ onRunExample }) {
  const [active, setActive] = useState(LEARNING_TOPICS[0].topics[0]);

  return (
    <div className="flex flex-1 min-h-0">
      <aside
        className="w-72 shrink-0 border-r overflow-y-auto"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
      >
        {LEARNING_TOPICS.map((group) => (
          <div key={group.category} className="py-2">
            <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {group.category}
            </p>
            {group.topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="flex items-center justify-between w-full px-4 py-2 text-[13px] text-left"
                style={{
                  background: active.id === t.id ? "var(--bg-tertiary)" : "transparent",
                  color: active.id === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {t.title}
                {active.id === t.id && <ChevronRight size={13} />}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          <h1 className="text-[22px] font-semibold mb-1.5">{active.title}</h1>
          <p className="text-text-secondary text-[14px] mb-6">{active.summary}</p>

          <p className="text-[14px] leading-relaxed text-text-secondary mb-6">{active.explanation}</p>

          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
            >
              <span className="text-[12px] text-text-muted font-mono">example.py</span>
              <button
                onClick={() => onRunExample(active.code, active.title)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium"
                style={{ background: "var(--accent)", color: "#181b22" }}
              >
                <Play size={12} fill="#181b22" /> Run example
              </button>
            </div>
            <pre
              className="p-4 text-[13px] font-mono overflow-x-auto"
              style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              {active.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
