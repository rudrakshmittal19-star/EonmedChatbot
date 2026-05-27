"use client";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Plus, Trash2, MessageCircle } from "lucide-react";
import { Chat, Theme, THEMES } from "@/lib/types";

interface Props {
  open: boolean; onToggle: () => void; theme: Theme; onThemeChange: (t: Theme) => void;
  chatHistory: Chat[]; activeChatId: string | null;
  onLoadChat: (c: Chat) => void; onDeleteChat: (id: string) => void; onNewChat: () => void;
  userName: string | null; userAge: string | null;
}

export default function Sidebar({ open, onToggle, theme, onThemeChange, chatHistory, activeChatId, onLoadChat, onDeleteChat, onNewChat, userName, userAge }: Props) {
  const sb: React.CSSProperties = {
    width: 260, height: "100vh", background: "var(--sb)",
    borderRight: "1px solid var(--border)", display: "flex",
    flexDirection: "column", flexShrink: 0, overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexShrink: 0, position: "relative" }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          position: "absolute", top: 16, left: open ? 220 : 12, zIndex: 100,
          padding: "6px", borderRadius: 8, cursor: "pointer",
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text2)", display: "flex", alignItems: "center",
          justifyContent: "center", transition: "left 0.25s ease",
        }}
      >
        {open ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={sb}>
              {/* Brand */}
              <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🩺</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", fontFamily: "'Lora', serif" }}>MediAssist</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
                      {userName ? `${userName}${userAge ? ` · ${userAge}y` : ""}` : "AI Health Companion"}
                    </div>
                  </div>
                </div>
              </div>

              {/* New chat */}
              <div style={{ padding: "12px 12px 8px" }}>
                <button onClick={onNewChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "var(--accent-soft)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  <Plus size={14} /> New chat
                </button>
              </div>

              {/* Chat history */}
              <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
                {chatHistory.length === 0 ? (
                  <div style={{ padding: "12px 8px", fontSize: 12, color: "var(--text3)" }}>No chats yet</div>
                ) : (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", padding: "8px 8px 4px" }}>Conversations</div>
                    {chatHistory.map((chat) => {
                      const isActive = chat.id === activeChatId;
                      return (
                        <div key={chat.id} onClick={() => onLoadChat(chat)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 7, marginBottom: 2, cursor: "pointer", background: isActive ? "var(--accent-soft)" : "transparent", border: `1px solid ${isActive ? "var(--accent)" : "transparent"}` }}
                          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "var(--surface)"; }}
                          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                        >
                          <MessageCircle size={12} style={{ color: isActive ? "var(--accent)" : "var(--text3)", flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: isActive ? "var(--accent)" : "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.topic}</span>
                          <button onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }} style={{ padding: 2, borderRadius: 4, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", opacity: 0.6, flexShrink: 0 }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Theme switcher */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 8 }}>Theme</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                  {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, val]) => (
                    <button key={key} onClick={() => onThemeChange(key)} title={val.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 4px", borderRadius: 8, fontSize: 10, cursor: "pointer", background: theme === key ? "var(--accent-soft)" : "var(--surface)", border: `1.5px solid ${theme === key ? "var(--accent)" : "var(--border)"}`, color: theme === key ? "var(--accent)" : "var(--text2)" }}>
                      <span style={{ fontSize: 14 }}>{val.icon}</span>
                      <span>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "10px 16px 14px", fontSize: 11, color: "var(--text3)", borderTop: "1px solid var(--border)" }}>
                Powered by Gemini · EonMed connect<br />
                <span style={{ color: "#ef4444" }}>🚨 Emergency: 112</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
