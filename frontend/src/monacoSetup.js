/**
 * By default @monaco-editor/react fetches the Monaco editor bundle from a
 * public CDN at runtime. For a local-first IDE we instead point it at the
 * monaco-editor package already bundled by Vite, so the editor works
 * reliably without depending on an external CDN being reachable.
 */
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker() {
    // Python only needs the base editor worker (no dedicated language service).
    return new editorWorker();
  },
};

loader.config({ monaco });
