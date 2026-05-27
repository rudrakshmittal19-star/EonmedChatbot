"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[]; isLoading: boolean;
  suggestions: string[]; onSuggestion: (s: string) => void;
}

export default function ChatWindow({ messages, isLoading, suggestions, onSuggestion }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 32px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 8, fontFamily: "'Lora', serif" }}>How can I help today?</h2>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>Describe your symptoms or upload a medical report</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>M</div>
              <div style={{ padding: "13px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text3)" }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggestions</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => onSuggestion(s)} style={{ padding: "7px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer", background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text2)", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
