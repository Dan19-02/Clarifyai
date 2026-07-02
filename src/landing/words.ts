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
 * Static scattered school phrases behind the story sections, in the same
 * spirit as the hero: no movement, just calm words in the empty space. Placed
 * so they never overlap the reading content. Formulas use ASCII math only (no
 * em/en dashes, per the app-wide rule).
 *
 * `show` is a visibility floor so a word only appears when there is room for
 * it: undefined = always; "lg" = tablets and up; "2xl" = only very wide
 * screens (used for side-edge words, which need generous margins to clear the
 * centered content column at every width).
 */
export interface ScatterWord {
  text: string;
  /** Use `top` OR `bottom`. Padding-band words use a small px offset (e.g.
   *  "28px") so they stay in the section's empty padding at any height. */
  top?: string;
  bottom?: string;
  left: string;
  size: string;
  opacity: number;
  rot: string;
  show?: "lg" | "2xl";
}

// Dark story sections (the classroom beats): short centered text with a large
// empty canvas, so words scatter freely at the sides and in the vertical gaps
// between beats, hero-style. Chalk on night.
export const DARK_SCATTER: ScatterWord[] = [
  { text: "F = dp/dt", top: "7%", left: "6%", size: "1.6rem", opacity: 0.2, rot: "-3deg" },
  { text: "electronegativity", top: "9%", left: "79%", size: "1.1rem", opacity: 0.16, rot: "2deg", show: "lg" },
  { text: "projectile motion", top: "25%", left: "9%", size: "1.3rem", opacity: 0.18, rot: "-1deg", show: "lg" },
  { text: "sin²θ + cos²θ = 1", top: "30%", left: "70%", size: "1.35rem", opacity: 0.18, rot: "1deg" },
  { text: "mitochondria", top: "42%", left: "5%", size: "1.15rem", opacity: 0.16, rot: "1.5deg", show: "lg" },
  { text: "∫ sec²x dx", top: "47%", left: "86%", size: "1.5rem", opacity: 0.2, rot: "-2deg" },
  { text: "Le Chatelier's principle", top: "58%", left: "7%", size: "1.05rem", opacity: 0.15, rot: "1deg", show: "lg" },
  { text: "V = IR", top: "63%", left: "81%", size: "1.7rem", opacity: 0.2, rot: "-1.5deg" },
  { text: "Mendel's F₂ ratio", top: "76%", left: "6%", size: "1.15rem", opacity: 0.16, rot: "2deg", show: "lg" },
  { text: "valency of carbon", top: "82%", left: "80%", size: "1.15rem", opacity: 0.15, rot: "-1deg", show: "lg" },
  { text: "b² - 4ac", top: "91%", left: "16%", size: "1.5rem", opacity: 0.18, rot: "1deg" },
];

// Light content sections: content lives in the middle, so words sit in the top
// and bottom padding bands (safe at every width) plus the far side margins on
// very wide screens only. Charcoal on ivory, kept clear of all reading text.
export const LIGHT_SCATTER: ScatterWord[] = [
  // top band: fixed px keeps them inside the empty top padding above the heading.
  { text: "electronegativity", top: "26px", left: "5%", size: "1.15rem", opacity: 0.18, rot: "-2deg" },
  { text: "the water cycle", top: "32px", left: "40%", size: "1.05rem", opacity: 0.16, rot: "1.5deg", show: "lg" },
  { text: "Le Chatelier's principle", top: "24px", left: "67%", size: "1.05rem", opacity: 0.17, rot: "-1deg" },
  // bottom band: fixed px keeps them inside the empty bottom padding below content.
  { text: "Pythagoras theorem", bottom: "30px", left: "8%", size: "1.1rem", opacity: 0.17, rot: "1deg" },
  { text: "mitochondria", bottom: "26px", left: "45%", size: "1.2rem", opacity: 0.18, rot: "-1.5deg", show: "lg" },
  { text: "6.022 × 10²³", bottom: "34px", left: "70%", size: "1.15rem", opacity: 0.17, rot: "1.5deg" },
  // side margins, only where the screen is wide enough to clear the content column.
  { text: "F = ma", top: "33%", left: "2%", size: "1.6rem", opacity: 0.19, rot: "-3deg", show: "2xl" },
  { text: "dy/dx", top: "70%", left: "2.5%", size: "1.45rem", opacity: 0.18, rot: "1deg", show: "2xl" },
  { text: "V = IR", top: "26%", left: "94%", size: "1.6rem", opacity: 0.19, rot: "2deg", show: "2xl" },
  { text: "E = mc²", top: "60%", left: "93.5%", size: "1.55rem", opacity: 0.19, rot: "-1deg", show: "2xl" },
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
