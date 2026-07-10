/**
 * Act five, flat-playful edition: the classroom fit, proven with REAL
 * captured answers. Three language cards (same physics idea, three
 * languages), then the full worked class-7 State Board Hindi answer as the
 * product's own ivory paper, then the board chips. All output unedited; see
 * realAnswer.ts for capture provenance.
 */
import { motion } from "motion/react";
import { Markdown } from "../Markdown";
import { REAL_VOICES, REAL_HINDI_QUESTION, REAL_HINDI_ANSWER } from "./realAnswer";
import { useCalm, fadeUp, sheetRise } from "./reveals";

const BOARDS = ["CBSE", "ICSE", "State Board", "JEE", "NEET", "General Study"];

export default function IndexCards() {
  const calm = useCalm();

  return (
    <section className="landing-cv landing-cv-cards bg-page px-5 py-16 text-ink md:px-8 md:py-24" aria-label="Made for every Indian classroom">
      <div className="mx-auto max-w-6xl">
        <motion.h2 {...fadeUp(calm)} className="kod-display landing-balance max-w-2xl text-[clamp(1.9rem,5vw,3rem)] leading-[1.08] text-ink">
          It knows which classroom you sit in.
        </motion.h2>
        <motion.p {...fadeUp(calm, calm ? 0 : 0.08)} className="landing-pretty mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-dim md:text-base">
          Tell it your board, your class from 6 to 12, your language, and the
          analogies that make sense in your life. One physics idea, asked to
          the live teacher three times on 2 July 2026, once in each language:
        </motion.p>

        {/* Three real one-line answers */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {REAL_VOICES.map((v, i) => (
            <motion.div
              key={v.tag}
              {...fadeUp(calm, calm ? 0 : i * 0.08)}
              className="kod-card p-6"
            >
              <span lang={v.lang === "hi" ? "hi" : undefined} className={`kod-pill inline-block bg-cobalt text-white ${v.lang === "hi" ? "landing-devanagari" : ""}`}>
                {v.tag}
              </span>
              <p
                lang={v.lang}
                className={`landing-pretty mt-4 text-[15px] leading-relaxed text-ink md:text-base ${v.lang === "hi" ? "landing-devanagari" : ""}`}
              >
                &ldquo;{v.line}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
        <p className="landing-pretty mt-4 max-w-3xl text-[13px] leading-relaxed text-ink-dim">
          The English and Hinglish lines are complete answers, unedited; the
          Hindi line is the heart of a slightly longer reply.
        </p>

        {/* The full worked Hindi answer for the younger classroom */}
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-16">
            <motion.p {...fadeUp(calm)} className="kod-pill inline-block bg-lime text-pill-ink">
              class 7 &middot; State Board &middot; Hindi
            </motion.p>
            <h3 className="kod-display landing-balance mt-4 text-xl leading-snug text-ink md:text-2xl">
              And it is not only for the JEE student.
            </h3>
            <p className="landing-pretty mt-4 max-w-lg text-[15px] leading-relaxed text-ink-dim">
              A class 7 State Board student asked this in Hindi on 10 July 2026.
              The whole lesson came back in Hindi, checked, and it ends the way a
              good teacher ends: by handing the next one to the student.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <motion.div {...sheetRise(calm)} className="flex flex-col items-end">
              <p className="kod-display mb-1.5 text-xs text-ink-dim">A class 7 student, in Hindi</p>
              <div lang="hi" className="landing-devanagari max-w-[92%] rounded-[2px] border-2 border-cobalt-bright bg-page p-4 text-sm leading-relaxed text-ink md:max-w-[80%]">
                {REAL_HINDI_QUESTION}
              </div>
            </motion.div>
            <motion.div {...sheetRise(calm)} className="flex flex-col items-start">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="kod-display text-xs text-ink-dim">Clarify.AI &middot; unedited</span>
                <span className="kod-pill bg-lime-pale text-pill-ink">Deep-check passed</span>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label="A real Hindi answer from Clarify.AI for a class 7 State Board profile, scrollable"
                lang="hi"
                className="lit-sheet landing-devanagari max-h-[420px] w-full min-w-0 overflow-y-auto rounded-[2px] bg-editorial-ivory p-4 text-sm leading-relaxed text-editorial-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-bright md:p-5"
              >
                <Markdown>{REAL_HINDI_ANSWER}</Markdown>
              </div>
            </motion.div>
            <p className="landing-pretty text-[13px] leading-relaxed text-ink-dim">
              Captured live on 10 July 2026 for a State Board, class 7, Hindi
              profile. Nothing edited. The last line asks the student to try one
              themselves: it will wait for the answer.
            </p>
          </div>
        </div>

        {/* Boards */}
        <div className="mt-14">
          <p className="kod-display text-sm text-ink">Tuned to your board and exam</p>
          <ul className="mt-3 flex max-w-xl flex-wrap gap-2">
            {BOARDS.map((b) => (
              <li key={b} className="kod-pill border-2 border-ink-line bg-page text-ink">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
