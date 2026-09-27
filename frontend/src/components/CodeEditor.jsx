import Editor from "@monaco-editor/react";
import { useApp } from "../context/AppContext";

export default function CodeEditor({ value, onChange, onSave, onRun }) {
  const { theme, settings } = useApp();
  const fontSize = Number(settings?.["editor.fontSize"] ?? 14);
  const tabSize = Number(settings?.["editor.tabSize"] ?? 4);
  const wordWrap = settings?.["editor.wordWrap"] === "on" ? "on" : "off";
  const minimap = settings?.["editor.minimap"] !== "false";

  return (
    <Editor
      language="python"
      theme={theme === "dark" ? "rtb-dark" : "rtb-light"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("rtb-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#181b22",
            "editor.lineHighlightBackground": "#21252e",
            "editorLineNumber.foreground": "#4a505c",
            "editorLineNumber.activeForeground": "#9aa0ac",
            "editorGutter.background": "#181b22",
            "editorCursor.foreground": "#d6a24d",
            "editor.selectionBackground": "#2a2e3860",
          },
        });
        monaco.editor.defineTheme("rtb-light", {
          base: "vs",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#ffffff",
            "editor.lineHighlightBackground": "#f0f1f3",
          },
        });
      }}
      onMount={(editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => onSave?.());
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRun?.());
      }}
      options={{
        fontSize,
        tabSize,
        wordWrap,
        minimap: { enabled: minimap },
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontLigatures: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        renderLineHighlight: "all",
        padding: { top: 12 },
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
