import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import EditorTabs from "../components/EditorTabs";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import Modal from "../components/Modal";
import { api } from "../services/api";
import { useApp } from "../context/AppContext";

const POLL_MS = 300;

export default function IDE({
  registerRunSave, initialProjectId, pendingExample, onConsumedExample,
  onRunningChange, onSaveStateChange, onProjectNameChange,
}) {
  const { pushToast, settings } = useApp();

  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [openTabIds, setOpenTabIds] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [buffers, setBuffers] = useState({}); // fileId -> current editor content
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [saveState, setSaveState] = useState(null);
  const [execution, setExecution] = useState(null);
  const [panelHeight, setPanelHeight] = useState(260);

  const [modal, setModal] = useState(null); // 'newProject' | 'newFile' | 'rename' | 'deleteFile' | 'deleteProject'
  const [modalInput, setModalInput] = useState({ name: "", description: "" });
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const pollRef = useRef(null);
  const autosaveTimers = useRef({});

  const loadProjects = useCallback(async (selectId) => {
    const list = await api.listProjects();
    setProjects(list);
    const chosen = list.find((p) => p.id === selectId) || list[0] || null;
    if (chosen) await openProject(chosen);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProject = async (p) => {
    setProject(p);
    const fileList = await api.listFiles(p.id);
    setFiles(fileList);
    if (fileList.length) {
      const main = fileList.find((f) => f.filename === "main.py") || fileList[0];
      setOpenTabIds([main.id]);
      setActiveFileId(main.id);
      setBuffers((prev) => ({ ...prev, [main.id]: main.content }));
    } else {
      setOpenTabIds([]);
      setActiveFileId(null);
    }
    setExecution(null);
  };

  useEffect(() => {
    loadProjects(initialProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDirty = (fileId, isDirty) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      if (isDirty) next.add(fileId);
      else next.delete(fileId);
      return next;
    });
  };

  const handleChange = (fileId, value) => {
    setBuffers((prev) => ({ ...prev, [fileId]: value }));
    markDirty(fileId, true);

    if (settings?.["editor.autoSave"] === "true") {
      clearTimeout(autosaveTimers.current[fileId]);
      autosaveTimers.current[fileId] = setTimeout(() => saveFile(fileId), 900);
    }
  };

  const saveFile = useCallback(async (fileId) => {
    const id = fileId ?? activeFileId;
    if (!id) return;
    const content = buffers[id];
    if (content === undefined) return;
    setSaveState("saving");
    try {
      await api.updateFile(id, { content });
      markDirty(id, false);
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)));
      setSaveState("saved");
      setTimeout(() => setSaveState(null), 1500);
    } catch {
      setSaveState("error");
      pushToast("Unable to save file.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId, buffers]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const runFile = useCallback(async () => {
    if (!activeFileId) return;
    await saveFile(activeFileId);
    const code = buffers[activeFileId] ?? "";
    try {
      const exec = await api.run(activeFileId, code);
      setExecution({ ...exec, waiting_for_input: false });
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const result = await api.poll(exec.id);
          setExecution((prev) => ({ ...prev, ...result }));
          if (result.status !== "running") stopPolling();
        } catch {
          stopPolling();
        }
      }, POLL_MS);
    } catch (e) {
      pushToast(e.message || "Execution failed to start.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId, buffers]);

  const stopRun = async () => {
    if (!execution) return;
    try {
      await api.stop(execution.id);
    } finally {
      stopPolling();
    }
  };

  const sendInput = async (value) => {
    if (!execution) return;
    await api.sendInput(execution.id, value);
  };

  useEffect(() => () => stopPolling(), []);

  useEffect(() => {
    registerRunSave?.({ save: () => saveFile(activeFileId), run: runFile, stop: stopRun });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRunSave, saveFile, runFile, activeFileId, execution]);

  useEffect(() => {
    onRunningChange?.(execution?.status === "running");
  }, [execution?.status, onRunningChange]);

  useEffect(() => {
    onSaveStateChange?.(saveState);
  }, [saveState, onSaveStateChange]);

  useEffect(() => {
    onProjectNameChange?.(project?.name || "");
  }, [project, onProjectNameChange]);

  useEffect(() => {
    const handler = () => {
      setModalInput({ name: "", description: "" });
      setModal("newProject");
    };
    window.addEventListener("rtb:new-project", handler);
    return () => window.removeEventListener("rtb:new-project", handler);
  }, []);

  // Handle "Run example" coming from the Learning page: drop the example
  // code into a scratch file in the current project, open it, and run it.
  useEffect(() => {
    if (!pendingExample || !project) return;
    (async () => {
      const filename = `example_${pendingExample.slug}.py`;
      let file = files.find((f) => f.filename === filename);
      try {
        if (file) {
          file = await api.updateFile(file.id, { content: pendingExample.code });
          setFiles((prev) => prev.map((f) => (f.id === file.id ? file : f)));
        } else {
          file = await api.createFile(project.id, { filename, content: pendingExample.code });
          setFiles((prev) => [...prev, file].sort((a, b) => a.filename.localeCompare(b.filename)));
        }
        setBuffers((prev) => ({ ...prev, [file.id]: file.content }));
        openFile(file.id);

        // Run directly against the freshly saved file/code, rather than relying
        // on state that may not have committed yet.
        const exec = await api.run(file.id, file.content);
        setExecution({ ...exec, waiting_for_input: false });
        stopPolling();
        pollRef.current = setInterval(async () => {
          try {
            const result = await api.poll(exec.id);
            setExecution((prev) => ({ ...prev, ...result }));
            if (result.status !== "running") stopPolling();
          } catch {
            stopPolling();
          }
        }, POLL_MS);
      } catch (e) {
        pushToast(e.message || "Unable to load example.", "error");
      } finally {
        onConsumedExample?.();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingExample, project]);

  // --- file / tab actions ---
  const openFile = (fileId) => {
    setActiveFileId(fileId);
    setOpenTabIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    if (buffers[fileId] === undefined) {
      const f = files.find((x) => x.id === fileId);
      if (f) setBuffers((prev) => ({ ...prev, [fileId]: f.content }));
    }
  };

  const closeTab = (fileId) => {
    setOpenTabIds((prev) => prev.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openTabIds.filter((id) => id !== fileId);
      setActiveFileId(remaining[remaining.length - 1] || null);
    }
  };

  const createFile = async () => {
    if (!project) return;
    const filename = modalInput.name.trim();
    if (!filename) return;
    try {
      const file = await api.createFile(project.id, { filename, content: "" });
      setFiles((prev) => [...prev, file].sort((a, b) => a.filename.localeCompare(b.filename)));
      setBuffers((prev) => ({ ...prev, [file.id]: file.content }));
      openFile(file.id);
      pushToast(`Created ${file.filename}`, "success");
      setModal(null);
      setModalInput({ name: "", description: "" });
    } catch (e) {
      pushToast(e.message || "Unable to create file.", "error");
    }
  };

  const renameFile = async () => {
    if (!renameTarget) return;
    const filename = modalInput.name.trim();
    try {
      const updated = await api.updateFile(renameTarget.id, { filename });
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      pushToast("File renamed.", "success");
    } catch (e) {
      pushToast(e.message || "Unable to rename file.", "error");
    } finally {
      setModal(null);
      setRenameTarget(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteFile(deleteTarget.id);
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      closeTab(deleteTarget.id);
      pushToast(`Deleted ${deleteTarget.filename}`, "success");
    } catch (e) {
      pushToast(e.message || "Unable to delete file.", "error");
    } finally {
      setModal(null);
      setDeleteTarget(null);
    }
  };

  const createProject = async () => {
    const name = modalInput.name.trim();
    if (!name) return;
    try {
      const p = await api.createProject({ name, description: modalInput.description });
      const list = await api.listProjects();
      setProjects(list);
      await openProject(p);
      pushToast(`Project "${p.name}" created.`, "success");
    } catch (e) {
      pushToast(e.message || "Unable to create project.", "error");
    } finally {
      setModal(null);
      setModalInput({ name: "", description: "" });
    }
  };

  const switchProject = async (id) => {
    const p = projects.find((x) => x.id === id);
    if (p) await openProject(p);
  };

  const tabs = openTabIds.map((id) => files.find((f) => f.id === id)).filter(Boolean);
  const activeContent = activeFileId !== null ? buffers[activeFileId] ?? "" : "";

  // resizable output panel
  const resizingRef = useRef(false);
  const startResize = (e) => {
    if (e.target.closest("button")) return;
    resizingRef.current = true;
    const startY = e.clientY;
    const startHeight = panelHeight;
    const onMove = (ev) => {
      if (!resizingRef.current) return;
      const delta = startY - ev.clientY;
      setPanelHeight(Math.min(600, Math.max(120, startHeight + delta)));
    };
    const onUp = () => {
      resizingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar
        project={project}
        projects={projects}
        files={files}
        activeFileId={activeFileId}
        dirtyIds={dirtyIds}
        onOpenFile={openFile}
        onNewFile={() => {
          setModalInput({ name: "" });
          setModal("newFile");
        }}
        onNewProject={() => {
          setModalInput({ name: "", description: "" });
          setModal("newProject");
        }}
        onRenameFile={(f) => {
          setRenameTarget(f);
          setModalInput({ name: f.filename });
          setModal("rename");
        }}
        onDeleteFile={(f) => {
          setDeleteTarget(f);
          setModal("deleteFile");
        }}
        onSwitchProject={switchProject}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <EditorTabs tabs={tabs} activeFileId={activeFileId} dirtyIds={dirtyIds} onSelect={setActiveFileId} onClose={closeTab} />

        <div className="flex-1 min-h-0">
          {activeFileId ? (
            <CodeEditor
              key={activeFileId}
              value={activeContent}
              onChange={(v) => handleChange(activeFileId, v)}
              onSave={() => saveFile(activeFileId)}
              onRun={runFile}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted text-[13px]">
              Select or create a file to start coding.
            </div>
          )}
        </div>

        <div
          className="h-1 cursor-row-resize shrink-0 hover:bg-accent/40"
          onMouseDown={startResize}
        />
        <OutputPanel
          execution={execution}
          onSendInput={sendInput}
          projectId={project?.id}
          activeFileId={activeFileId}
          height={panelHeight}
        />
      </div>

      {modal === "newProject" && (
        <Modal title="New project" onClose={() => setModal(null)}>
          <FieldModal
            fields={[
              { key: "name", label: "Project name", placeholder: "Python Fundamentals" },
              { key: "description", label: "Description", placeholder: "My Python learning project", textarea: true },
            ]}
            values={modalInput}
            onChange={setModalInput}
            onSubmit={createProject}
            submitLabel="Create project"
          />
        </Modal>
      )}

      {modal === "newFile" && (
        <Modal title="New Python file" onClose={() => setModal(null)}>
          <FieldModal
            fields={[{ key: "name", label: "File name", placeholder: "practice.py" }]}
            values={modalInput}
            onChange={setModalInput}
            onSubmit={createFile}
            submitLabel="Create file"
          />
        </Modal>
      )}

      {modal === "rename" && (
        <Modal title="Rename file" onClose={() => setModal(null)}>
          <FieldModal
            fields={[{ key: "name", label: "File name", placeholder: "main.py" }]}
            values={modalInput}
            onChange={setModalInput}
            onSubmit={renameFile}
            submitLabel="Rename"
          />
        </Modal>
      )}

      {modal === "deleteFile" && (
        <Modal title="Delete file" onClose={() => setModal(null)}>
          <p className="text-[13px] text-text-secondary mb-4">
            Delete <span className="text-text-primary font-medium">{deleteTarget?.filename}</span>? This also
            removes its execution history. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 py-1.5 rounded-md text-[13px] hover:bg-bg-tertiary">
              Cancel
            </button>
            <button
              onClick={confirmDeleteFile}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium"
              style={{ background: "var(--danger)", color: "#181b22" }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FieldModal({ fields, values, onChange, onSubmit, submitLabel }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-[12px] text-text-secondary mb-1">{f.label}</label>
            {f.textarea ? (
              <textarea
                autoFocus={f === fields[0]}
                value={values[f.key] || ""}
                onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={2}
                className="w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus-ring"
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}
              />
            ) : (
              <input
                autoFocus={f === fields[0]}
                value={values[f.key] || ""}
                onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus-ring"
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="submit"
          className="px-3 py-1.5 rounded-md text-[13px] font-medium"
          style={{ background: "var(--accent)", color: "#181b22" }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
