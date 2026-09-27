const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => request("/health"),
  pythonInfo: () => request("/system/python"),

  listProjects: () => request("/projects"),
  createProject: (data) => request("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),

  listFiles: (projectId) => request(`/projects/${projectId}/files`),
  createFile: (projectId, data) =>
    request(`/projects/${projectId}/files`, { method: "POST", body: JSON.stringify(data) }),
  getFile: (fileId) => request(`/files/${fileId}`),
  updateFile: (fileId, data) => request(`/files/${fileId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFile: (fileId) => request(`/files/${fileId}`, { method: "DELETE" }),

  run: (fileId, code) => request("/run", { method: "POST", body: JSON.stringify({ file_id: fileId, code }) }),
  poll: (executionId) => request(`/executions/${executionId}/poll`),
  sendInput: (executionId, value) =>
    request(`/executions/${executionId}/input`, { method: "POST", body: JSON.stringify({ value }) }),
  stop: (executionId) => request(`/executions/${executionId}/stop`, { method: "POST" }),

  listExecutions: (projectId, limit = 50) =>
    request(`/executions?${projectId ? `project_id=${projectId}&` : ""}limit=${limit}`),
  deleteExecution: (id) => request(`/executions/${id}`, { method: "DELETE" }),

  getSettings: () => request("/settings"),
  updateSettings: (settings) => request("/settings", { method: "PUT", body: JSON.stringify({ settings }) }),
};
