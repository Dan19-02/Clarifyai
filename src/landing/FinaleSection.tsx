/**
 * The finale: back to the night, but the words that drifted through the hero
 * are caught now. The story closes where it began, calm this time.
 * The site footer lives in LandingFooter so this section can sit inside
 * <main> while the footer stays a top-level contentinfo landmark.
 */
import { Check } from "lucide-react";
import { DRIFT_WORDS } from "./words";
import type { AuthMode } from "./Landing";
import { SUPPORT_EMAIL } from "../defaults";

interface FinaleSectionProps {
  onAuth: (mode: AuthMode) => void;
}

export default function FinaleSection({ onAuth }: FinaleSectionProps) {
  return (
    <section className="bg-night px-4 py-24 text-center text-chalk md:px-8 md:py-32" aria-label="Start learning">
      <div className="mx-auto max-w-3xl">
        {/* The hero's drifting words, caught. */}
        <ul aria-label="Concepts, caught" className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {DRIFT_WORDS.slice(0, 7).map((w) => (
            <li
              key={w.text}
              className="flex items-center gap-1.5 rounded-full border border-night-line px-3.5 py-1.5 font-serif text-[13px] italic text-chalk-dim"
            >
              <Check size={12} className="shrink-0 text-sage-bright" aria-hidden="true" />
              {w.text}
            </li>
          ))}
        </ul>

        <h2 className="landing-balance mt-12 font-serif text-[clamp(2.2rem,6vw,4rem)] italic leading-[1.08] tracking-[-0.01em] text-chalk">
          Tomorrow, when a word flies past you in class, let it.
        </h2>
        <p className="mt-6 text-lg text-chalk-dim">You have a net now.</p>
        <button
          onClick={() => onAuth("signup")}
          className="mt-10 rounded-full bg-sage-bright px-9 py-4 text-sm font-semibold text-night transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright"
        >
          Start learning tonight
        </button>
        <p className="mt-4 text-[13px] text-chalk-dim">Free to try. No card needed to create an account.</p>
      </div>
    </section>
  );
}

export function LandingFooter({ onAuth }: FinaleSectionProps) {
  const link =
    "text-sm text-chalk-dim transition-colors hover:text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-bright";
  return (
    <footer className="border-t border-night-line bg-night px-5 py-10 text-chalk md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-editorial-sage">
            <span className="font-serif text-lg italic leading-none text-editorial-ivory">C</span>
          </div>
          <div>
            <p className="font-serif text-lg italic tracking-tight text-chalk">Clarify.AI</p>
            <p className="text-[13px] text-chalk-dim">A patient teacher for every student in India.</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-6" aria-label="Footer">
          <a href="#watch" className={link}>Watch it teach</a>
          <a href="#pricing" className={link}>Pricing</a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>Support</a>
          <button onClick={() => onAuth("login")} className={link}>
            Sign in
          </button>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-[12px] text-chalk-dim">
        &copy; 2026 Clarify.AI · Questions, payments, anything at all:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-chalk-dim underline underline-offset-2 transition-colors hover:text-chalk">
          {SUPPORT_EMAIL}
        </a>
        , the only address we answer from.
      </p>
    </footer>
  );
}
