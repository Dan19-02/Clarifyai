/**
 * Static scattered school words behind a story section, in the same spirit as
 * the hero: no movement, just calm words resting in the empty space. Placed to
 * never overlap the reading content (top/bottom padding bands, and side margins
 * only on very wide screens). Decorative only: aria-hidden, non-interactive,
 * behind content (z-0; content sits at a higher stacking context, z-10).
 *
 * tone="dark"  -> chalk words for the night sections.
 * tone="light" -> charcoal words for the ivory/stone sections.
 */
import { DARK_SCATTER, LIGHT_SCATTER, type ScatterWord } from "./words";

const SHOW_CLASS: Record<NonNullable<ScatterWord["show"]>, string> = {
  lg: "hidden lg:block",
  "2xl": "hidden 2xl:block",
};

export default function ScatterWords({ tone }: { tone: "light" | "dark" }) {
  const words = tone === "dark" ? DARK_SCATTER : LIGHT_SCATTER;
  const color = tone === "dark" ? "text-chalk" : "text-editorial-charcoal";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      {words.map((w, i) => (
        <span
          key={i}
          className={`absolute whitespace-nowrap font-serif italic ${color} ${w.show ? SHOW_CLASS[w.show] : ""}`}
          style={{
            top: w.top,
            bottom: w.bottom,
            left: w.left,
            fontSize: w.size,
            opacity: w.opacity,
            transform: `rotate(${w.rot})`,
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
