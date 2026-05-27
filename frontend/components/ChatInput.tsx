"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Send, Loader2, X } from "lucide-react";

interface Props {
  onSend: (t: string) => void; onFile: (f: File) => void;
  isLoading: boolean; pendingReport: string | null;
}

export default function ChatInput({ onSend, onFile, isLoading, pendingReport }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "22px";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  const submit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim()); setValue("");
    if (taRef.current) taRef.current.style.height = "22px";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const handleFile = (f: File) => {
    if (["image/jpeg","image/jpg","image/png","application/pdf"].includes(f.type)) onFile(f);
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "12px 24px 16px", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Pending report badge */}
        <AnimatePresence>
          {pendingReport && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 8, padding: "7px 12px", borderRadius: 8, background: "var(--accent-soft)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📎 {pendingReport}</span>
              <span style={{ color: "var(--text3)" }}>— tell me what to do with it</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input box */}
        <div style={{
          borderRadius: 16, background: "var(--surface)",
          border: `1.5px solid ${focused ? "var(--accent)" : "var(--border)"}`,
          boxShadow: focused ? "0 0 0 3px var(--accent-soft)" : "0 2px 8px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}>
          {/* Textarea */}
          <div style={{ padding: "12px 16px 8px" }}>
            <textarea
              ref={taRef}
              value={value}
              onChange={e => { setValue(e.target.value); resize(); }}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={isLoading}
              placeholder={pendingReport ? "Tell me what to do with the report…" : "Ask me about your health…"}
              rows={1}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                background: "transparent", color: "var(--text)", fontSize: 14,
                lineHeight: 1.6, fontFamily: "inherit", minHeight: 22, maxHeight: 140,
              }}
            />
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 10px 12px", borderTop: `1px solid var(--border)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => fileRef.current?.click()} disabled={isLoading} title="Attach medical report"
                style={{ padding: "6px", borderRadius: 8, border: "none", background: "none", color: "var(--text3)", cursor: "pointer", display: "flex", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"}>
                <Paperclip size={16} />
              </button>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <span style={{ fontSize: 12, color: "var(--text3)" }}>Attach report</span>
            </div>

            <button onClick={submit} disabled={!canSend}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                borderRadius: 10, border: "none", cursor: canSend ? "pointer" : "default",
                background: canSend ? "var(--accent)" : "var(--border)",
                color: canSend ? "white" : "var(--text3)",
                fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                transition: "background 0.15s",
              }}>
              {isLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
              {isLoading ? "Thinking…" : "Send"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 8 }}>
          Shift+Enter for new line • Emergency: 112
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
