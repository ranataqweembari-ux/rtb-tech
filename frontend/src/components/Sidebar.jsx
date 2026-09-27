import { useState } from "react";
import {
  FileCode2, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2, ChevronDown, FolderPlus,
} from "lucide-react";

export default function Sidebar({
  project, projects, files, activeFileId, dirtyIds,
  onOpenFile, onNewFile, onRenameFile, onDeleteFile, onSwitchProject, onNewProject,
}) {
  const [menuFor, setMenuFor] = useState(null);
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="w-64 shrink-0 flex flex-col border-r"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b" style={{ borderColor: "var(--border-color)" }}>
        <select
          value={project?.id ?? ""}
          onChange={(e) => onSwitchProject(Number(e.target.value))}
          className="bg-transparent text-[12.5px] font-semibold outline-none max-w-[150px] truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id} style={{ background: "var(--bg-secondary)" }}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button onClick={onNewProject} title="New project" className="p-1 rounded hover:bg-bg-tertiary">
            <FolderPlus size={14} />
          </button>
          <button onClick={onNewFile} title="New Python file" className="p-1 rounded hover:bg-bg-tertiary">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <button
          className="flex items-center gap-1.5 w-full px-1.5 py-1 mb-1 text-[11.5px] font-medium uppercase tracking-wide text-text-muted hover:text-text-secondary"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown size={12} className={expanded ? "" : "-rotate-90"} style={{ transition: "transform 0.1s" }} />
          <FolderOpen size={13} />
          {project?.name || "Project"}
        </button>

        {expanded && (
          <ul className="space-y-0.5">
            {files.map((f) => {
              const isActive = f.id === activeFileId;
              const isDirty = dirtyIds.has(f.id);
              return (
                <li key={f.id} className="relative group">
                  <button
                    onClick={() => onOpenFile(f.id)}
                    className="flex items-center gap-2 w-full pl-6 pr-2 py-1.5 rounded-md text-[13px] text-left truncate"
                    style={{
                      background: isActive ? "var(--bg-tertiary)" : "transparent",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    <FileCode2 size={14} className="shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="truncate flex-1">{f.filename}</span>
                    {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFor(menuFor === f.id ? null : f.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bg-primary"
                    >
                      <MoreHorizontal size={13} />
                    </span>
                  </button>

                  {menuFor === f.id && (
                    <div
                      className="absolute right-1 top-8 z-20 w-32 rounded-md border shadow-lg py-1"
                      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                      onMouseLeave={() => setMenuFor(null)}
                    >
                      <button
                        onClick={() => {
                          setMenuFor(null);
                          onRenameFile(f);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12.5px] hover:bg-bg-tertiary text-left"
                      >
                        <Pencil size={12} /> Rename
                      </button>
                      <button
                        onClick={() => {
                          setMenuFor(null);
                          onDeleteFile(f);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12.5px] hover:bg-bg-tertiary text-left"
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
