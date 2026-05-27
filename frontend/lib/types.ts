// frontend/lib/types.ts

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
}

export interface Chat {
  id: string;
  topic: string;
  messages: Message[];
  updatedAt: string;
}

export type Theme = "light" | "dark" | "medical" | "cream";

export const THEMES: Record<Theme, { label: string; icon: string; bg: string }> = {
  light:   { label: "Light",   icon: "☀️", bg: "#f7f5f2" },
  dark:    { label: "Dark",    icon: "🌙", bg: "#0d1117" },
  medical: { label: "Medical", icon: "🏥", bg: "#f0f4f8" },
  cream:   { label: "Cream",   icon: "🍵", bg: "#fdf8f0" },
};

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function getTopicFromMessages(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  return first.content.slice(0, 40) + (first.content.length > 40 ? "…" : "");
}
