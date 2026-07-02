/**
 * The half-caught classroom phrases that drift through the night hero and
 * come back, caught, in the finale. Real syllabus terms a student actually
 * hears fly past in an Indian classroom.
 */
export interface DriftWord {
  text: string;
  /** CSS position within the hero, percentages. */
  top: string;
  left: string;
  /** Visual weight: 0 = faintest/farthest, 1 = boldest/nearest. */
  depth: number;
  /** Animation shape (CSS vars consumed by .landing-drift). */
  dur: string;
  delay: string;
  dx: string;
  dy: string;
  rot: string;
  /** Hidden on small screens to keep the phone hero quiet. */
  desktopOnly?: boolean;
}

/**
 * Faint school-blackboard phrases that drift behind the ivory story sections,
 * so the long scroll feels like a classroom, not an empty page. Kept low-opacity
 * and pushed toward the margins so they never sit under body text. Formulas use
 * ASCII math only (no em/en dashes, per the app-wide rule).
 */
export interface AmbientWord {
  text: string;
  top: string;
  left: string;
  size: string;
  opacity: number;
  dur: string;
  delay: string;
  dx: string;
  dy: string;
  rot: string;
  desktopOnly?: boolean;
}

// Three scatter sets so adjacent sections never show the same words. Each hugs
// the edges and corners, leaving the reading column clear.
export const AMBIENT_SETS: AmbientWord[][] = [
  [
    { text: "F = ma", top: "8%", left: "4%", size: "1.5rem", opacity: 0.12, dur: "21s", delay: "0s", dx: "16px", dy: "-12px", rot: "-3deg" },
    { text: "sin²θ + cos²θ = 1", top: "20%", left: "80%", size: "1.1rem", opacity: 0.10, dur: "25s", delay: "-7s", dx: "-14px", dy: "14px", rot: "2deg", desktopOnly: true },
    { text: "photosynthesis", top: "52%", left: "2%", size: "1.25rem", opacity: 0.12, dur: "23s", delay: "-4s", dx: "14px", dy: "16px", rot: "1deg", desktopOnly: true },
    { text: "V = IR", top: "74%", left: "86%", size: "1.6rem", opacity: 0.12, dur: "19s", delay: "-11s", dx: "-18px", dy: "-12px", rot: "-2deg" },
    { text: "Le Chatelier's principle", top: "88%", left: "8%", size: "1rem", opacity: 0.10, dur: "27s", delay: "-3s", dx: "12px", dy: "-14px", rot: "1.5deg", desktopOnly: true },
    { text: "dy/dx", top: "40%", left: "92%", size: "1.4rem", opacity: 0.12, dur: "20s", delay: "-9s", dx: "-12px", dy: "12px", rot: "-1deg", desktopOnly: true },
  ],
  [
    { text: "PV = nRT", top: "10%", left: "84%", size: "1.5rem", opacity: 0.12, dur: "22s", delay: "-2s", dx: "-16px", dy: "14px", rot: "2deg" },
    { text: "the water cycle", top: "26%", left: "3%", size: "1.15rem", opacity: 0.10, dur: "26s", delay: "-8s", dx: "16px", dy: "-12px", rot: "-1.5deg", desktopOnly: true },
    { text: "b² - 4ac", top: "58%", left: "90%", size: "1.5rem", opacity: 0.12, dur: "18s", delay: "-5s", dx: "-14px", dy: "-16px", rot: "-2deg" },
    { text: "mitochondria", top: "70%", left: "5%", size: "1.2rem", opacity: 0.12, dur: "24s", delay: "-12s", dx: "14px", dy: "12px", rot: "1deg", desktopOnly: true },
    { text: "electronegativity", top: "44%", left: "1%", size: "1.05rem", opacity: 0.10, dur: "28s", delay: "-6s", dx: "12px", dy: "-10px", rot: "0.5deg", desktopOnly: true },
    { text: "v = u + at", top: "90%", left: "70%", size: "1.35rem", opacity: 0.12, dur: "21s", delay: "-10s", dx: "-16px", dy: "12px", rot: "-1deg", desktopOnly: true },
  ],
  [
    { text: "E = mc²", top: "9%", left: "6%", size: "1.6rem", opacity: 0.12, dur: "20s", delay: "-3s", dx: "16px", dy: "-14px", rot: "-2deg" },
    { text: "∫ sec²x dx", top: "22%", left: "82%", size: "1.3rem", opacity: 0.12, dur: "24s", delay: "-9s", dx: "-14px", dy: "12px", rot: "1.5deg", desktopOnly: true },
    { text: "Mendel's F₂ ratio", top: "56%", left: "3%", size: "1.1rem", opacity: 0.10, dur: "27s", delay: "-5s", dx: "14px", dy: "14px", rot: "1deg", desktopOnly: true },
    { text: "pH = -log[H⁺]", top: "72%", left: "84%", size: "1.4rem", opacity: 0.12, dur: "19s", delay: "-12s", dx: "-16px", dy: "-12px", rot: "-1.5deg" },
    { text: "Pythagoras theorem", top: "40%", left: "90%", size: "1rem", opacity: 0.10, dur: "26s", delay: "-7s", dx: "-12px", dy: "10px", rot: "0.5deg", desktopOnly: true },
    { text: "6.022 × 10²³", top: "88%", left: "10%", size: "1.35rem", opacity: 0.12, dur: "22s", delay: "-2s", dx: "12px", dy: "-12px", rot: "2deg", desktopOnly: true },
  ],
  [
    { text: "λ = h/p", top: "9%", left: "5%", size: "1.5rem", opacity: 0.12, dur: "21s", delay: "-4s", dx: "16px", dy: "-12px", rot: "-2deg" },
    { text: "the periodic table", top: "24%", left: "82%", size: "1.1rem", opacity: 0.10, dur: "25s", delay: "-8s", dx: "-14px", dy: "12px", rot: "1.5deg", desktopOnly: true },
    { text: "a² + b² = c²", top: "70%", left: "88%", size: "1.55rem", opacity: 0.12, dur: "18s", delay: "-6s", dx: "-16px", dy: "-14px", rot: "-1.5deg" },
    { text: "osmosis", top: "54%", left: "3%", size: "1.25rem", opacity: 0.12, dur: "24s", delay: "-11s", dx: "14px", dy: "14px", rot: "1deg", desktopOnly: true },
    { text: "moment of inertia", top: "42%", left: "1%", size: "1rem", opacity: 0.10, dur: "28s", delay: "-3s", dx: "12px", dy: "-10px", rot: "0.5deg", desktopOnly: true },
    { text: "Newton's laws", top: "88%", left: "72%", size: "1.3rem", opacity: 0.10, dur: "22s", delay: "-9s", dx: "-14px", dy: "12px", rot: "2deg", desktopOnly: true },
  ],
];

export const DRIFT_WORDS: DriftWord[] = [
  { text: "rate of change of momentum", top: "16%", left: "6%", depth: 0.8, dur: "19s", delay: "0s", dx: "18px", dy: "-14px", rot: "-2deg" },
  { text: "sin²θ + cos²θ = 1", top: "24%", left: "72%", depth: 0.55, dur: "23s", delay: "-6s", dx: "-16px", dy: "12px", rot: "1.5deg", desktopOnly: true },
  { text: "electronegativity", top: "64%", left: "78%", depth: 0.7, dur: "21s", delay: "-11s", dx: "-20px", dy: "-10px", rot: "-1deg" },
  { text: "Le Chatelier's principle", top: "76%", left: "10%", depth: 0.5, dur: "24s", delay: "-3s", dx: "14px", dy: "10px", rot: "2deg", desktopOnly: true },
  { text: "mitochondria", top: "38%", left: "86%", depth: 0.4, dur: "26s", delay: "-9s", dx: "-12px", dy: "16px", rot: "0deg", desktopOnly: true },
  { text: "projectile motion", top: "58%", left: "3%", depth: 0.6, dur: "22s", delay: "-14s", dx: "16px", dy: "-12px", rot: "1deg", desktopOnly: true },
  { text: "∫ sec²x dx", top: "84%", left: "62%", depth: 0.65, dur: "20s", delay: "-7s", dx: "-14px", dy: "-16px", rot: "-1.5deg" },
  { text: "valency of carbon", top: "10%", left: "44%", depth: 0.35, dur: "27s", delay: "-17s", dx: "10px", dy: "14px", rot: "0.5deg", desktopOnly: true },
  { text: "F = dp/dt", top: "44%", left: "12%", depth: 0.9, dur: "18s", delay: "-4s", dx: "20px", dy: "-18px", rot: "-2.5deg", desktopOnly: true },
  { text: "Mendel's F₂ ratio", top: "88%", left: "30%", depth: 0.45, dur: "25s", delay: "-12s", dx: "-10px", dy: "-12px", rot: "1deg", desktopOnly: true },
];
