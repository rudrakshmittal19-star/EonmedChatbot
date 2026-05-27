"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import { sendMessage, uploadReport } from "@/lib/api";
import { Message, Chat, Theme, generateId, formatTime, getTopicFromMessages } from "@/lib/types";

const ONBOARD_SYSTEM = `You are MediAssist doing friendly onboarding via chat. Learn user's name and age naturally.
- If they give their name → ask their age warmly
- If they describe symptoms instead → acknowledge in 1 line, then ask for name
- Once you have both, end with: [ONBOARD_COMPLETE:name=<name>,age=<age>]
- If only name so far, end with: [HAVE_NAME:<name>]
- Keep it short and warm. Never ask for anything else.`;

export default function Home() {
  const [theme, setTheme]               = useState<Theme>("light");
  const [sidebarOpen, setSidebar]       = useState(true);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [chatHistory, setChatHistory]   = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [userName, setUserName]         = useState<string | null>(null);
  const [userAge, setUserAge]           = useState<string | null>(null);
  const [onboardStep, setOnboard]       = useState<"name"|"age"|"done">("name");
  const [isLoading, setLoading]         = useState(false);
  const [pendingReport, setPReport]     = useState<string | null>(null);
  const [pendingReportName, setPRName]  = useState<string | null>(null);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  useEffect(() => {
    setMessages([{ id: generateId(), role: "assistant", content: "Hi! 👋 I'm MediAssist, your personal AI health companion.\n\nBefore we begin, what's your name?", ts: formatTime(new Date()) }]);
  }, []);

  const saveChat = useCallback((msgs: Message[]) => {
    if (msgs.length < 2) return;
    const topic = getTopicFromMessages(msgs);
    const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    setChatHistory(prev => {
      if (activeChatId) return prev.map(c => c.id === activeChatId ? { ...c, messages: msgs, topic, updatedAt: now } : c);
      const newId = generateId();
      setActiveChatId(newId);
      return [{ id: newId, topic, messages: msgs, updatedAt: now }, ...prev];
    });
  }, [activeChatId]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: generateId(), role: "user", content: text, ts: formatTime(new Date()) };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    try {
      let reply = "";
      const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m.content }));

      if (pendingReport) {
        apiMsgs[apiMsgs.length - 1].content = `Medical report text:\n\n${pendingReport}\n\nUser instruction: ${text}`;
        setPReport(null);
        setPRName(null);
      }

      if (onboardStep !== "done") {
        reply = await sendMessage(apiMsgs, userName ?? undefined, userAge ?? undefined, ONBOARD_SYSTEM);
        const cm = reply.match(/\[ONBOARD_COMPLETE:name=(.+?),age=(.+?)\]/);
        const nm = reply.match(/\[HAVE_NAME:(.+?)\]/);
        if (cm) {
          setUserName(cm[1].trim());
          setUserAge(cm[2].trim());
          setOnboard("done");
          reply = reply.replace(/\[ONBOARD_COMPLETE:[^\]]+\]/, "").trim();
        } else if (nm) {
          setUserName(nm[1].trim());
          setOnboard("age");
          reply = reply.replace(/\[HAVE_NAME:[^\]]+\]/, "").trim();
        } else if (userName && userAge) {
          // AI forgot to emit tag but we already have both — move on
          setOnboard("done");
        }
      } else {
        reply = await sendMessage(apiMsgs, userName ?? undefined, userAge ?? undefined);
      }

      // Guard against empty reply showing blank bubble
      if (!reply || !reply.trim()) {
        reply = userName
          ? `Thanks ${userName}! What health concern can I help you with today?`
          : "Got it! What health concern can I help you with today?";
      }

      const aiMsg: Message = { id: generateId(), role: "assistant", content: reply, ts: formatTime(new Date()) };
      const final = [...newMsgs, aiMsg];
      setMessages(final);
      saveChat(final);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(p => [...p, { id: generateId(), role: "assistant", content: "Sorry, something went wrong. Please try again.", ts: formatTime(new Date()) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await uploadReport(file);
      setPReport(text);
      setPRName(file.name);
      const uMsg: Message = { id: generateId(), role: "user", content: `📎 Attached: ${file.name}`, ts: formatTime(new Date()) };
      const aMsg: Message = { id: generateId(), role: "assistant", content: `📎 Got your report **${file.name}**!\n\nWhat would you like me to do?\n- Explain all values\n- Check what's abnormal\n- Suggest diet and lifestyle tips\n- Ask me anything`, ts: formatTime(new Date()) };
      if (onboardStep !== "done") setOnboard("done");
      const newMsgs = [...messages, uMsg, aMsg];
      setMessages(newMsgs);
      saveChat(newMsgs);
    } catch (err) {
      console.error("File error:", err);
      setMessages(p => [...p, { id: generateId(), role: "assistant", content: "Could not read the file. Please try again.", ts: formatTime(new Date()) }]);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = (chat: Chat) => {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
    if (onboardStep !== "done") setOnboard("done");
  };

  const deleteChat = (id: string) => {
    setChatHistory(p => p.filter(c => c.id !== id));
    if (activeChatId === id) startNew();
  };

  const startNew = () => {
    setMessages([]);
    setActiveChatId(null);
    setPReport(null);
    setPRName(null);
    const step = userName ? "done" : "name";
    setOnboard(step);
    const greeting = userName
      ? `Hi ${userName}! What would you like to talk about today?`
      : "Hi! 👋 I'm MediAssist, your personal AI health companion.\n\nWhat's your name?";
    setMessages([{ id: generateId(), role: "assistant", content: greeting, ts: formatTime(new Date()) }]);
  };

  const suggestions = ["I have a headache and fever", "Back pain for 3 days", "Nausea after every meal", "Feeling tired and losing hair"];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebar(p => !p)} theme={theme} onThemeChange={setTheme}
        chatHistory={chatHistory} activeChatId={activeChatId} onLoadChat={loadChat} onDeleteChat={deleteChat}
        onNewChat={startNew} userName={userName} userAge={userAge} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px 14px 56px", borderBottom: "1px solid var(--border)", background: "var(--bg)", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 500, color: "var(--text)", margin: 0 }}>MediAssist AI</h1>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: "2px 0 0" }}>
              {pendingReportName ? `📎 ${pendingReportName} ready — tell me what to do` : "Your personal health companion"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text3)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Online
          </div>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} suggestions={messages.length === 1 ? suggestions : []} onSuggestion={handleSend} />
        <ChatInput onSend={handleSend} onFile={handleFile} isLoading={isLoading} pendingReport={pendingReportName} />
      </div>
    </div>
  );
}