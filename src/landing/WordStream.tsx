/**
 * A continuous river of school words and formulas flowing left to right behind
 * a story section, so no screen ever feels empty. Several marquee lanes at
 * different heights, sizes, and speeds. Decorative only: aria-hidden,
 * non-interactive, behind content (z-0; the real content must be a higher
 * stacking context, e.g. `relative z-10`).
 *
 * tone="dark"  -> chalk words for the night sections.
 * tone="light" -> charcoal words for the ivory sections (nudged brighter, since
 *                 charcoal on ivory needs more presence to read).
 *
 * Pure CSS motion (.wordstream-lane), so it degrades to a static, still-visible
 * scatter under prefers-reduced-motion and never depends on JS to appear.
 */
import { WORD_LANES } from "./words";

export default function WordStream({ tone }: { tone: "light" | "dark" }) {
  const color = tone === "dark" ? "text-chalk" : "text-editorial-charcoal";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      {WORD_LANES.map((lane, i) => {
        const opacity = tone === "light" ? Math.min(0.22, lane.opacity * 1.5) : lane.opacity;
        return (
          <div
            key={i}
            className={`wordstream-lane absolute left-0 flex w-max flex-nowrap items-center font-serif italic ${color} ${
              lane.desktopOnly ? "hidden lg:flex" : ""
            }`}
            style={{ top: lane.top, opacity, fontSize: lane.size, ["--dur" as string]: lane.dur }}
          >
            {/* Two identical strips: translating one strip width loops seamlessly. */}
            <LaneStrip words={lane.words} />
            <LaneStrip words={lane.words} />
          </div>
        );
      })}
    </div>
  );
}

function LaneStrip({ words }: { words: string[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="mx-5 whitespace-nowrap md:mx-8">
          {w}
        </span>
      ))}
    </div>
  );
}
