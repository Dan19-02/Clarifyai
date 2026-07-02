/**
 * Act three: the promise that makes Clarify.AI different. One tap says
 * "still fuzzy" and the teacher climbs down the re-explain ladder, never
 * repeating itself, never moving on, never implying the student is slow.
 * Closes with the REAL re-explanation captured from the live product.
 */
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Markdown } from "../Markdown";
import { REAL_REEXPLANATION, REAL_STILL_FUZZY_PROMPT } from "./realAnswer";
import { useStaticStart } from "./useStaticStart";

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
  const prefersReduced = useReducedMotion();
  const staticStart = useStaticStart();
  const reduce = prefersReduced || staticStart;

  return (
    <section id="how" className="bg-editorial-ivory px-4 py-20 md:px-8 md:py-28" aria-label="How Clarify.AI stays until it lands">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          {/* The pitch + the button */}
          <div className="lg:sticky lg:top-16">
            <h2 className="landing-balance font-serif text-[clamp(2.1rem,5vw,3.25rem)] italic leading-tight tracking-[-0.01em] text-editorial-charcoal">
              It stays until it lands.
            </h2>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-editorial-charcoal/70 md:text-base">
              Understanding rarely arrives on the first try, and Clarify.AI is built
              around that truth. Under every answer sits one small button:
            </p>
            <span
              aria-hidden="true"
              className="pointer-events-none mt-5 inline-flex items-center gap-1.5 rounded-full border border-editorial-line-light bg-editorial-stone px-4 py-2 text-sm text-editorial-sage select-none"
            >
              <Sparkles size={14} /> Still fuzzy?
            </span>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-editorial-charcoal/70 md:text-base">
              One tap. You never have to put your confusion into words. The teacher
              never repeats itself, never sighs, and never moves on while you are
              lost. It simply climbs down another rung:
            </p>
          </div>

          {/* The ladder. A real, ordered sequence, so the numbers are earned. */}
          <ol className="flex flex-col gap-2.5">
            {RUNGS.map((rung, i) => (
              <motion.li
                key={rung.title}
                {...(reduce
                  ? {}
                  : {
                      initial: { opacity: 0, y: 16 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-10% 0px" },
                      transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
                    })}
                className="rounded-2xl border border-editorial-line-light bg-white p-5 md:p-6"
                style={{ marginLeft: `calc(${i} * min(2.2rem, 3vw))` }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-2xl italic leading-none text-editorial-sage">{i + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-editorial-charcoal md:text-base">{rung.title}</h3>
                    <p className="landing-pretty mt-1.5 text-sm leading-relaxed text-editorial-charcoal/70">{rung.body}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Proof: the real re-explanation from the live session */}
        <div className="mt-16 md:mt-24">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-center font-serif text-2xl italic text-editorial-charcoal md:text-3xl">
              And this part is real, too.
            </h3>
            <p className="landing-pretty mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-editorial-charcoal/70">
              While building this page we tapped that button on the Newton answer
              above. Here is what the live teacher did: it slowed down, dropped the
              formula, and changed the analogy entirely.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex max-w-[92%] flex-col items-end self-end md:max-w-[75%]">
                <div className="mb-1 text-[10px] text-editorial-charcoal/70">You, with one tap</div>
                <div className="rounded-2xl rounded-tr-sm border border-editorial-line bg-editorial-stone p-4 text-sm text-editorial-charcoal shadow-sm">
                  {REAL_STILL_FUZZY_PROMPT}
                </div>
              </div>
              <div className="flex max-w-full flex-col items-start self-start">
                <div className="mb-1 text-[10px] text-editorial-charcoal/70">Clarify.AI &middot; unedited</div>
                <div
                  tabIndex={0}
                  role="region"
                  aria-label="The real re-explanation from Clarify.AI, scrollable"
                  className="max-h-[430px] w-full min-w-0 overflow-y-auto rounded-2xl rounded-tl-sm border border-editorial-line-light bg-white p-4 text-sm leading-relaxed text-editorial-charcoal shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-sage md:p-5"
                >
                  <Markdown>{REAL_REEXPLANATION}</Markdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
