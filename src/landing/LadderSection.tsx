/**
 * Act three, flat-playful edition: proof before pitch. The REAL re-explanation
 * (one tap on Still fuzzy?, captured live) sits beside the pitch, then the
 * five rungs land as numbered flat cards, Kodland lesson-steps style. The
 * metering truth rides along: re-explains never cost a query.
 */
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Markdown } from "../Markdown";
import { REAL_REEXPLANATION, REAL_STILL_FUZZY_PROMPT } from "./realAnswer";
import { useCalm, fadeUp, sheetRise } from "./reveals";

const RUNGS = [
  {
    title: "Gut feeling first",
    body: "It starts again from what the idea feels like, not from what it is called.",
  },
  {
    title: "A fresh analogy",
    body: "A new comparison from your own world: cricket, cooking, shopping carts. Never the same one twice.",
  },
  {
    title: "The smallest step, with a picture",
    body: "One tiny piece at a time, usually with a diagram it draws for you on the spot.",
  },
  {
    title: "A worked micro-example",
    body: "Numbers small enough to hold in your head, worked from start to finish.",
  },
  {
    title: "Pinpoint the gap",
    body: "A gentle question that finds the exact sentence where things stopped making sense.",
  },
];

export default function LadderSection() {
  const calm = useCalm();

  return (
    <section id="how" className="landing-cv landing-cv-ladder bg-page px-5 py-16 text-ink md:px-8 md:py-24" aria-label="How Clarify.AI stays until it lands">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* The pitch */}
          <div className="lg:sticky lg:top-16">
            <motion.p {...fadeUp(calm)} className="kod-pill inline-block bg-chip text-ink">
              the signature move
            </motion.p>
            <h2 className="kod-display landing-balance mt-4 text-[clamp(1.9rem,5vw,3rem)] leading-[1.08] text-ink">
              It stays until it lands.
            </h2>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-ink-dim md:text-base">
              Understanding rarely arrives on the first try, and Clarify.AI is
              built around that truth. Under every answer sits one small button:
            </p>
            <span
              aria-hidden="true"
              className="pointer-events-none mt-5 inline-flex items-center gap-1.5 rounded-full border border-editorial-line-light bg-editorial-stone px-4 py-2 text-sm text-editorial-sage select-none"
            >
              <Sparkles size={14} /> Still fuzzy?
            </span>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-ink-dim md:text-base">
              One tap. You never have to put your confusion into words. While
              building this page we tapped it on the Newton answer above. The
              live teacher slowed down, dropped the formula, and changed the
              analogy entirely. Unedited:
            </p>
            <p className="kod-display mt-5 inline-block rounded-[2px] border-2 border-lime bg-lime-pale px-3 py-2 text-sm text-pill-ink">
              Re-explains never cost a query.
            </p>
          </div>

          {/* The proof */}
          <div className="flex flex-col gap-4">
            <motion.div {...sheetRise(calm)} className="flex flex-col items-end">
              <p className="kod-display mb-1.5 text-xs text-ink-dim">You, with one tap</p>
              <div className="max-w-[92%] rounded-[2px] border-2 border-cobalt-bright bg-page p-4 text-sm leading-relaxed text-ink md:max-w-[80%]">
                {REAL_STILL_FUZZY_PROMPT}
              </div>
            </motion.div>
            <motion.div {...sheetRise(calm)} className="flex flex-col items-start">
              <p className="kod-display mb-1.5 text-xs text-ink-dim">Clarify.AI &middot; unedited</p>
              <div
                tabIndex={0}
                role="region"
                aria-label="The real re-explanation from Clarify.AI, scrollable"
                className="lit-sheet max-h-[460px] w-full min-w-0 overflow-y-auto rounded-[2px] bg-editorial-ivory p-4 text-sm leading-relaxed text-editorial-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-bright md:p-5"
              >
                <Markdown>{REAL_REEXPLANATION}</Markdown>
              </div>
            </motion.div>
            <p className="landing-pretty text-[14px] leading-relaxed text-ink-dim">
              The real reply ends with a question: &ldquo;Want to try the cricket
              ball question now...&rdquo; It will wait for your answer. It always waits.
            </p>
          </div>
        </div>

        {/* The five rungs as numbered flat cards */}
        <div className="mt-16 md:mt-24">
          <motion.h3 {...fadeUp(calm)} className="kod-display landing-balance max-w-2xl text-xl leading-snug text-ink md:text-2xl">
            What you just watched has a shape: five rungs, as many as you need.
          </motion.h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {RUNGS.map((rung, i) => (
              <motion.div
                key={rung.title}
                {...fadeUp(calm, calm ? 0 : i * 0.06)}
                className="kod-card p-5"
              >
                <p className="kod-display text-3xl leading-none text-cobalt-bright">{i + 1}</p>
                <h4 className="kod-display mt-3 text-[15px] leading-snug text-ink">{rung.title}</h4>
                <p className="landing-pretty mt-2 text-sm leading-relaxed text-ink-dim">{rung.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.p {...fadeUp(calm)} className="landing-pretty mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
            It never repeats itself, never sighs, never moves on while you are
            lost. The fifth &ldquo;still fuzzy&rdquo; is received exactly like the first.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
