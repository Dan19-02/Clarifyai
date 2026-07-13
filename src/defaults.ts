import type { StudentProfile, ChapterProgress } from "./types";

/** The one and only support contact. Every "reach us" surface uses this. */
export const SUPPORT_EMAIL = "support@clarifyai.in";

// Intentionally empty. Students start with a clean Chapter Mastery list and
// add their own chapters. (No demo/prefilled data.)
export const DEFAULT_CHAPTERS: ChapterProgress[] = [];

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
