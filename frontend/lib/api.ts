// frontend/lib/api.ts
// All calls to FastAPI backend live here

import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessage(
  messages: Message[],
  userName?: string,
  userAge?: string,
  systemOverride?: string
): Promise<string> {
  const res = await API.post("/api/chat", {
    messages,
    user_name: userName,
    user_age: userAge,
    system_override: systemOverride,
  });
  return res.data.reply;
}

export async function uploadReport(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await API.post("/api/report", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.text;
}
