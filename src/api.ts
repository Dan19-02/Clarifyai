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

export type ChatStreamResult =
  | { kind: "done"; text: string; sources: any[]; verification?: "passed" | "unavailable" }
  | { kind: "fallback"; reason: string };

/**
 * Streaming chat (SSE over fetch, POST /chat/stream). onDelta receives each
 * incremental chunk; onChecking fires when the Deep-check examiner starts on
 * the completed draft. Resolves with the authoritative final answer ("done",
 * whose text REPLACES the streamed draft) or a "fallback" instruction to use
 * the plain /chat endpoint. Throws on network or server errors.
 */
async function chatStream(
  body: any,
  onDelta: (chunk: string) => void,
  onChecking: () => void
): Promise<ChatStreamResult> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/chat/stream`, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 401) setToken(null);
  if (!res.ok || !res.body) throw new Error(`Stream request failed (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const frames = buf.split("\n\n");
    buf = frames.pop() || "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      let msg: any;
      try {
        msg = JSON.parse(line.slice(5).trim());
      } catch {
        continue;
      }
      if (msg.type === "delta" && typeof msg.text === "string") onDelta(msg.text);
      else if (msg.type === "checking") onChecking();
      else if (msg.type === "done") return { kind: "done", text: msg.text, sources: msg.sources || [], verification: msg.verification };
      else if (msg.type === "fallback") return { kind: "fallback", reason: msg.reason || "" };
      else if (msg.type === "error") throw new Error(msg.error || "Stream error");
    }
  }
  throw new Error("The stream ended before the answer was complete.");
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

  chat: (body: any) =>
    request<{ text: string; sources: any[]; cached?: boolean; verification?: "passed" | "unavailable" }>("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  chatStream,
  /** On-demand Deep-check of an existing answer (examiner pass). */
  deepCheck: (body: { question: string; text: string }) =>
    request<{ text: string; verification: "passed" | "unavailable" }>("/chat/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  tts: (body: { text: string; voice: string }) => request<{ audio: string }>("/tts", { method: "POST", body: JSON.stringify(body) }),
};
