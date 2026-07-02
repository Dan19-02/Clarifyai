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
