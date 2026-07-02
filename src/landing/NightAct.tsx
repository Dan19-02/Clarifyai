/**
 * Act one of the landing story: the dark classroom.
 *
 * Hero, the three classroom beats, and "the turn". The whole act sits on one
 * motion-driven background that eases from night to the app's ivory as the
 * visitor scrolls through the turn: the page itself performs the product's
 * promise, confusion becoming clarity. Reduced motion gets the same story as
 * static night and ivory sections.
 */
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { DRIFT_WORDS } from "./words";
import { useStaticStart } from "./useStaticStart";
import WordStream from "./WordStream";
import type { AuthMode } from "./Landing";

const NIGHT = "#15150e";
const IVORY = "#FAF9F6";
const CHALK = "#f0eee2";
const CHARCOAL = "#1A1A1A";

interface NightActProps {
  onAuth: (mode: AuthMode) => void;
}

export default function NightAct({ onAuth }: NightActProps) {
  // Entrances are skipped for reduced-motion users AND for hidden-at-mount
  // renderers (rAF is frozen there, so the reveals would never fire).
  const prefersReduced = useReducedMotion();
  const staticStart = useStaticStart();
  const reduce = prefersReduced || staticStart;
  const turnRef = useRef<HTMLDivElement | null>(null);

  // The dawn: progress through the turn section drives night → ivory.
  const { scrollYProgress } = useScroll({
    target: turnRef,
    offset: ["start end", "end end"],
  });
  const bg = useTransform(scrollYProgress, [0.05, 0.9], [NIGHT, IVORY]);
  // The turn text dissolves through the dawn and re-forms dark: its ink snaps
  // from chalk to charcoal only while it is fully transparent, so it is never
  // shown against a background it cannot contrast with.
  const turnOpacity = useTransform(scrollYProgress, [0.3, 0.42, 0.56, 0.68], [1, 0, 0, 1]);
  const turnInk = useTransform(scrollYProgress, [0.48, 0.5], [CHALK, CHARCOAL]);
  const turnInkSoft = useTransform(
    scrollYProgress,
    [0.48, 0.5],
    ["rgba(240, 238, 226, 0.66)", "rgba(26, 26, 26, 0.7)"]
  );

  const fadeUp = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-15% 0px" },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div
      style={reduce ? undefined : { backgroundColor: bg }}
      className={reduce ? "bg-night" : ""}
    >
      {/* ---- Hero ---- */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <header className="relative z-10 flex items-center justify-between gap-3 px-5 py-5 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-editorial-sage">
              <span className="font-serif text-lg italic leading-none text-editorial-ivory">C</span>
            </div>
            <span className="font-serif text-lg italic tracking-tight text-chalk">Clarify.AI</span>
          </div>
          <nav className="flex items-center gap-2 md:gap-6" aria-label="Main">
            <a href="#watch" className="hidden text-sm text-chalk-dim transition-colors hover:text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-bright md:block">
              Watch it teach
            </a>
            <a href="#pricing" className="hidden text-sm text-chalk-dim transition-colors hover:text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-bright md:block">
              Pricing
            </a>
            <button
              onClick={() => onAuth("login")}
              className="rounded-full border border-night-line px-4 py-2 text-sm text-chalk transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright"
            >
              Sign in
            </button>
            <button
              onClick={() => onAuth("signup")}
              className="hidden rounded-full bg-sage-bright px-4 py-2 text-sm font-semibold text-night transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright sm:block"
            >
              Start free
            </button>
          </nav>
        </header>

        {/* The words flying past. Decorative; hidden from the tree. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          {DRIFT_WORDS.map((w) => (
            <span
              key={w.text}
              className={`landing-drift absolute font-serif italic text-chalk ${w.desktopOnly ? "hidden lg:block" : ""}`}
              style={{
                top: w.top,
                left: w.left,
                opacity: 0.12 + w.depth * 0.26,
                fontSize: `${0.85 + w.depth * 0.65}rem`,
                filter: w.depth < 0.55 ? "blur(1.5px)" : w.depth < 0.75 ? "blur(0.5px)" : undefined,
                ["--dur" as string]: w.dur,
                ["--delay" as string]: w.delay,
                ["--dx" as string]: w.dx,
                ["--dy" as string]: w.dy,
                ["--rot" as string]: w.rot,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>

        <div className="relative z-[1] flex flex-1 items-center justify-center px-6 pb-24 pt-10 text-center">
          <div className="max-w-3xl">
            <motion.p
              {...(reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.15, ease: "easeOut" } })}
              className="font-serif text-xl italic text-chalk-dim md:text-2xl"
            >
              Some words fly past you in class.
            </motion.p>
            <motion.h1
              id="hero-title"
              tabIndex={-1}
              {...(reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] } })}
              className="landing-balance mt-4 font-serif text-[clamp(3.5rem,11vw,6rem)] italic leading-[1.02] tracking-[-0.02em] text-chalk focus:outline-none"
            >
              Let them.
            </motion.h1>
            <motion.p
              {...(reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 1.05, ease: "easeOut" } })}
              className="landing-pretty mx-auto mt-7 max-w-xl text-base leading-relaxed text-chalk-dim md:text-lg"
            >
              Clarify.AI catches what you miss: a patient AI teacher that explains it
              again and again, a different way each time, until it clicks. Built for
              CBSE, ICSE, State boards, JEE and NEET.
            </motion.p>
            <motion.div
              {...(reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 1.35, ease: "easeOut" } })}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={() => onAuth("signup")}
                className="w-full rounded-full bg-sage-bright px-8 py-3.5 text-sm font-semibold text-night transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright sm:w-auto"
              >
                Create your free account
              </button>
              <a
                href="#watch"
                className="w-full rounded-full border border-night-line px-8 py-3.5 text-sm font-medium text-chalk transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright sm:w-auto"
              >
                Watch it teach
              </a>
            </motion.div>
            <motion.p
              {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 1.8 } })}
              className="mt-8 text-[13px] tracking-wide text-chalk-dim"
            >
              English &middot; Hinglish &middot; <span lang="hi">हिंदी</span>
            </motion.p>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-chalk-dim"
          {...(reduce
            ? {}
            : { animate: { y: [0, 7, 0] }, transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } })}
        >
          <ArrowDown size={18} />
        </motion.div>
      </section>

      {/* ---- The classroom, three beats ---- */}
      <section aria-label="The classroom moment" className="relative overflow-hidden">
        <WordStream tone="dark" />
        <motion.div {...fadeUp} className="relative z-10 flex min-h-[62svh] items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <p className="text-sm text-chalk-dim">Physics, second period.</p>
            <p className="landing-balance mt-4 font-serif text-[clamp(1.5rem,3.6vw,2.4rem)] italic leading-snug text-chalk">
              The teacher says &ldquo;rate of change of momentum&rdquo;, taps the board twice, and moves on.
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative z-10 flex min-h-[62svh] items-center justify-center px-6">
          <p className="landing-balance max-w-2xl text-center font-serif text-[clamp(1.5rem,3.6vw,2.4rem)] italic leading-snug text-chalk">
            Half the class nods. You copy the words down, hoping they will make sense tonight.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="relative z-10 flex min-h-[62svh] items-center justify-center px-6">
          <p className="landing-balance max-w-2xl text-center font-serif text-[clamp(1.5rem,3.6vw,2.4rem)] italic leading-snug text-chalk">
            And the old feeling reaches for you: the quiet panic of falling behind.
          </p>
        </motion.div>
      </section>

      {/* ---- The turn: night becomes day ---- */}
      <div ref={turnRef} className={reduce ? "bg-editorial-ivory" : ""}>
        <section className="flex min-h-[110svh] items-center justify-center px-6 py-24">
          <motion.div
            style={reduce ? undefined : { opacity: turnOpacity }}
            className="max-w-3xl text-center"
          >
            <motion.p
              style={reduce ? undefined : { color: turnInkSoft }}
              className={`text-base md:text-lg ${reduce ? "text-editorial-charcoal/70" : ""}`}
            >
              Except this time, the panic never arrives.
            </motion.p>
            <motion.h2
              style={reduce ? undefined : { color: turnInk }}
              className={`landing-balance mt-6 font-serif text-[clamp(2.2rem,6vw,4rem)] italic leading-[1.08] tracking-[-0.01em] ${reduce ? "text-editorial-charcoal" : ""}`}
            >
              You stay calm. You have a catch&#8209;net.
            </motion.h2>
            <motion.p
              style={reduce ? undefined : { color: turnInkSoft }}
              className={`landing-pretty mx-auto mt-7 max-w-xl text-base leading-relaxed md:text-lg ${reduce ? "text-editorial-charcoal/70" : ""}`}
            >
              Tonight, a patient teacher in your pocket will take that exact sentence
              and stay with you, as long as it takes, until it clicks.
            </motion.p>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
