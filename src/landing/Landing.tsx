/**
 * The public landing site, flat-playful edition (2026-07-11 redesign on the
 * kodland.webflow.io concept): white page, near-black ink, one loud cobalt,
 * lime pills, JetBrains Mono display voice, flat 2px corners, bold borders,
 * no shadows. Smoothness comes from transform-only hovers, staggered
 * whileInView rises, a self-drawing hero doodle, and native scroll-snap
 * rails.
 *
 * The story and the proof survived the re-skin intact: the 11:04 pm arc,
 * the REAL captured answers (rendered by the product's own components), the
 * situation-first feature guide, the honesty ledger, the ChatGPT comparison,
 * the mission, and the honest pricing sheet. All product content on this
 * page is genuine output. No mockups, no fabricated data, no fake proof.
 */
import { useEffect, useRef, useState } from "react";
import Login from "../Login";
import HourAct from "./HourAct";
import AnswerAct from "./AnswerAct";
import LadderSection from "./LadderSection";
import DoorsSection from "./DoorsSection";
import RegisterSection from "./RegisterSection";
import WhySection from "./WhySection";
import IndexCards from "./IndexCards";
import MissionSection from "./MissionSection";
import PricingSheet from "./PricingSheet";
import LampOff, { LandingFooter } from "./LampOff";

export type AuthMode = "login" | "signup";

export default function Landing() {
  const [auth, setAuth] = useState<AuthMode | null>(null);
  const wasAuth = useRef(false);

  // Swapping to the auth screen scrolls to its top; coming back restores
  // keyboard/screen-reader context by focusing the page title.
  useEffect(() => {
    if (auth) {
      wasAuth.current = true;
      window.scrollTo(0, 0);
    } else if (wasAuth.current) {
      wasAuth.current = false;
      document.getElementById("hero-title")?.focus({ preventScroll: true });
    }
  }, [auth]);

  if (auth) {
    return <Login initialMode={auth} onBack={() => setAuth(null)} />;
  }

  // DEV-ONLY: `?only=<name>` renders a single act at the top of the page so
  // design passes can screenshot each act as an initial paint. Statically
  // false in production builds, so the branch is tree-shaken (same pattern
  // as the `?preview=1` workspace mocks).
  if (import.meta.env.DEV) {
    const only = new URLSearchParams(window.location.search).get("only");
    if (only) {
      const acts: Record<string, React.ReactNode> = {
        hour: <HourAct onAuth={setAuth} />,
        answer: <AnswerAct />,
        ladder: <LadderSection />,
        doors: <DoorsSection />,
        cards: <IndexCards />,
        register: <RegisterSection />,
        why: <WhySection />,
        mission: <MissionSection />,
        pricing: <PricingSheet onAuth={setAuth} />,
        finale: <LampOff onAuth={setAuth} />,
      };
      return (
        <div className="bg-page font-sans text-ink antialiased">
          <main>{acts[only] ?? <p className="p-8">Unknown act: {only}</p>}</main>
        </div>
      );
    }
  }

  return (
    <div className="bg-page font-sans text-ink antialiased">
      <main>
        <HourAct onAuth={setAuth} />
        <AnswerAct />
        <LadderSection />
        <DoorsSection />
        <IndexCards />
        <RegisterSection />
        <WhySection />
        <MissionSection />
        <PricingSheet onAuth={setAuth} />
        <LampOff onAuth={setAuth} />
      </main>
      <LandingFooter onAuth={setAuth} />
    </div>
  );
}
