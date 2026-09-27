import { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "./components/TopBar";
import ToastContainer from "./components/ToastContainer";
import IDE from "./pages/IDE";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/Learning";
import SettingsPage from "./pages/SettingsPage";
import About from "./pages/About";
import { useApp } from "./context/AppContext";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export default function App() {
  const { pushToast } = useApp();
  const [view, setView] = useState("dashboard");
  const [projectIdToOpen, setProjectIdToOpen] = useState(undefined);
  const [pendingExample, setPendingExample] = useState(null);
  const [ideIsRunning, setIdeIsRunning] = useState(false);
  const [ideSaveState, setIdeSaveState] = useState(null);
  const [projectName, setProjectName] = useState("");

  const runSaveRef = useRef({ save: () => {}, run: () => {} });
  const registerRunSave = useCallback((handlers) => {
    runSaveRef.current = handlers;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        runSaveRef.current.save();
      }
      if ((mod && e.key === "Enter") || e.key === "F5") {
        e.preventDefault();
        runSaveRef.current.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (v) => setView(v);

  const openProjectFromDashboard = (id) => {
    setProjectIdToOpen(id);
    setView("ide");
  };

  const handleRunExample = (code, title) => {
    setPendingExample({ code, slug: slugify(title) });
    setView("ide");
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <TopBar
        view={view}
        onNavigate={navigate}
        projectName={projectName}
        onSave={() => runSaveRef.current.save()}
        onRun={() => runSaveRef.current.run()}
        onStop={() => runSaveRef.current.stop?.()}
        isRunning={ideIsRunning}
        saveState={ideSaveState}
      />

      <div className="flex flex-1 min-h-0">
        {/* IDE stays mounted so editor state / running executions survive tab switches */}
        <div className={view === "ide" ? "flex flex-1 min-h-0" : "hidden"}>
          <IDE
            registerRunSave={registerRunSave}
            initialProjectId={projectIdToOpen}
            pendingExample={pendingExample}
            onConsumedExample={() => setPendingExample(null)}
            onRunningChange={setIdeIsRunning}
            onSaveStateChange={setIdeSaveState}
            onProjectNameChange={setProjectName}
          />
        </div>

        {view === "dashboard" && (
          <Dashboard
            onNavigate={navigate}
            onOpenProject={openProjectFromDashboard}
            onNewProject={() => {
              setView("ide");
              setTimeout(() => window.dispatchEvent(new CustomEvent("rtb:new-project")), 50);
            }}
          />
        )}
        {view === "learning" && <Learning onRunExample={handleRunExample} />}
        {view === "settings" && <SettingsPage />}
        {view === "about" && <About />}
      </div>

      <ToastContainer />
    </div>
  );
}
