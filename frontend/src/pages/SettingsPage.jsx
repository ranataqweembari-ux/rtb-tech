import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "var(--border-color)" }}>
      <span className="text-[13.5px] text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-9 h-5 rounded-full relative transition-colors"
      style={{ background: checked ? "var(--accent)" : "var(--bg-tertiary)" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border px-2 py-1 text-[13px] outline-none"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 rounded-md border px-2 py-1 text-[13px] outline-none text-right"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}
    />
  );
}

export default function SettingsPage() {
  const { settings, persistSettings, toggleTheme, theme, pushToast } = useApp();
  const [pythonInfo, setPythonInfo] = useState(null);
  const [checking, setChecking] = useState(false);

  if (!settings) return null;

  const set = (key, value) => persistSettings({ [key]: String(value) });

  const detectPython = async () => {
    setChecking(true);
    try {
      const info = await api.pythonInfo();
      setPythonInfo(info);
      pushToast(info.found ? info.message : info.message, info.found ? "success" : "error");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8">
        <h1 className="text-[20px] font-semibold mb-6">Settings</h1>

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-1 mt-6">Editor</h2>
        <Row label="Font size">
          <NumberInput value={settings["editor.fontSize"]} min={10} max={28} onChange={(v) => set("editor.fontSize", v)} />
        </Row>
        <Row label="Tab size">
          <NumberInput value={settings["editor.tabSize"]} min={2} max={8} onChange={(v) => set("editor.tabSize", v)} />
        </Row>
        <Row label="Word wrap">
          <Toggle checked={settings["editor.wordWrap"] === "on"} onChange={(v) => set("editor.wordWrap", v ? "on" : "off")} />
        </Row>
        <Row label="Minimap">
          <Toggle checked={settings["editor.minimap"] === "true"} onChange={(v) => set("editor.minimap", v)} />
        </Row>
        <Row label="Autosave">
          <Toggle checked={settings["editor.autoSave"] === "true"} onChange={(v) => set("editor.autoSave", v)} />
        </Row>

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-1 mt-6">Appearance</h2>
        <Row label="Theme">
          <Select
            value={theme}
            onChange={(v) => {
              if (v !== theme) toggleTheme();
            }}
            options={["dark", "light"]}
          />
        </Row>

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-1 mt-6">Execution</h2>
        <Row label="Timeout (seconds)">
          <span className="text-[12.5px] text-text-muted">
            {settings["execution.timeout"]}s — set EXECUTION_TIMEOUT in backend/.env
          </span>
        </Row>
        <Row label="Python interpreter">
          <div className="flex items-center gap-2">
            <button
              onClick={detectPython}
              disabled={checking}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px]"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <RefreshCw size={12} className={checking ? "animate-spin" : ""} /> Detect Python
            </button>
          </div>
        </Row>
        {pythonInfo && (
          <div className="flex items-center gap-2 py-2 text-[13px]">
            {pythonInfo.found ? (
              <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
            ) : (
              <XCircle size={14} style={{ color: "var(--danger)" }} />
            )}
            <span>{pythonInfo.message}</span>
          </div>
        )}
        {pythonInfo?.path && <p className="text-[12px] text-text-muted mb-2">Path: {pythonInfo.path}</p>}

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-1 mt-6">Application</h2>
        <Row label="Confirm before delete">
          <Toggle
            checked={settings["app.confirmBeforeDelete"] === "true"}
            onChange={(v) => set("app.confirmBeforeDelete", v)}
          />
        </Row>
        <Row label="Notifications">
          <Toggle checked={settings["app.notifications"] === "true"} onChange={(v) => set("app.notifications", v)} />
        </Row>
      </div>
    </div>
  );
}
