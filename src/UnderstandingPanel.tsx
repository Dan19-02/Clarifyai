/**
 * The Landing Signal, made visible: an HONEST per-concept understanding read.
 * It shows only what was measured, and it never claims "you understood this"
 * unless the backend confirmed it with a graded transfer check. Three states:
 *   landed     = a spaced-confirmed transfer pass (the real "you've got this")
 *   practiced  = one graded pass, not yet re-confirmed on a later day
 *   working_on_it = still being worked on (incl. any measured struggle)
 * Silent-first: the panel simply hides until there is something measured.
 */
import { useEffect, useState, useCallback } from "react";
import { CircleCheck, CircleDot, Sparkles } from "lucide-react";
import { api } from "./api";

interface Concept {
  key: string;
  label: string;
  chapter: string | null;
  state: "landed" | "practiced" | "working_on_it";
  struggles: number;
  passes: number;
}

interface Summary {
  landed: number;
  practiced: number;
  working: number;
}

/** Bumped by the workspace after every answer so the read stays fresh. */
export function UnderstandingPanel({ refreshKey }: { refreshKey: number }) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [summary, setSummary] = useState<Summary>({ landed: 0, practiced: 0, working: 0 });
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getComprehension();
      setEnabled(data.enabled);
      setConcepts(data.concepts as Concept[]);
      setSummary(data.summary);
    } catch {
      // A progress read must never disrupt studying: fail silent.
    }
  }, []);

  useEffect(() => {
    load();
    // The server records a verdict just AFTER the answer returns, so a fetch
    // fired the instant an answer lands can miss it: refetch once shortly after.
    const t = setTimeout(load, 3500);
    return () => clearTimeout(t);
  }, [load, refreshKey]);

  // Silent-first: nothing measured yet, or feature off -> render nothing.
  if (!enabled || concepts.length === 0) return null;

  // Landed and practiced first (the wins), then what is still being worked on.
  const order = { landed: 0, practiced: 1, working_on_it: 2 } as const;
  const sorted = [...concepts].sort((a, b) => order[a.state] - order[b.state]);

  const chip = (c: Concept) => {
    if (c.state === "landed")
      return { icon: CircleCheck, cls: "border-editorial-sage/40 bg-editorial-sage/10 text-editorial-sage" };
    if (c.state === "practiced")
      return { icon: CircleDot, cls: "border-editorial-line bg-editorial-stone text-editorial-charcoal/80" };
    return { icon: Sparkles, cls: "border-editorial-line-light bg-transparent text-editorial-charcoal/60" };
  };

  return (
    <div className="flex flex-col gap-2 border-t border-editorial-line pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between px-1 cursor-pointer text-editorial-sage"
      >
        <span className="kod-display text-sm">What's landing</span>
        <span className="text-[10px] text-editorial-charcoal/60">
          {summary.landed + summary.practiced}/{concepts.length}
        </span>
      </button>

      {open && (
        <>
          <p className="px-1 text-[11px] leading-snug text-editorial-charcoal/55">
            Measured from your own answers, never guessed. A concept only shows as landed once you have
            answered a fresh check on it correctly.
          </p>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            {sorted.map((c) => {
              const { icon: Icon, cls } = chip(c);
              return (
                <div
                  key={c.key}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${cls}`}
                  title={
                    c.state === "landed"
                      ? "You answered a fresh check on this correctly, more than once."
                      : c.state === "practiced"
                      ? "You answered a check on this correctly once. One more, another day, confirms it."
                      : c.struggles > 0
                      ? "Worth another look."
                      : "Still working on it."
                  }
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="flex-1 truncate text-xs">{c.label}</span>
                  <span className="text-[10px] opacity-70">
                    {c.state === "landed" ? "landed" : c.state === "practiced" ? "practiced" : c.struggles > 0 ? "revisit" : "working on it"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
