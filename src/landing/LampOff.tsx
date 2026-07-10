/**
 * The finale, flat-playful edition: tonight's index, ticked, then the last
 * calm ask. The footer stays a top-level contentinfo landmark via
 * LandingFooter.
 */
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { DRIFT_WORDS } from "./words";
import { useCalm, fadeUp } from "./reveals";
import type { AuthMode } from "./Landing";
import { SUPPORT_EMAIL } from "../defaults";

interface LampOffProps {
  onAuth: (mode: AuthMode) => void;
}

export default function LampOff({ onAuth }: LampOffProps) {
  const calm = useCalm();

  return (
    <section
      className="landing-cv landing-cv-finale bg-page px-5 py-20 text-center text-ink md:px-8 md:py-28"
      aria-label="Start learning"
    >
      <div className="mx-auto max-w-3xl">
        {/* Tonight's index, ticked. */}
        <motion.div {...fadeUp(calm)} className="mx-auto max-w-md rounded-[2px] border-2 border-ink-line bg-page p-6 text-left">
          <p className="kod-display mb-3 text-xs uppercase tracking-[0.12em] text-ink-dim">Tonight&rsquo;s index</p>
          <ul aria-label="Tonight's index">
            {DRIFT_WORDS.slice(0, 7).map((w) => (
              <li key={w.text} className="flex items-end gap-3 py-1.5">
                <span className="font-mono text-[14px] leading-snug text-ink">{w.text}</span>
                <span aria-hidden="true" className="landing-leader mb-1.5 min-w-8 flex-1" />
                <Check size={15} className="mb-0.5 shrink-0 text-cobalt-bright" aria-hidden="true" />
              </li>
            ))}
            <li className="flex items-end gap-3 py-1.5 text-ink-dim">
              <span className="font-mono text-[14px] leading-snug">
                <span lang="hi-Latn">kal</span>: rotational motion
              </span>
              <span aria-hidden="true" className="landing-leader mb-1.5 min-w-8 flex-1 opacity-50" />
              <span className="w-[15px] shrink-0" aria-hidden="true" />
            </li>
          </ul>
        </motion.div>
        <motion.p {...fadeUp(calm)} className="mt-4 text-[13px] text-ink-dim">
          Seven doubts caught tonight. One waits for tomorrow.
        </motion.p>

        <motion.h2
          {...fadeUp(calm)}
          className="kod-display landing-balance mt-12 text-[clamp(2rem,5.5vw,3.4rem)] leading-[1.08] text-ink"
        >
          Tomorrow, when a word flies past you in class, <span className="text-cobalt-bright">let it.</span>
        </motion.h2>
        <motion.p {...fadeUp(calm)} className="mt-5 text-lg text-ink-dim">
          You have a net now. And the lamp stays on as long as you need it.
        </motion.p>

        <motion.div {...fadeUp(calm)} className="mt-9 inline-flex flex-col items-center gap-3">
          <button
            onClick={() => onAuth("signup")}
            className="kod-btn px-9 py-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Start learning tonight
          </button>
          <p className="text-[13px] text-ink-dim">
            Free to try. No card needed to create an account.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingFooter({ onAuth }: LampOffProps) {
  const link =
    "text-sm text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
  return (
    <footer className="bg-slab px-5 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-cobalt">
            <span className="kod-display text-lg leading-none text-white">C</span>
          </div>
          <div>
            <p className="kod-display text-lg tracking-tight text-white">Clarify.AI</p>
            <p className="text-[13px] text-white/70">A patient teacher for every student in India.</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-6" aria-label="Footer">
          <a href="#watch" className={link}>See a real answer</a>
          <a href="#features" className={link}>What it does</a>
          <a href="#why" className={link}>Why Clarify</a>
          <a href="#mission" className={link}>Why we exist</a>
          <a href="#pricing" className={link}>Pricing</a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>Support</a>
          <button onClick={() => onAuth("login")} className={link}>
            Sign in
          </button>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-[12px] text-white/70">
        &copy; 2026 Clarify.AI &middot; Questions, payments, anything at all:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/80 underline underline-offset-2 transition-colors hover:text-white">
          {SUPPORT_EMAIL}
        </a>
        , the only address we answer from.
      </p>
    </footer>
  );
}
