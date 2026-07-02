/**
 * The public landing site: the story a signed-out visitor walks through.
 *
 * One long scroll that performs the product's promise. It opens in the dark
 * of a classroom where a phrase flies past, turns to the app's ivory as the
 * catch-net appears, shows the REAL product answering that exact phrase
 * (captured live, unedited), climbs the re-explain ladder, states the honesty
 * machinery, and closes back in the night, calm now.
 *
 * All product content on this page is genuine output rendered through the
 * product's own components. No mockups, no fabricated data, no fake proof.
 */
import { useEffect, useRef, useState } from "react";
import Login from "../Login";
import NightAct from "./NightAct";
import DemoSection from "./DemoSection";
import LadderSection from "./LadderSection";
import TruthSection from "./TruthSection";
import EveryStudentSection from "./EveryStudentSection";
import PricingSection from "./PricingSection";
import FinaleSection, { LandingFooter } from "./FinaleSection";

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

  return (
    <div className="bg-editorial-ivory font-sans text-editorial-charcoal antialiased">
      <main>
        <NightAct onAuth={setAuth} />
        <DemoSection />
        <LadderSection />
        <TruthSection />
        <EveryStudentSection />
        <PricingSection onAuth={setAuth} />
        <FinaleSection onAuth={setAuth} />
      </main>
      <LandingFooter onAuth={setAuth} />
    </div>
  );
}
