export type StudyMode = "standard" | "thinking" | "search";

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  mode?: StudyMode;
  sources?: GroundingSource[];
  audioBase64?: string; // Cache generated TTS audio
  isPlayingAudio?: boolean;
}

export interface ChapterProgress {
  id: string;
  name: string;
  mastery: "weak" | "developing" | "strong";
  confidenceScore: number; // 0 to 100
  lastStudied: string;
}

export interface StudentProfile {
  name: string;
  board: string; // CBSE, ICSE, State Boards, JEE, NEET, None
  grade: string; // 1st - 12th, College, Competitive
  language: string; // English, Hinglish, Hindi
  preferredAnalogy: string; // Daily Life, Sports, Cooking, Bicycles & Trains, Mobile Phones & Tech, Games
  weakChapters?: string[];
  strongChapters?: string[];
  confidenceLevel: number; // 1 - 5 stars
  examGoals: string;
}
