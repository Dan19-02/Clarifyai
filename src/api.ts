/**
 * Tiny API client for the Express backend.
 * Stores the JWT in localStorage and attaches it as a Bearer token.
 * All requests go to /api/* (proxied to the backend by Vite in dev).
 */
import type { StudentProfile, ChapterProgress, ChatMessage, Conversation } from "./types";

const TOKEN_KEY = "clarify_token";
const API_BASE = import.meta.env.VITE_API_URL || "";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface Account {
  id: number;
  email: string;
  profile: StudentProfile;
  chapters: ChapterProgress[];
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  board: string;
  grade: string;
  language: string;
  preferredAnalogy: string;
  examGoals: string;
  confidenceLevel: number;
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // const res = await fetch(`/api${path}`, { ...options, headers });
  const res = await fetch(`${API_BASE}/api${path}`, {
  ...options,
  headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Token rejected → clear it so the app drops back to the login screen.
    if (res.status === 401) setToken(null);
    throw new Error((data as any).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  signup: (body: SignupInput) =>
    request<{ token: string; user: Account }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: Account }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: Account }>("/me"),
  updateMe: (body: StudentProfile & { chapters: ChapterProgress[] }) =>
    request<{ user: Account }>("/me", { method: "PUT", body: JSON.stringify(body) }),

  // Conversations (separate chat windows)
  listConversations: () => request<{ conversations: Conversation[] }>("/conversations"),
  createConversation: (title?: string) =>
    request<{ conversation: Conversation }>("/conversations", { method: "POST", body: JSON.stringify({ title }) }),
  renameConversation: (id: string, title: string) =>
    request(`/conversations/${id}`, { method: "PATCH", body: JSON.stringify({ title }) }),
  deleteConversation: (id: string) => request(`/conversations/${id}`, { method: "DELETE" }),
  getMessages: (conversationId: string) =>
    request<{ messages: ChatMessage[] }>(`/conversations/${conversationId}/messages`),
  addMessage: (
    conversationId: string,
    msg: { id: string; role: string; text: string; mode?: string; sources?: any[]; attachments?: any[] }
  ) => request(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify(msg) }),

  chat: (body: any) => request<{ text: string; sources: any[]; cached?: boolean }>("/chat", { method: "POST", body: JSON.stringify(body) }),

  // Streaming chat (SSE). Calls onDelta with the FULL text so far each time a
  // token arrives. Resolves with the final text/sources, or { fallback: true }
  // when the server signals this request should use the non-streaming /chat.
  chatStream: async (
    body: any,
    onDelta: (fullText: string) => void
  ): Promise<{ text: string; sources: any[]; cached?: boolean; fallback?: boolean }> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) {
      if (res.status === 401) setToken(null);
      throw new Error(`Stream failed (${res.status})`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let sources: any[] = [];
    let cached = false;
    let fallback = false;
    let finished = false;
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n"); // SSE events are separated by a blank line
      buffer = parts.pop() || "";
      for (const part of parts) {
        const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        let evt: any;
        try {
          evt = JSON.parse(dataLine.slice(5).trim());
        } catch {
          continue;
        }
        if (evt.type === "delta") {
          text += evt.text;
          onDelta(text);
        } else if (evt.type === "done") {
          sources = evt.sources || [];
          cached = !!evt.cached;
          finished = true;
        } else if (evt.type === "fallback") {
          fallback = true;
          finished = true;
        } else if (evt.type === "error") {
          throw new Error(evt.error || "stream error");
        }
      }
    }
    return { text, sources, cached, fallback };
  },

  tts: (body: { text: string; voice: string }) => request<{ audio: string }>("/tts", { method: "POST", body: JSON.stringify(body) }),
};
