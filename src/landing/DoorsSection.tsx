/**
 * The feature rail, flat-playful edition: a big cobalt panel (Kodland course
 * carousel grammar) holding one white card per feature. Each card keeps the
 * parent-panel-validated situation-first order: the moment you are in (lime
 * pill), the feature built for it (mono title), and what it plainly does.
 * The rail is native scroll-snap; the arrows nudge it a card at a time.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCalm, fadeUp } from "./reveals";

interface Door {
  situation: string;
  feature: string;
  body: string;
}

const DOORS: Door[] = [
  {
    situation: "The line you copied off the board in fourth period has stopped making sense by night.",
    feature: "Ask in your own words",
    body: "Type the sentence exactly as it reached you, half-formed, in English, Hinglish, or Hindi. Phrasing it well is not your job here.",
  },
  {
    situation: "You read the answer twice. Samajh nahi aaya, it still has not landed.",
    feature: "Still fuzzy?",
    body: "One small button under every answer. One tap, no need to explain what confused you, and the teacher tries a different way: a new analogy, smaller steps, a tiny worked example, or one gentle question to find the exact gap. It never repeats the same explanation.",
  },
  {
    situation: "Tomorrow this is a five-mark question, so it cannot just sound correct, it has to be correct.",
    feature: "Deep-check",
    body: "A second examiner pass re-reads the finished answer and double-checks the facts and calculations before you trust it. Numerical answers verify themselves by substituting the result back in. One tap under any answer runs it again.",
  },
  {
    situation: "Question 7(b) comes with a diagram, and typing it out would take longer than solving it.",
    feature: "Photo doubts",
    body: "Send a photo of the printed problem: a textbook page, a worksheet, a diagram. Then ask about it the way you would point at it across a desk.",
  },
  {
    situation: "The derivation will not sit still on the page, and reading it again is not working.",
    feature: "Voice sessions, and Listen",
    body: "Talk it through live, out loud, like a tuition session that never checks the clock. And any written answer can be read aloud to you with Listen, for the nights your eyes give up before your doubts do.",
  },
  {
    situation: "It is the night before the exam, and what you need is the one line that made it click, not the whole conversation.",
    feature: "Pre-exam notebook",
    body: "Select the exact lines that made something land and save them. They file themselves under the right chapter, ready for revision when it matters. Included on the Regular and Unlimited plans.",
  },
  {
    situation: "A class 8 CBSE answer and a NEET answer are not the same answer, even to the same question.",
    feature: "Your classroom profile",
    body: "Set your board (CBSE, ICSE, State, JEE, NEET, or General), your class from 6 to 12, your language, and the world your analogies should come from: cricket, cooking, whatever fits your life. Every answer is shaped by it.",
  },
  {
    situation: "The question is about something that happened this year, and the textbook was printed before that.",
    feature: "Sources when it searches",
    body: "Questions about current facts are grounded in a live Google Search, and the answer cites where it came from. You can check the source yourself, the way a good answer sheet shows its working.",
  },
];

export default function DoorsSection() {
  const calm = useCalm();
  const railRef = useRef<HTMLDivElement | null>(null);
  // Arrow enablement mirrors the rail's real scroll position, so taps at
  // either end never die silently: the dead arrow is visibly dimmed.
  const [ends, setEnds] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      setEnds({ atStart: rail.scrollLeft <= 4, atEnd: rail.scrollLeft >= max - 4 });
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(":scope > *");
    const step = card ? card.offsetWidth + 16 : 320;
    rail.scrollBy({ left: dir * step, behavior: calm ? "auto" : "smooth" });
  };

  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 text-white transition-colors hover:bg-white hover:text-cobalt-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-white";

  return (
    <section
      id="features"
      className="landing-cv landing-cv-doors bg-page px-5 py-16 text-ink md:px-8 md:py-24"
      aria-label="What each feature does and when to use it"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2 {...fadeUp(calm)} className="kod-display landing-balance max-w-2xl text-[clamp(1.9rem,5vw,3rem)] leading-[1.08] text-ink">
          Every feature, and the night it is for.
        </motion.h2>
        <motion.p {...fadeUp(calm, calm ? 0 : 0.08)} className="landing-pretty mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-dim md:text-base">
          No tour and no jargon. Each card starts with a moment you already
          know, then names the thing built for it.
        </motion.p>

        {/* The cobalt panel */}
        <motion.div {...fadeUp(calm, calm ? 0 : 0.12)} className="mt-8 rounded-[2px] bg-cobalt p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 px-1 pb-3 pt-1 sm:px-2">
            <p className="kod-display text-xs uppercase tracking-[0.12em] text-white">
              Eight doors, one patient teacher
            </p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous features" disabled={ends.atStart} onClick={() => nudge(-1)} className={arrow}>
                <ArrowLeft size={18} />
              </button>
              <button type="button" aria-label="More features" disabled={ends.atEnd} onClick={() => nudge(1)} className={arrow}>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div ref={railRef} className="kod-rail pb-1" role="list" aria-label="Features">
            {DOORS.map((door) => (
              <article
                key={door.feature}
                role="listitem"
                className="flex w-[85%] flex-col rounded-[2px] bg-page p-5 sm:w-[46%] md:p-6 lg:w-[31.5%]"
              >
                <p className="kod-pill self-start bg-lime-pale text-pill-ink" style={{ whiteSpace: "normal" }}>
                  {door.situation}
                </p>
                <h3 className="kod-display mt-4 text-lg leading-snug text-cobalt-bright">{door.feature}</h3>
                <p className="landing-pretty mt-2 text-sm leading-relaxed text-ink-dim">{door.body}</p>
              </article>
            ))}
          </div>
        </motion.div>

        <motion.p {...fadeUp(calm)} className="landing-pretty mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          That is everything on the desk. Nothing decorative, nothing you will
          not reach for on a school night.
        </motion.p>
      </div>
    </section>
  );
}
