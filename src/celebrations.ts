/**
 * The celebration system: Clarify's honest dopamine layer.
 *
 * Rules (non-negotiable, they keep the calm brand intact):
 * - A PAKKA celebration fires ONLY on an examiner-verified mastery transition
 *   (practiced/landed) observed from the server's comprehension read. Never on
 *   a self-reported "got it".
 * - Failure is never celebrated, colored red, or scored. It simply is not here.
 * - Session caps keep it special: at most 4 PAKKA moments and 7 celebrations
 *   total per browser session, then the app goes quietly back to work.
 * - Each distinct moment fires ONCE ever per account (localStorage claims), so
 *   a reload never replays yesterday's win.
 * - No em or en dashes anywhere (app-wide punctuation rule).
 */

export type CelebrationTone = "practiced" | "landed" | "star" | "milestone" | "parchi";

export interface Celebration {
  tone: CelebrationTone;
  title: string;
  sub?: string;
  conceptKey?: string;
}

// ---- Session caps ----------------------------------------------------------

const PAKKA_SESSION_CAP = 4;
const TOTAL_SESSION_CAP = 7;
let pakkaFired = 0;
let totalFired = 0;

/** May a celebration of this tone still fire this session? */
export function canFire(tone: CelebrationTone): boolean {
  if (totalFired >= TOTAL_SESSION_CAP) return false;
  if ((tone === "practiced" || tone === "landed" || tone === "star") && pakkaFired >= PAKKA_SESSION_CAP) return false;
  return true;
}

export function markFired(tone: CelebrationTone): void {
  totalFired++;
  if (tone === "practiced" || tone === "landed" || tone === "star") pakkaFired++;
}

/** One-shot localStorage claim: returns true the FIRST time a key is claimed,
 *  false ever after. Storage failures fail open (celebrate rather than dedupe:
 *  a rare repeat beats a swallowed win). */
export function claimOnce(key: string): boolean {
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

// ---- Milestone ladders ------------------------------------------------------

export const DOUBT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
export const SAVE_MILESTONES = [10, 25, 50, 100, 200];
export const PARCHI_THRESHOLDS = [10, 25, 50];

// ---- Copy bank --------------------------------------------------------------

type Lang = "English" | "Hindi" | "Hinglish";
const langOf = (language: string): Lang => (language === "English" ? "English" : language === "Hindi" ? "Hindi" : "Hinglish");

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** A first graded pass: the concept is practiced. The sub line plants
 *  tomorrow's confirm at the peak of the moment. */
export function practicedCopy(language: string, label: string): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi")
    return {
      title: pick([`समझ आ गया! ${label}: पक्का ✨`, `${label}: बैठ गया ✨`]),
      sub: "कल एक छोटा check, फिर यह हमेशा के लिए पक्का।",
    };
  if (l === "English")
    return {
      // Avoid the word "landed" here: that is reserved for the confirmed state.
      title: pick([`That clicked! ${label} ✨`, `Got it: ${label} ✨`]),
      sub: "Confirm it tomorrow and it is yours for good.",
    };
  return {
    title: pick([`Samajh aa gaya! ${label}: PAKKA ✨`, `${label}: baith gaya! ✨`, `Wah! ${label} clear ✨`]),
    sub: "Kal confirm karo, hamesha ke liye pakka ho jayega.",
  };
}

/** The big one: a second pass on a later day. Spaced, examiner-verified. */
export function landedCopy(language: string, label: string): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi")
    return {
      title: `${label}: पक्का हो गया 🌟`,
      sub: "दो अलग दिन, दो सही जवाब। यह अब सच में आपका है।",
    };
  if (l === "English")
    return {
      title: `LANDED: ${label} 🌟`,
      sub: "Right on two different days. This one is truly yours now.",
    };
  return {
    title: pick([`PAKKA ho gaya! ${label} 🌟`, `${label}: LANDED 🌟`]),
    sub: "Do alag din, do sahi jawaab. Yeh ab sach mein aapka hai.",
  };
}

/** A trial student's very first PAKKA: their First Star. */
export function firstStarCopy(language: string, label: string): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi")
    return { title: `⭐ आपका पहला star! ${label}: पक्का`, sub: "कल confirm करो, हमेशा के लिए पक्का हो जाएगा।" };
  if (l === "English")
    return { title: `⭐ Your first star! ${label} landed.`, sub: "Confirm it tomorrow and it is yours for good." };
  return { title: `⭐ Aapka pehla star! ${label}: PAKKA`, sub: "Kal confirm karo, hamesha ke liye pakka ho jayega." };
}

export function doubtsMilestoneCopy(language: string, n: number): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi") return { title: `${n} doubts साफ़ 🎉`, sub: "हर doubt जो आपने पूछा, हिम्मत का काम था।" };
  if (l === "English") return { title: `${n} doubts cleared 🎉`, sub: "Every one of them took the courage to ask." };
  return { title: `${n} doubts cleared 🎉`, sub: "Har doubt poochhna himmat ka kaam tha. Keep going!" };
}

export function savesMilestoneCopy(language: string, n: number): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi") return { title: `${n} points आपके notebook में 📒`, sub: "Exam के दिन सब एक जगह मिलेंगे।" };
  if (l === "English") return { title: `${n} points in your notebook 📒`, sub: "On exam day they are all in one place, waiting." };
  return { title: `${n} points aapke notebook mein 📒`, sub: "Exam ke din sab ek jagah milenge." };
}

export function parchiCopy(language: string, subject: string, chapter: string, n: number): { title: string; sub: string } {
  const l = langOf(language);
  if (l === "Hindi")
    return { title: `${chapter}: parchi तैयार 📄`, sub: `${subject} के इस chapter में ${n} points। Notebook में Clarify notes देखो।` };
  if (l === "English")
    return { title: `${chapter}: parchi ready 📄`, sub: `${n} points saved in this ${subject} chapter. Open Clarify notes in your notebook.` };
  return { title: `${chapter}: parchi taiyaar 📄`, sub: `${subject} ke is chapter mein ${n} points. Notebook mein Clarify notes dekho.` };
}

/** The save-lines running-count toast (a toast, not an overlay). */
export function savedToast(language: string, n: number): string {
  const l = langOf(language);
  if (l === "Hindi") return `+1 · ${n} points saved · exam के दिन सब एक जगह`;
  if (l === "English") return `+1 · ${n} points saved · all in one place on exam day`;
  return `+1 · ${n} points saved · exam ke din sab ek jagah`;
}

/** The diya greeting on the day's first answer. Counts the days a student
 *  showed up. There is no streak to break: a quiet day simply is not counted,
 *  it never subtracts. (We avoid promising the number can never move, since it
 *  is derived from the study log the student themselves can prune.) */
export function diyaGreeting(language: string, daysActive: number): string {
  const l = langOf(language);
  if (l === "Hindi") return `🪔 Din ${daysActive}: आज भी आए। बस यही असली जीत है।`;
  if (l === "English") return `🪔 Day ${daysActive}: you showed up. That is the real win.`;
  return pick([
    `🪔 Din ${daysActive}: aaj bhi aaye. Bas yahi asli jeet hai.`,
    `🪔 Din ${daysActive}: you showed up today. Shabaash.`,
  ]);
}

export function diyaTitle(language: string, daysActive: number, activeToday: boolean): string {
  const l = langOf(language);
  const base =
    l === "Hindi"
      ? `${daysActive} दिन आप पढ़ने आए। कोई दिन छूटे तो कुछ घटता नहीं।`
      : l === "English"
      ? `${daysActive} days you showed up. Miss a day and nothing is taken away.`
      : `${daysActive} din aap padhne aaye. Koi din chhoote to kuch ghatta nahin.`;
  if (activeToday) return base;
  return base + (l === "English" ? " Ask anything today to light the diya." : l === "Hindi" ? " आज कुछ भी पूछो, दीया जल जाएगा।" : " Aaj kuch bhi poochho, diya jal jaayega.");
}
