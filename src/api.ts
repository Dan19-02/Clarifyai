/**
 * Tiny API client for the Express backend.
 * Stores the JWT in localStorage and attaches it as a Bearer token.
 * All requests go to /api/* (proxied to the backend by Vite in dev).
 */
import type { StudentProfile, ChapterProgress, ChatMessage } from "./types";

const TOKEN_KEY = "clarify_token";

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

  const res = await fetch(`/api${path}`, { ...options, headers });
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
  getMessages: () => request<{ messages: ChatMessage[] }>("/messages"),
  addMessage: (msg: { id: string; role: string; text: string; mode?: string; sources?: any[] }) =>
    request("/messages", { method: "POST", body: JSON.stringify(msg) }),
  chat: (body: any) => request<{ text: string; sources: any[]; cached?: boolean }>("/chat", { method: "POST", body: JSON.stringify(body) }),
  tts: (body: { text: string; voice: string }) => request<{ audio: string }>("/tts", { method: "POST", body: JSON.stringify(body) }),
  generateImage: (body: { prompt: string; size: string }) =>
    request<{ imageUrl: string }>("/generate-image", { method: "POST", body: JSON.stringify(body) }),
};
