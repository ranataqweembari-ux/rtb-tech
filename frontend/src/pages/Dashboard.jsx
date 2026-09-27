import { useEffect, useState } from "react";
import { FolderPlus, FolderOpen, BookOpen, Layers, CheckCircle2, XCircle, Code2 } from "lucide-react";
import { api } from "../services/api";

export default function Dashboard({ onNavigate, onOpenProject, onNewProject }) {
  const [projects, setProjects] = useState([]);
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
    api.listExecutions(undefined, 6).then(setExecutions).catch(() => {});
  }, []);

  const Card = ({ icon: Icon, title, desc, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2.5 p-4 rounded-lg border text-left hover:border-accent/60 transition-colors"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
        <Icon size={16} style={{ color: "var(--accent)" }} />
      </div>
      <p className="text-[14px] font-medium">{title}</p>
      <p className="text-[12.5px] text-text-secondary leading-snug">{desc}</p>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-[24px] font-semibold mb-1">Welcome to RTB&apos;s Tech</h1>
        <p className="text-text-secondary text-[14px] mb-8">
          A modern Python learning and development environment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <Card icon={FolderPlus} title="New Python project" desc="Start a fresh project with a ready-to-run main.py." onClick={onNewProject} />
          <Card icon={FolderOpen} title="Open project" desc="Jump back into one of your saved projects." onClick={() => onNavigate("ide")} />
          <Card icon={Layers} title="Python fundamentals" desc="Variables, loops, functions, data structures and more." onClick={() => onNavigate("learning")} />
          <Card icon={BookOpen} title="Object-oriented programming" desc="Classes, inheritance, encapsulation and abstraction." onClick={() => onNavigate("learning")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
              Recent projects
            </h2>
            <div className="rounded-lg border divide-y" style={{ borderColor: "var(--border-color)" }}>
              {projects.length === 0 && (
                <p className="p-4 text-[13px] text-text-muted italic">No projects yet — create one to get started.</p>
              )}
              {projects.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-bg-tertiary"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 size={14} style={{ color: "var(--accent)" }} />
                    <div>
                      <p className="text-[13.5px]">{p.name}</p>
                      <p className="text-[12px] text-text-muted">{p.file_count} file{p.file_count === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <span className="text-[12px] text-text-muted">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
              Recent executions
            </h2>
            <div className="rounded-lg border divide-y" style={{ borderColor: "var(--border-color)" }}>
              {executions.length === 0 && (
                <p className="p-4 text-[13px] text-text-muted italic">Nothing run yet — try Python Fundamentals.</p>
              )}
              {executions.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5 px-4 py-3" style={{ background: "var(--bg-secondary)" }}>
                  {e.status === "success" ? (
                    <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                  ) : (
                    <XCircle size={14} style={{ color: "var(--danger)" }} />
                  )}
                  <p className="text-[13.5px] flex-1 truncate">{e.filename}</p>
                  <span className="text-[12px] text-text-muted">{e.execution_time?.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
