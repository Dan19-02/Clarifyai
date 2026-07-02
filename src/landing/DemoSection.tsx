/**
 * Act two: the product, teaching. Renders a REAL captured answer through the
 * product's own renderer (Markdown + NotebookViewer), so the landing page
 * shows the product, not a mockup of it. The notebook tabs are fully
 * explorable right here on the page.
 */
import { Sparkles, Brain, Search, CheckCircle2, Mic, Volume2 } from "lucide-react";
import { parseTeachingSections } from "../utils";
import { Markdown } from "../Markdown";
import { NotebookViewer } from "../NotebookViewer";
import { REAL_QUESTION, REAL_ANSWER } from "./realAnswer";

const parsed = parseTeachingSections(REAL_ANSWER);

export default function DemoSection() {
  return (
    <section id="watch" className="bg-editorial-ivory px-4 py-20 md:px-8 md:py-28" aria-label="A real answer from Clarify.AI">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="landing-balance font-serif text-[clamp(2.1rem,5vw,3.25rem)] italic leading-tight tracking-[-0.01em] text-editorial-charcoal">
            Watch it teach.
          </h2>
          <p className="landing-pretty max-w-md text-[15px] leading-relaxed text-editorial-charcoal/70">
            This is a real answer, exactly as a student sees it: the exam&#8209;ready
            answer first, then a nine&#8209;part study notebook. Tap through it.
            Even the diagram was drawn by the teacher.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-editorial-line bg-white shadow-sm">
          {/* App chrome, faithful to the real workspace toolbar. Decorative. */}
          <div aria-hidden="true" className="pointer-events-none flex items-center justify-between gap-3 border-b border-editorial-line px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-editorial-sage">
                <span className="font-serif text-xs italic leading-none text-editorial-ivory">C</span>
              </div>
              <span className="font-serif text-sm italic tracking-tight text-editorial-charcoal">Clarify.AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-full border border-editorial-line-light bg-editorial-stone/50 p-1 sm:flex">
                <span className="flex items-center gap-1.5 rounded-full border border-editorial-line bg-white px-3 py-1.5 text-xs font-medium text-editorial-charcoal shadow-sm">
                  <Sparkles size={13} /> Standard
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-editorial-charcoal/70">
                  <Brain size={13} /> Thinking
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-editorial-charcoal/70">
                  <Search size={13} /> Search
                </span>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-editorial-line bg-white px-3 py-1.5 text-xs font-medium text-editorial-charcoal/70 md:flex">
                <CheckCircle2 size={13} /> Deep-check
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border border-editorial-line bg-white px-3 py-1.5 text-xs font-medium text-editorial-charcoal/70 md:flex">
                <Mic size={13} /> Voice
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-5 bg-[#FAF9F6]/40 p-3 sm:p-5 md:p-8">
            {/* The student's question */}
            <div className="flex max-w-[92%] flex-col items-end self-end md:max-w-[75%]">
              <div className="mb-1 flex items-center gap-2 text-[10px] text-editorial-charcoal/70">
                <span>You</span>
                <span>&middot;</span>
                <span>Standard mode</span>
              </div>
              <div className="rounded-2xl rounded-tr-sm border border-editorial-line bg-editorial-stone p-4 text-sm text-editorial-charcoal shadow-sm md:p-5 md:text-base">
                {REAL_QUESTION}
              </div>
            </div>

            {/* The real answer, rendered by the real components */}
            <div className="flex max-w-full flex-col items-start self-start">
              <div className="mb-1 flex items-center gap-2 text-[10px] text-editorial-charcoal/70">
                <span>Clarify.AI</span>
                <span>&middot;</span>
                <span>generated live, unedited</span>
              </div>
              <div className="w-full min-w-0 rounded-2xl rounded-tl-sm border border-editorial-line-light bg-white p-4 text-sm leading-relaxed text-editorial-charcoal shadow-sm md:p-5 md:text-base">
                {parsed.preamble && (
                  <div className="mb-3">
                    <Markdown>{parsed.preamble}</Markdown>
                  </div>
                )}
                <NotebookViewer sections={parsed.sections} />
                <div aria-hidden="true" className="pointer-events-none mt-3 flex items-center justify-between gap-2 border-t border-editorial-line-light pt-2.5 select-none">
                  <span className="flex items-center gap-1.5 rounded-full border border-editorial-line-light bg-editorial-stone px-3 py-1 text-xs text-editorial-sage">
                    <Sparkles size={12} /> Still fuzzy? Explain differently
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-editorial-line-light bg-editorial-stone px-3 py-1 text-xs text-editorial-sage">
                    <Volume2 size={12} /> Listen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[13px] leading-relaxed text-editorial-charcoal/65">
          Generated by Clarify.AI on 2 July 2026 for a CBSE profile in Hinglish.
          Nothing above was staged or edited: the flowchart, the cricket question,
          the shopping&#8209;cart analogy, all of it came from the teacher.
        </p>
      </div>
    </section>
  );
}
