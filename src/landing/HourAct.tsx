/**
 * Act one, flat-playful edition: white page, mono display voice, cobalt CTA,
 * and a hand-drawn line-art doodle that sketches itself in. The 11:04 pm
 * story survives as a four-stamp strip: the day that got the student here,
 * ending on the cobalt card where the catch-net arrives. The stat trio below
 * is real numbers only: the blind-panel accuracy score, languages and
 * boards, and the honest price anchor.
 */
import { motion } from "motion/react";
import { ThemeToggle } from "../ThemeToggle";
import { useCalm, fadeUp, EASE } from "./reveals";
import type { AuthMode } from "./Landing";

interface HourActProps {
  onAuth: (mode: AuthMode) => void;
}

const STAMPS = [
  {
    time: "10:14 am",
    line: "The teacher says “rate of change of momentum”, taps the board twice, and moves on.",
    cobalt: false,
  },
  {
    time: "10:15 am",
    line: "Half the class nods. You copy the words down, hoping they will make sense tonight.",
    cobalt: false,
  },
  {
    time: "11:02 pm",
    line: "They do not. And the old feeling reaches for you: the quiet panic of falling behind.",
    cobalt: false,
  },
  {
    time: "11:04 pm",
    line: "You open Clarify.AI. Tonight, the panic never arrives. Tonight you have a catch-net.",
    cobalt: true,
  },
];

const STATS = [
  {
    big: "9.62 / 10",
    caption:
      "Accuracy in our own blind evaluations: six independent AI judges, nine systems, real board-exam questions. Highest score of any system tested.",
  },
  {
    big: "3 languages",
    caption: "English, Hinglish and हिंदी, across CBSE, ICSE, State boards, JEE and NEET, class 6 to 12.",
  },
  {
    big: "₹199 / month",
    caption: "After one free week, no card. Every plan is a one-time 30-day payment. No auto-renewal, no lock-in.",
  },
];

/** Hand-drawn line-art: a phone catching a doubt under a lamp. */
function HeroDoodle({ calm }: { calm: boolean }) {
  const draw = (len: number, delay: number) =>
    calm
      ? {}
      : ({ ["--len" as string]: String(len), ["--d" as string]: `${delay}s` } as React.CSSProperties);
  const cls = calm ? "" : "kod-draw";
  return (
    <svg
      viewBox="0 0 520 440"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full max-w-[520px] text-ink"
    >
      {/* ribbon path weaving through the scene */}
      <path
        d="M10 330 C 120 260, 150 400, 260 350 S 430 280, 505 330"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        className={cls} style={draw(700, 0.1)} pathLength={700}
      />
      {/* the phone */}
      <rect x="180" y="90" width="160" height="270" rx="18"
        stroke="currentColor" strokeWidth="3" className={cls} style={draw(900, 0.2)} pathLength={900} />
      <line x1="235" y1="118" x2="285" y2="118" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        className={cls} style={draw(60, 0.5)} pathLength={60} />
      {/* the doubt bubble, typed exactly as heard */}
      <g className={calm ? "" : "kod-bob"}>
        <rect x="60" y="140" width="150" height="54" rx="10"
          stroke="var(--color-cobalt-bright)" strokeWidth="2.5" fill="var(--color-page)"
          className={cls} style={draw(420, 0.6)} pathLength={420} />
        <path d="M110 194 l-8 16 22 -16" stroke="var(--color-cobalt-bright)" strokeWidth="2.5" fill="var(--color-page)"
          className={cls} style={draw(60, 0.8)} pathLength={60} />
        <text x="135" y="173" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill="var(--color-cobalt-bright)">
          F = ma ??
        </text>
      </g>
      {/* the answer sheet sliding out of the phone */}
      <rect x="212" y="180" width="150" height="120" rx="6"
        stroke="currentColor" strokeWidth="2.5" fill="var(--color-page)"
        className={cls} style={draw(560, 0.9)} pathLength={560} />
      <line x1="228" y1="208" x2="330" y2="208" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={cls} style={draw(110, 1.1)} pathLength={110} />
      <line x1="228" y1="230" x2="345" y2="230" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={cls} style={draw(120, 1.2)} pathLength={120} />
      <line x1="228" y1="252" x2="310" y2="252" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={cls} style={draw(90, 1.3)} pathLength={90} />
      {/* the examiner tick on the sheet */}
      <circle cx="340" cy="275" r="16" stroke="var(--color-lime)" strokeWidth="3" className={cls} style={draw(110, 1.5)} pathLength={110} />
      <path d="M332 275 l6 7 12 -13" stroke="var(--color-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        className={cls} style={draw(40, 1.7)} pathLength={40} />
      {/* the lamp that stays on */}
      <path d="M395 60 l40 0 -12 -34 -16 0 z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
        className={cls} style={draw(180, 0.4)} pathLength={180} />
      <line x1="415" y1="60" x2="415" y2="96" stroke="currentColor" strokeWidth="2.5" className={cls} style={draw(40, 0.6)} pathLength={40} />
      <path d="M392 84 a30 30 0 0 0 46 0" stroke="var(--color-cobalt-bright)" strokeWidth="2.5" strokeLinecap="round"
        className={cls} style={draw(80, 0.8)} pathLength={80} />
      {/* scattered study dust */}
      <text x="72" y="90" fontFamily="JetBrains Mono, monospace" fontSize="15" fill="currentColor" opacity="0.5">011</text>
      <text x="420" y="220" fontFamily="JetBrains Mono, monospace" fontSize="15" fill="currentColor" opacity="0.5">sin²θ</text>
      <text x="55" y="290" fontFamily="JetBrains Mono, monospace" fontSize="15" fill="currentColor" opacity="0.5">b²-4ac</text>
      <circle cx="470" cy="120" r="5" stroke="currentColor" strokeWidth="2" className={cls} style={draw(35, 1.0)} pathLength={35} />
      <circle cx="120" cy="380" r="5" stroke="var(--color-cobalt-bright)" strokeWidth="2" className={cls} style={draw(35, 1.2)} pathLength={35} />
      <path d="M455 380 l10 0 m-5 -5 l0 10" stroke="var(--color-lime)" strokeWidth="2.5" strokeLinecap="round" className={cls} style={draw(30, 1.4)} pathLength={30} />
    </svg>
  );
}

export default function HourAct({ onAuth }: HourActProps) {
  const calm = useCalm();

  const enter = (delay: number) =>
    calm
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  const navLink =
    "hidden text-sm font-medium text-ink-dim transition-colors hover:text-cobalt-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt-bright md:block";

  return (
    <div className="bg-page text-ink">
      {/* ---- Header ---- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-cobalt">
            <span className="kod-display text-lg leading-none text-white">C</span>
          </div>
          <span className="kod-display text-lg tracking-tight text-ink">Clarify.AI</span>
        </div>
        <nav className="flex items-center gap-3 md:gap-7" aria-label="Main">
          <a href="#watch" className={navLink}>See a real answer</a>
          <a href="#features" className={navLink}>What it does</a>
          <a href="#why" className={navLink}>Why Clarify</a>
          <a href="#pricing" className={navLink}>Pricing</a>
          {/* Below md the nav links hide; parents hunt for the price first,
              so Pricing alone keeps a visible seat next to the toggle. */}
          <a
            href="#pricing"
            className="text-sm font-medium text-ink-dim transition-colors hover:text-cobalt-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt-bright md:hidden"
          >
            Pricing
          </a>
          <ThemeToggle />
          <button
            onClick={() => onAuth("login")}
            className="kod-btn-ghost px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-bright"
          >
            Sign in
          </button>
          <button
            onClick={() => onAuth("signup")}
            className="kod-btn hidden px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:block"
          >
            Start free
          </button>
        </nav>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-8">
          <div>
            <motion.h1
              id="hero-title"
              tabIndex={-1}
              {...enter(0.05)}
              className="kod-display landing-balance text-[clamp(2.1rem,6vw,3.8rem)] leading-[1.06] text-ink focus:outline-none"
            >
              Doubt at 11:04&nbsp;pm?
              <br />
              <span className="text-cobalt-bright">Explained. Again.</span>
              <br />
              Until it lands!
            </motion.h1>
            <motion.p
              {...enter(0.2)}
              className="landing-pretty mt-6 max-w-xl text-base leading-relaxed text-ink-dim md:text-lg"
            >
              A patient AI teacher that takes the exact sentence that flew past
              you in class and explains it again, a different way each time,
              until it lands. CBSE, ICSE, State boards, JEE and NEET, class 6 to 12.
            </motion.p>
            <motion.p
              {...enter(0.3)}
              lang="hi"
              className="landing-pretty landing-devanagari mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim"
            >
              क्लास 6 से 12 के हर स्टूडेंट के लिए एक धैर्यवान AI टीचर: जो एक ही बात
              को नए तरीक़े से तब तक समझाता है, जब तक समझ न आ जाए।
            </motion.p>
            <motion.div {...enter(0.4)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => onAuth("signup")}
                className="kod-btn w-full px-8 py-3.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
              >
                Start free tonight
              </button>
              <a
                href="#watch"
                className="kod-btn-ghost w-full px-8 py-3.5 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-bright sm:w-auto"
              >
                See a real answer
              </a>
            </motion.div>
            <motion.p {...enter(0.5)} className="mt-6 text-[13px] leading-relaxed tracking-wide text-ink-dim">
              One week free, no card. Then from ₹199 a month, no auto-renewal.
              <span className="mx-2" aria-hidden="true">&middot;</span>
              English &middot; Hinglish &middot; <span lang="hi" className="landing-devanagari">हिंदी</span>
            </motion.p>
          </div>
          <motion.div {...enter(0.25)} className="mx-auto w-full max-w-[520px]">
            <HeroDoodle calm={calm} />
          </motion.div>
        </div>
      </section>

      {/* ---- The day that got you here: four stamps ---- */}
      <section aria-label="The day that got you here" className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAMPS.map((s, i) => (
            <motion.div
              key={s.time}
              {...fadeUp(calm, calm ? 0 : i * 0.08)}
              className={`rounded-[2px] border-2 p-5 ${
                s.cobalt ? "border-cobalt-bright bg-cobalt text-white" : "border-ink-line bg-page text-ink"
              }`}
            >
              <p className={`kod-display text-2xl ${s.cobalt ? "text-lime-pale" : "text-cobalt-bright"}`}>{s.time}</p>
              <p className={`landing-pretty mt-3 text-[15px] leading-relaxed ${s.cobalt ? "text-white" : "text-ink-dim"}`}>
                {s.line}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Real numbers ---- */}
      <section aria-label="Clarify.AI in numbers" className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid gap-10 border-t-2 border-ink-line pt-10 md:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div key={s.big} {...fadeUp(calm, calm ? 0 : i * 0.08)}>
              <p className="kod-display text-[clamp(2rem,4.5vw,3rem)] leading-none text-ink">{s.big}</p>
              <p className="landing-pretty mt-3 max-w-xs text-sm leading-relaxed text-ink-dim">{s.caption}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
