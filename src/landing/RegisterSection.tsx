/**
 * Act four, flat-playful edition: the honesty machinery, opened by the
 * question in the words it actually arrives in. Four flat rows on a chip
 * ground; the Deep-check row wears the product's real chip.
 */
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useCalm, fadeUp } from "./reveals";

const ROWS = [
  {
    title: "Rough work, then the real answer",
    body: "You will watch a draft being written in real time, like rough work in the margin. That draft is not what you are asked to trust. Once it is complete, an examiner pass reads the whole of it, rechecks the facts and calculations, and the corrected, verified answer takes its place. Only the checked version stays on your screen, and only the checked version reaches your notebook.",
  },
  {
    title: "Deep-check, a second examiner",
    body: "Every answer already faces this examiner before it settles on your screen. The Deep-check button under an answer calls the same examiner back for one more, slower look: worth it for the answers that matter, and it never costs a query.",
    chip: true,
  },
  {
    title: "It grades its own arithmetic",
    body: "Numerical answers end by plugging the result back into the equation. You can see it in the real answer above: the worked example closes with its own verification line.",
  },
  {
    title: "Sources, when it searches",
    body: "Questions about current facts are grounded in live Google Search, and the answer cites where it came from.",
  },
];

export default function RegisterSection() {
  const calm = useCalm();

  return (
    <section className="landing-cv landing-cv-register bg-chip px-5 py-16 text-ink md:px-8 md:py-24" aria-label="How ClarifyAi stays honest">
      <div className="mx-auto max-w-6xl">
        <motion.p {...fadeUp(calm)} className="kod-display text-xl text-ink md:text-2xl">
          <span lang="hi-Latn">par yeh galat hua toh?</span>
          <span className="ml-3 text-sm font-normal text-ink-dim" style={{ fontFamily: "Inter, sans-serif" }}>
            But what if it gets it wrong?
          </span>
        </motion.p>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-16">
            <h2 className="kod-display landing-balance text-[clamp(1.9rem,5vw,3rem)] leading-[1.08] text-ink">
              It would rather be right than fast.
            </h2>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-ink-dim md:text-base">
              An AI that teaches students cannot afford to be confidently wrong.
              So this teacher is engineered to slow down in exactly the places
              where wrong answers hide.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {ROWS.map((row, i) => (
              <motion.div key={row.title} {...fadeUp(calm, calm ? 0 : i * 0.06)} className="kod-card p-6">
                <h3 className="kod-display text-base leading-snug text-ink md:text-lg">{row.title}</h3>
                <p className="landing-pretty mt-2 max-w-prose text-[15px] leading-relaxed text-ink-dim">{row.body}</p>
                {row.chip && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none mt-3 inline-flex items-center gap-1.5 rounded-full border border-editorial-sage bg-editorial-sage px-3 py-1.5 text-xs font-medium text-white select-none"
                  >
                    <CheckCircle2 size={13} /> Deep-check
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
