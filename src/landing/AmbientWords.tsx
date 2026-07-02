/**
 * Faint school-blackboard phrases drifting behind a story section, so the long
 * ivory scroll feels like a classroom instead of an empty page. Decorative
 * only: aria-hidden, non-interactive, very low opacity, and pushed to the
 * margins so it never sits under body text. Pure CSS motion (.landing-drift),
 * so it degrades to a static scatter under prefers-reduced-motion.
 *
 * The parent section must be `relative overflow-hidden` and the real content
 * a higher stacking context (e.g. `relative z-[1]`), so these sit behind it.
 */
import { AMBIENT_SETS } from "./words";

export default function AmbientWords({ variant = 0 }: { variant?: number }) {
  const words = AMBIENT_SETS[variant % AMBIENT_SETS.length];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      {words.map((w) => (
        <span
          key={w.text}
          className={`landing-drift absolute whitespace-nowrap font-serif italic text-editorial-charcoal ${w.desktopOnly ? "hidden lg:block" : ""}`}
          style={{
            top: w.top,
            left: w.left,
            fontSize: w.size,
            opacity: w.opacity,
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
  );
}
