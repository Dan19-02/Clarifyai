/**
 * Act five: this teacher knows which classroom you sit in. Boards, languages,
 * analogy worlds, photo doubts, voice. The language showcase quotes REAL
 * captured answers: the same physics idea asked to the live product in
 * English, Hinglish and Hindi (see realAnswer.ts for capture provenance).
 */
import { Camera, Mic, Compass } from "lucide-react";
import { REAL_VOICES } from "./realAnswer";
import AmbientWords from "./AmbientWords";

const BOARDS = ["CBSE", "ICSE", "State Board", "JEE", "NEET", "General Study"];

const WAYS = [
  {
    icon: Camera,
    title: "Photo doubts",
    body: "Stuck on a printed problem? Send a photo of the page and ask.",
  },
  {
    icon: Mic,
    title: "Voice sessions",
    body: "Talk it through out loud, like a tuition session that never checks the clock.",
  },
  {
    icon: Compass,
    title: "Your analogy world",
    body: "Cricket brain? Cooking brain? Choose the world your examples come from.",
  },
];

export default function EveryStudentSection() {
  return (
    <section className="relative overflow-hidden bg-editorial-ivory px-4 py-20 md:px-8 md:py-28" aria-label="Made for every Indian classroom">
      <AmbientWords variant={2} />
      <div className="relative z-[1] mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="landing-balance font-serif text-[clamp(2.1rem,5vw,3.25rem)] italic leading-tight tracking-[-0.01em] text-editorial-charcoal">
            It knows which classroom you sit in.
          </h2>
          <p className="landing-pretty mt-5 text-[15px] leading-relaxed text-editorial-charcoal/70 md:text-base">
            Not a generic chatbot with a syllabus stapled on. Tell it your board,
            your grade, your language and the analogies that make sense in your
            life, and every answer is shaped by them.
          </p>
        </div>

        {/* One idea, three real answers from the live teacher */}
        <div className="mt-12 flex flex-col divide-y divide-editorial-line rounded-3xl border border-editorial-line bg-white md:flex-row md:divide-x md:divide-y-0">
          {REAL_VOICES.map((v) => (
            <div key={v.tag} className="flex-1 p-6 md:p-8">
              <span lang={v.lang === "hi" ? "hi" : undefined} className="text-xs font-semibold text-editorial-sage">{v.tag}</span>
              <p lang={v.lang} className="landing-pretty mt-3 font-serif text-lg italic leading-relaxed text-editorial-charcoal md:text-xl">
                &ldquo;{v.line}&rdquo;
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-editorial-charcoal/65">
          One question, asked to the live teacher three times on 2 July 2026, once
          in each language. The English and Hinglish lines are complete answers,
          unedited; the Hindi line is the heart of a slightly longer reply.
        </p>

        <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
          {/* Boards */}
          <div>
            <p className="text-sm font-semibold text-editorial-charcoal">Tuned to your board and exam</p>
            <ul className="mt-3 flex max-w-md flex-wrap gap-2">
              {BOARDS.map((b) => (
                <li key={b} className="rounded-full border border-editorial-line bg-white px-4 py-1.5 text-sm text-editorial-charcoal/80">
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Ways in */}
          <div className="flex flex-1 flex-col gap-5 md:max-w-xl">
            {WAYS.map((w) => (
              <div key={w.title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-editorial-sage/10 text-editorial-sage">
                  <w.icon size={16} />
                </div>
                <p className="landing-pretty text-[15px] leading-relaxed text-editorial-charcoal/75">
                  <strong className="font-semibold text-editorial-charcoal">{w.title}.</strong> {w.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
