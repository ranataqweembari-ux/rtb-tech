import { Play, Square, Save, Sun, Moon, Settings as SettingsIcon, Info, LayoutDashboard, BookOpen, Code2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function TopBar({ view, onNavigate, projectName, onSave, onRun, onStop, isRunning, saveState }) {
  const { theme, toggleTheme } = useApp();

  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => onNavigate(id)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
      style={{
        color: view === id ? "var(--text-primary)" : "var(--text-secondary)",
        background: view === id ? "var(--bg-tertiary)" : "transparent",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div
      className="h-12 flex items-center justify-between px-3 border-b select-none shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-3 border-r" style={{ borderColor: "var(--border-color)" }}>
          <div
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-[12px]"
            style={{ background: "var(--accent)", color: "#181b22" }}
          >
            R
          </div>
          <span className="font-semibold text-[13.5px] tracking-tight">RTB&apos;s Tech</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavButton id="ide" icon={Code2} label="Editor" />
          <NavButton id="learning" icon={BookOpen} label="Learning" />
        </nav>
      </div>

      {view === "ide" && (
        <div className="hidden md:flex items-center gap-2 text-[13px] text-text-secondary">
          <span>{projectName}</span>
          <span className="text-text-muted">
            {saveState === "saving" && "· Saving…"}
            {saveState === "saved" && "· Saved ✓"}
            {saveState === "error" && "· Save failed"}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {view === "ide" && (
          <>
            <button
              onClick={onSave}
              title="Save (Ctrl+S)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] hover:bg-bg-tertiary transition-colors"
            >
              <Save size={14} /> Save
            </button>
            {isRunning ? (
              <button
                onClick={onStop}
                title="Stop"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium"
                style={{ background: "var(--danger)", color: "#181b22" }}
              >
                <Square size={13} fill="#181b22" /> Stop
              </button>
            ) : (
              <button
                onClick={onRun}
                title="Run (Ctrl+Enter)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium"
                style={{ background: "var(--accent)", color: "#181b22" }}
              >
                <Play size={13} fill="#181b22" /> Run
              </button>
            )}
          </>
        )}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="p-2 rounded-md hover:bg-bg-tertiary transition-colors"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={() => onNavigate("settings")}
          title="Settings"
          className="p-2 rounded-md hover:bg-bg-tertiary transition-colors"
        >
          <SettingsIcon size={15} />
        </button>
        <button
          onClick={() => onNavigate("about")}
          title="About"
          className="p-2 rounded-md hover:bg-bg-tertiary transition-colors"
        >
          <Info size={15} />
        </button>
      </div>
    </div>
  );
}
