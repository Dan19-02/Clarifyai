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
 * A continuous river of real school phrases and formulas that flows left to
 * right behind every story section, so the long scroll feels like a classroom,
 * not an empty page. Each lane is one horizontal marquee row. Formulas use
 * ASCII math only (no em/en dashes, per the app-wide rule).
 */
export interface WordLane {
  words: string[];
  /** Vertical position within the section (percent). */
  top: string;
  /** Font size for this lane. */
  size: string;
  /** Base opacity (the component nudges it up on light sections). */
  opacity: number;
  /** One full loop duration; bigger = slower. */
  dur: string;
  /** Hidden on phones to keep the mobile background calm. */
  desktopOnly?: boolean;
}

// Seven lanes at different heights, sizes, and speeds. Each carries a distinct
// mix of subjects so no two rows read alike. Word lists are long so a single
// strip is wider than any viewport (seamless loop, no gaps).
export const WORD_LANES: WordLane[] = [
  {
    top: "5%", size: "1.5rem", opacity: 0.13, dur: "82s",
    words: ["rate of change of momentum", "F = ma", "electronegativity", "photosynthesis", "sin²θ + cos²θ = 1", "the Krebs cycle", "V = IR", "Le Chatelier's principle", "dy/dx", "escape velocity", "the water cycle", "b² - 4ac"],
  },
  {
    top: "18%", size: "1.05rem", opacity: 0.11, dur: "104s", desktopOnly: true,
    words: ["mitochondria", "PV = nRT", "the quadratic formula", "projectile motion", "valency of carbon", "a² + b² = c²", "natural selection", "∫ sec²x dx", "half-life", "the periodic table", "moment of inertia", "log(ab) = log a + log b"],
  },
  {
    top: "31%", size: "1.7rem", opacity: 0.14, dur: "72s",
    words: ["E = mc²", "Mendel's F₂ ratio", "simple harmonic motion", "pH = -log[H⁺]", "the French Revolution", "covalent bond", "Pythagoras theorem", "v = u + at", "osmosis", "angular momentum", "6.022 × 10²³", "past perfect tense"],
  },
  {
    top: "44%", size: "1.1rem", opacity: 0.11, dur: "118s", desktopOnly: true,
    words: ["Newton's laws", "λ = h/p", "phloem and xylem", "arithmetic progression", "oxidation state", "the Doppler effect", "supply and demand", "chlorophyll", "matrices and determinants", "sp³ hybridisation", "tectonic plates", "work done by a force"],
  },
  {
    top: "58%", size: "1.55rem", opacity: 0.13, dur: "88s",
    words: ["photosynthesis", "P = VI", "the nephron", "sin²θ + cos²θ = 1", "Avogadro's number", "centre of mass", "DNA replication", "latitude and longitude", "the quadratic formula", "benzene ring", "F = dp/dt", "the Preamble"],
  },
  {
    top: "71%", size: "1.05rem", opacity: 0.11, dur: "110s", desktopOnly: true,
    words: ["valency of carbon", "nCr", "escape velocity", "the Krebs cycle", "V = IR", "quadratic equations", "electronegativity", "meiosis and mitosis", "moment of inertia", "the water cycle", "∫ sec²x dx", "Ohm's law"],
  },
  {
    top: "84%", size: "1.5rem", opacity: 0.13, dur: "76s",
    words: ["rate of change of momentum", "b² - 4ac", "mitochondria", "PV = nRT", "Le Chatelier's principle", "a² + b² = c²", "projectile motion", "pH = -log[H⁺]", "natural selection", "E = mc²", "the periodic table", "dy/dx"],
  },
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
