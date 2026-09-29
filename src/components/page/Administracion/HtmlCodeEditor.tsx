"use client";

import Editor, { type OnMount } from "@monaco-editor/react";

export default function HtmlCodeEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const handleMount: OnMount = (_editor, monaco) => {
    monaco.editor.defineTheme("quality-blue", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7890A6" },
        { token: "string", foreground: "A9C9B0" },
        { token: "tag", foreground: "8DBBE0" },
        { token: "attribute.name", foreground: "D4B88A" },
        { token: "delimiter", foreground: "9DB1C3" },
      ],
      colors: {
        "editor.background": "#090B0F",
        "editor.foreground": "#C5CBD3",
        "editorLineNumber.foreground": "#59616D",
        "editorLineNumber.activeForeground": "#AEB7C2",
        "editor.lineHighlightBackground": "#12171E",
        "editor.selectionBackground": "#29333F",
        "editorCursor.foreground": "#B7C4D1",
        "editorIndentGuide.background": "#1A2028",
      },
    });
    monaco.editor.setTheme("quality-blue");
  };

  return <div className="mt-1 overflow-hidden rounded-md border border-[#252b33] bg-[#090b0f] shadow-inner"><Editor height="520px" defaultLanguage="html" theme="quality-blue" onMount={handleMount} value={value} onChange={(nextValue) => onChange(nextValue ?? "")} options={{ automaticLayout: true, readOnly: false, domReadOnly: false, contextmenu: true, minimap: { enabled: true }, fontSize: 12, lineNumbers: "on", wordWrap: "on", tabSize: 2, padding: { top: 12, bottom: 12 }, scrollBeyondLastLine: false, suggestOnTriggerCharacters: true }}/></div>;
}
