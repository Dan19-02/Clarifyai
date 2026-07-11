/**
 * Ready to Land: the daily confirm queue. Clarify's first reason to open the
 * app WITHOUT being confused.
 *
 * A practiced concept (one examiner-graded pass) becomes "landed" only after a
 * second pass on a LATER day. This card surfaces at most three such concepts
 * on a fresh open: tap one, the server poses a fresh transfer question, you
 * answer it in the normal chat, and a PASS promotes it for good.
 *
 * Anxiety guardrails, by construction:
 * - max 3 chips, framed as locking in a win, never as a quiz or homework;
 * - fully dismissible, never re-nags the same day, skips carry no debt;
 * - it costs no credits (the reply rides the free follow-up path);
 * - a FAIL simply returns the concept to working-on-it with a warm
 *   re-explanation in chat. Nothing here ever shows red.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { CircleDot, X } from "lucide-react";

export interface ReadyConcept {
  key: string;
  label: string;
  chapter: string | null;
}

function copy(language: string) {
  if (language === "Hindi")
    return { title: "आज पक्का करने के लिए तैयार", sub: "30 seconds का एक छोटा check · कोई credit नहीं लगता", skip: "आज नहीं" };
  if (language === "English")
    return { title: "Ready to land", sub: "One 30 second check · costs no credits", skip: "Not today" };
  return { title: "Aaj pakka karne ke liye ready", sub: "Ek 30 second ka check · koi credit nahin lagta", skip: "Aaj nahin" };
}

export function ReadyToLandCard({
  ready,
  busy,
  language,
  onConfirm,
  onDismiss,
}: {
  ready: ReadyConcept[];
  busy: boolean;
  language: string;
  onConfirm: (c: ReadyConcept) => void;
  onDismiss: () => void;
}) {
  const [tapped, setTapped] = useState<string | null>(null);
  const c = copy(language);
  if (ready.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="mt-3 rounded-2xl border border-editorial-sage/35 bg-editorial-sage/5 px-4 py-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kod-display text-sm text-editorial-sage">{c.title}</p>
          <p className="mt-0.5 text-[11px] text-editorial-charcoal/60">{c.sub}</p>
        </div>
        <button
          onClick={onDismiss}
          title={c.skip}
          aria-label={c.skip}
          className="shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-editorial-charcoal/50 hover:bg-editorial-stone hover:text-editorial-charcoal transition-colors cursor-pointer"
          id="btn-rtl-dismiss"
        >
          {c.skip} <X size={12} />
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {ready.map((r) => (
          <button
            key={r.key}
            disabled={busy}
            title={`One quick check on ${r.label}. Pass it today and it is yours for good`}
            onClick={() => {
              setTapped(r.key);
              onConfirm(r);
            }}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-editorial-sage/40 bg-surface px-3.5 py-1.5 text-xs text-editorial-sage hover:bg-editorial-sage hover:text-white transition-all disabled:opacity-50 cursor-pointer motion-safe:active:scale-[0.97]"
            id={`btn-rtl-${r.key}`}
          >
            <CircleDot size={12} className="shrink-0" />
            <span className="max-w-56 truncate">{r.label}</span>
            {busy && tapped === r.key && <span className="cfy-dotpulse" aria-hidden />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
