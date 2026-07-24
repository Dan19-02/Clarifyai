/**
 * The comparison, flat-playful edition: the question a parent actually asks,
 * answered as five two-tone contrast cards (them / this one), closed by the
 * benchmark line with its provenance stated plainly.
 */
import { motion } from "motion/react";
import { useCalm, fadeUp } from "./reveals";

interface Contrast {
  them: string;
  thisOne: string;
  body: string;
}

const CONTRASTS: Contrast[] = [
  {
    them: "They answer once.",
    thisOne: "This one stays.",
    body: "A general chatbot answers and moves on. ClarifyAi is built around the re-explain ladder: it assumes the first explanation may not land, and it stays with you, a different way each time, until one does.",
  },
  {
    them: "They aim to sound right.",
    thisOne: "This one checks.",
    body: "ClarifyAi runs a second examiner pass over its own finished work, grades its own arithmetic by plugging results back in, and cites sources when it searches. Caring about a student means checking before handing back the answer.",
  },
  {
    them: "They know the whole internet.",
    thisOne: "This one knows your classroom.",
    body: "Board terms, marks-style exam-ready answers, the class 6 to 12 syllabus, JEE and NEET patterns. An answer that is correct but not written the way your examiner wants is only half an answer.",
  },
  {
    them: "Their scroll disappears.",
    thisOne: "This one keeps what clicked.",
    body: "In a chat app, the explanation that finally made sense is buried by morning. Here it is saved into your Pre-exam notebook, filed under the right chapter, waiting for revision night.",
  },
  {
    them: "Hinglish is an afterthought there.",
    thisOne: "A first language here.",
    body: "Hinglish and Hindi are first-class languages in this classroom. You can ask, be taught, and be re-taught in the language your thoughts actually arrive in, and nobody will ask you to translate yourself first.",
  },
];

const BENCHMARK_NOTE =
  "One number, with its provenance attached: in blind evaluations ClarifyAi runs on itself, six independent AI judges score it against eight other systems on real board-exam questions, and in the latest run its accuracy score, 9.62 out of 10, was the highest of all nine systems on the panel, the biggest general AIs included.";

export default function WhySection() {
  const calm = useCalm();

  return (
    <section
      id="why"
      className="landing-cv landing-cv-why bg-page px-5 py-16 text-ink md:px-8 md:py-24"
      aria-label="How ClarifyAi is different from a general chatbot"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-16">
            <motion.p {...fadeUp(calm)} className="kod-pill inline-block bg-chip text-ink">
              the fair question
            </motion.p>
            <h2 className="kod-display landing-balance mt-4 text-[clamp(1.9rem,5vw,3rem)] leading-[1.08] text-ink">
              <span lang="hi-Latn">par ChatGPT bhi toh hai?</span>
            </h2>
            <p className="landing-pretty mt-5 max-w-lg text-[15px] leading-relaxed text-ink-dim md:text-base">
              But ChatGPT is also there, right? That is the question, in the
              words it actually arrives in, and it deserves a straight answer.
              The big chatbots are not bad; they were built to answer everyone,
              about everything, once. ClarifyAi was built to look after one
              student at a time, and every difference below follows from that.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {CONTRASTS.map((row, i) => (
              <motion.div key={row.thisOne} {...fadeUp(calm, calm ? 0 : i * 0.06)} className="kod-card p-6">
                <h3 className="kod-display text-base leading-snug md:text-lg">
                  <span className="text-ink-dim">{row.them}</span>{" "}
                  <span className="text-cobalt-bright">{row.thisOne}</span>
                </h3>
                <p className="landing-pretty mt-2 max-w-prose text-[15px] leading-relaxed text-ink-dim">{row.body}</p>
              </motion.div>
            ))}
            <motion.p {...fadeUp(calm)} className="landing-pretty rounded-[2px] border-2 border-lime bg-lime-pale/40 p-5 text-sm leading-relaxed text-ink">
              {BENCHMARK_NOTE}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
