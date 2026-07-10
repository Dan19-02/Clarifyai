/**
 * Why this exists, flat-playful edition: the founder's conviction on a full
 * cobalt ground, the one drenched moment on the page, placed right before
 * the pricing sheet it explains. The "we" voice lives only here.
 */
import { motion } from "motion/react";
import { useCalm, fadeUp } from "./reveals";

const PARAGRAPHS: string[] = [
  "Clarify.AI began with one picture that would not leave us alone: a student at 11 pm, lamp on, book open, one sentence refusing to make sense, and nobody awake to ask. Not a weak student. A normal one, on a normal night, in homes all over India. Everything on this page was built backwards from that hour.",
  "We hold one conviction above all the others: quality education is a right, not a luxury. So we are building a place where any student in India can ask openly, as many times as it takes, without being judged for asking and without it costing what a coaching class costs. Here, the fifth 'still fuzzy' is received exactly like the first.",
  "A conviction only counts if it survives the price tag. The sheet below is where we keep our word.",
];

export default function MissionSection() {
  const calm = useCalm();

  return (
    <section
      id="mission"
      className="landing-cv landing-cv-mission bg-cobalt px-5 py-20 text-white md:px-8 md:py-28"
      aria-label="Why Clarify.AI exists"
    >
      <div className="mx-auto max-w-3xl">
        <motion.p {...fadeUp(calm)} className="kod-pill inline-block bg-lime text-pill-ink">
          why we exist
        </motion.p>
        <motion.h2
          {...fadeUp(calm, calm ? 0 : 0.08)}
          className="kod-display landing-balance mt-5 text-[clamp(1.9rem,5vw,3rem)] leading-[1.1] text-white"
        >
          For the student nobody was awake to answer.
        </motion.h2>
        {PARAGRAPHS.map((para, i) => (
          <motion.p
            key={i}
            {...fadeUp(calm, calm ? 0 : 0.14 + i * 0.08)}
            className="landing-pretty mt-6 text-base leading-relaxed text-white/85 md:text-lg"
          >
            {para}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
