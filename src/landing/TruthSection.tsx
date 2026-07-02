/**
 * Act four: trust. An AI that teaches children cannot afford to be
 * confidently wrong, so this section names the machinery that slows the
 * teacher down in exactly the right places. Ledger rows, not feature cards.
 */
import { CheckCircle2 } from "lucide-react";

const ROWS = [
  {
    title: "The whole answer, or nothing",
    body: "No word-by-word streaming theatre. Clarify.AI writes the complete answer, checks it, and only then shows it to the student, whole.",
  },
  {
    title: "Deep-check, a second examiner",
    body: "One tap under any answer sends it to a second examiner pass that double-checks its facts and calculations. Slower, and worth it for the answers that matter.",
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

export default function TruthSection() {
  return (
    <section className="bg-editorial-stone px-4 py-20 md:px-8 md:py-28" aria-label="How Clarify.AI stays honest">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-16">
          <h2 className="landing-balance font-serif text-[clamp(2.1rem,5vw,3.25rem)] italic leading-tight tracking-[-0.01em] text-editorial-charcoal">
            It would rather be right than fast.
          </h2>
          <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-editorial-charcoal/70 md:text-base">
            An AI that teaches students cannot afford to be confidently wrong. So
            this teacher is engineered to slow down in exactly the places where
            wrong answers hide.
          </p>
        </div>

        <div>
          {ROWS.map((row) => (
            <div
              key={row.title}
              className="grid gap-2 border-t border-editorial-line py-6 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[230px_1fr] md:gap-8 md:py-7"
            >
              <h3 className="font-serif text-lg italic leading-snug text-editorial-charcoal">{row.title}</h3>
              <div>
                <p className="landing-pretty max-w-prose text-[15px] leading-relaxed text-editorial-charcoal/75">{row.body}</p>
                {row.chip && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none mt-3 inline-flex items-center gap-1.5 rounded-full border border-editorial-sage bg-editorial-sage px-3 py-1.5 text-xs font-medium text-white select-none"
                  >
                    <CheckCircle2 size={13} /> Deep-check
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
