import type { StudentProfile, ChapterProgress, ChatMessage } from "./types";

export const DEFAULT_CHAPTERS: ChapterProgress[] = [
  { id: "ch-1", name: "Photosynthesis & Light Reactions", mastery: "developing", confidenceScore: 65, lastStudied: "2026-06-26" },
  { id: "ch-2", name: "Newton's Second Law of Motion", mastery: "weak", confidenceScore: 35, lastStudied: "2026-06-25" },
  { id: "ch-3", name: "Quadratic Equations & Roots", mastery: "strong", confidenceScore: 90, lastStudied: "2026-06-24" },
  { id: "ch-4", name: "Chemical Bonding & Valency", mastery: "developing", confidenceScore: 50, lastStudied: "2026-06-23" },
];

export function makeDefaultProfile(name = "Student"): StudentProfile {
  return {
    name,
    board: "CBSE",
    grade: "11th Grade",
    language: "Hinglish",
    preferredAnalogy: "Daily Life",
    confidenceLevel: 3,
    examGoals: "Crack board exams and build deep conceptual clarity!",
  };
}

export function makeWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "model",
    text:
      "🌟 Hello there! I am Clarify.AI, your warm personal teacher and learning companion.\n\nI believe that every student has their own unique pace and style of learning. No matter how many questions you have or how complex a topic seems, we will explore it together step-by-step until you feel: \"I finally understand this.\"\n\nTell me, what concept would you like to master today? Or would you like to pick one of the chapters from your Study Log?",
    timestamp: new Date().toLocaleTimeString(),
    mode: "standard",
  };
}
