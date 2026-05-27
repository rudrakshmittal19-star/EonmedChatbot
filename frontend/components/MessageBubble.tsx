"use client";
import { Message } from "@/lib/types";

function formatAI(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/(🌿[^\n<]+)/g, '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);padding:12px 0 5px;border-bottom:1px solid var(--border);margin-bottom:7px">$1</div>');
  text = text.replace(/(🏠[^\n<]+)/g, '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);padding:12px 0 5px;border-bottom:1px solid var(--border);margin-bottom:7px">$1</div>');
  text = text.replace(/(⚠️[^\n<]+)/g, '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);padding:12px 0 5px;border-bottom:1px solid var(--border);margin-bottom:7px">$1</div>');
  text = text.replace(/(👨‍⚕️[^\n<]+)/g, '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);padding:12px 0 5px;border-bottom:1px solid var(--border);margin-bottom:7px">$1</div>');
  text = text.replace(/^[-•*]\s+(.+)/gm, '<div style="padding:3px 0 3px 16px;position:relative;font-size:13.5px;color:var(--text);line-height:1.6">• $1</div>');
  text = text.replace(/→\s*(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:white;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;margin-top:10px">🔗 Book on EonMed</a>');
  return text.replace(/\n/g, "<br/>");
}

export default function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === "assistant";

  if (isAI) return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>M</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
        <div style={{ padding: "13px 16px", borderRadius: "16px 16px 16px 4px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, lineHeight: 1.7, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }} dangerouslySetInnerHTML={{ __html: formatAI(message.content) }} />
        <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, paddingLeft: 2 }}>{message.ts}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: "72%" }}>
        <div style={{ padding: "12px 16px", borderRadius: "16px 16px 4px 16px", background: "var(--user-bg)", color: "var(--user-text)", fontSize: 14, lineHeight: 1.65 }}>{message.content}</div>
        <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, paddingRight: 2 }}>{message.ts}</span>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--user-bg)", color: "var(--user-text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>Y</div>
    </div>
  );
}
