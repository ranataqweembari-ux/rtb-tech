import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

const AppContext = createContext(null);

let toastId = 0;

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [settings, setSettings] = useState(null);
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      const t = s["appearance.theme"] || "dark";
      setTheme(t === "system" ? "dark" : t);
    }).catch(() => setSettings({}));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const pushToast = useCallback((message, variant = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const persistSettings = useCallback(async (partial) => {
    const merged = { ...settings, ...partial };
    setSettings(merged);
    try {
      await api.updateSettings(partial);
    } catch {
      pushToast("Could not save settings.", "error");
    }
  }, [settings, pushToast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      persistSettings({ "appearance.theme": next });
      return next;
    });
  }, [persistSettings]);

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, settings, persistSettings, pushToast, dismissToast, toasts }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
