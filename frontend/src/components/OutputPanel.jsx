import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { api } from "../services/api";

function parseProblem(errorText) {
  if (!errorText) return null;
  const lines = errorText.trim().split("\n");
  const last = lines[lines.length - 1] || "";
  const match = last.match(/^(\w+(?:Error|Exception|Warning)?):\s*(.*)$/);
  const fileLineMatch = errorText.match(/File "([^"]+)", line (\d+)/g);
  const lastLocation = fileLineMatch ? fileLineMatch[fileLineMatch.length - 1] : null;
  let file = null, line = null;
  if (lastLocation) {
    const m = lastLocation.match(/File "([^"]+)", line (\d+)/);
    if (m) {
      file = m[1].split("/").pop();
      line = m[2];
    }
  }
  return {
    type: match ? match[1] : "Error",
    message: match ? match[2] : last,
    file,
    line,
  };
}

const TABS = ["Output", "Terminal", "Problems", "History"];

export default function OutputPanel({
  execution, onSendInput, projectId, activeFileId, onOpenExecutionInEditor, height, onResize,
}) {
  const [tab, setTab] = useState("Output");
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const outputEndRef = useRef(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ block: "end" });
  }, [execution?.output, execution?.error]);

  const loadHistory = async () => {
    const rows = await api.listExecutions(projectId, 50);
    setHistory(rows);
  };

  useEffect(() => {
    if (tab === "History") loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, execution?.status]);

  const problem = execution?.status === "error" ? parseProblem(execution.error) : null;

  const submitInput = () => {
    onSendInput(inputValue);
    setInputValue("");
  };

  return (
    <div
      className="flex flex-col border-t shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", height }}
    >
      <div
        className="flex items-center justify-between border-b px-2 shrink-0"
        style={{ borderColor: "var(--border-color)" }}
        onMouseDown={(e) => onResize?.(e)}
      >
        <div className="flex items-center">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-2 text-[12px] font-medium tracking-wide relative"
              style={{ color: tab === t ? "var(--text-primary)" : "var(--text-secondary)" }}
            >
              {t.toUpperCase()}
              {t === "Problems" && problem && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--danger)" }} />
              )}
              {tab === t && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-[2px]"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          ))}
        </div>
        {execution && (
          <div className="flex items-center gap-2 text-[11.5px] text-text-secondary pr-2">
            {execution.status === "running" && <Loader2 size={12} className="animate-spin" />}
            {execution.status === "success" && <CheckCircle2 size={12} style={{ color: "var(--success)" }} />}
            {(execution.status === "error" || execution.status === "timeout") && (
              <XCircle size={12} style={{ color: "var(--danger)" }} />
            )}
            <span>
              {execution.status === "running" ? "Running…" : `${execution.execution_time?.toFixed(3)}s`}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed">
        {tab === "Output" && (
          <div className="p-3">
            {!execution && (
              <p className="text-text-muted italic">Run a file to see output here.</p>
            )}
            {execution && (
              <>
                <pre className="whitespace-pre-wrap break-words" style={{ color: "var(--text-primary)" }}>
                  {execution.output}
                </pre>
                {execution.error && (
                  <pre className="whitespace-pre-wrap break-words mt-1" style={{ color: "var(--danger)" }}>
                    {execution.error}
                  </pre>
                )}
                {execution.status === "success" && (
                  <p className="mt-2" style={{ color: "var(--success)" }}>✓ Program finished successfully</p>
                )}
                {execution.status === "error" && (
                  <p className="mt-2" style={{ color: "var(--danger)" }}>✕ Program terminated with an error</p>
                )}
                {execution.status === "timeout" && (
                  <p className="mt-2" style={{ color: "var(--warn)" }}>⏱ Execution timed out</p>
                )}
                {execution.status === "stopped" && (
                  <p className="mt-2" style={{ color: "var(--text-secondary)" }}>■ Execution stopped by user</p>
                )}
                {execution.waiting_for_input && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-text-muted">›</span>
                    <input
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitInput()}
                      className="flex-1 bg-transparent border-b outline-none py-0.5"
                      style={{ borderColor: "var(--accent)", color: "var(--text-primary)" }}
                      placeholder="Type input and press Enter…"
                    />
                    <button
                      onClick={submitInput}
                      className="px-2 py-0.5 rounded text-[11.5px] font-sans"
                      style={{ background: "var(--accent)", color: "#181b22" }}
                    >
                      Submit
                    </button>
                  </div>
                )}
                <div ref={outputEndRef} />
              </>
            )}
          </div>
        )}

        {tab === "Terminal" && (
          <div className="p-3 text-text-secondary">
            <p className="text-text-muted italic">
              A dedicated shell terminal isn&apos;t available in this build — use the Output tab to run files.
              Execution runs as an isolated subprocess of the configured Python interpreter.
            </p>
          </div>
        )}

        {tab === "Problems" && (
          <div className="p-3">
            {!problem ? (
              <p className="text-text-muted italic">No problems detected in the last run.</p>
            ) : (
              <div className="flex items-start gap-2">
                <XCircle size={14} style={{ color: "var(--danger)", marginTop: 2 }} />
                <div>
                  <p style={{ color: "var(--danger)" }}>
                    {problem.type}: {problem.message}
                  </p>
                  {problem.file && (
                    <p className="text-text-muted text-[12px] mt-0.5">
                      {problem.file}{problem.line ? `, line ${problem.line}` : ""}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "History" && (
          <div className="font-sans">
            {history.length === 0 && (
              <p className="p-3 text-text-muted italic">No executions yet.</p>
            )}
            <ul>
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => setSelectedHistory(selectedHistory?.id === h.id ? null : h)}
                    className="flex items-center gap-3 w-full px-3 py-2 border-b text-left hover:bg-bg-tertiary"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    {h.status === "success" && <CheckCircle2 size={14} style={{ color: "var(--success)" }} />}
                    {(h.status === "error" || h.status === "timeout") && (
                      <XCircle size={14} style={{ color: "var(--danger)" }} />
                    )}
                    {h.status === "stopped" && <Clock size={14} className="text-text-muted" />}
                    <span className="text-[13px]">{h.filename}</span>
                    <span className="text-[12px] text-text-muted ml-auto">
                      {h.execution_time?.toFixed(2)}s · {new Date(h.created_at).toLocaleString()}
                    </span>
                  </button>
                  {selectedHistory?.id === h.id && (
                    <div className="px-4 py-3 text-[12.5px]" style={{ background: "var(--bg-primary)" }}>
                      <p className="text-text-muted mb-1">Code:</p>
                      <pre className="whitespace-pre-wrap mb-2" style={{ color: "var(--text-secondary)" }}>{h.code}</pre>
                      {h.output && (
                        <>
                          <p className="text-text-muted mb-1">Output:</p>
                          <pre className="whitespace-pre-wrap mb-2">{h.output}</pre>
                        </>
                      )}
                      {h.error && (
                        <>
                          <p className="text-text-muted mb-1">Error:</p>
                          <pre className="whitespace-pre-wrap" style={{ color: "var(--danger)" }}>{h.error}</pre>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
