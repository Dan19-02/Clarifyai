/**
 * Act six, flat-playful edition: pricing as one honest flat sheet. Plans as
 * ledger rows with mono prices, one calm call to action, and the terms
 * printed at the foot like a receipt. The paragraph for the parent stays the
 * flattest, most honest text on the page, on purpose.
 */
import { motion } from "motion/react";
import type { AuthMode } from "./Landing";
import { useCalm, sheetRise } from "./reveals";

interface PricingSheetProps {
  onAuth: (mode: AuthMode) => void;
}

const NOTEBOOK_PERK =
  "Adds the Pre-exam revision notebook: save the lines that click, auto-filed by chapter, with Clarify notes for revision.";

const PLANS = [
  {
    name: "Starter",
    price: "₹199",
    queries: "100 queries a month",
    note: "About three questions a day. Room to breathe for daily doubts.",
    perk: null as string | null,
    featured: false,
  },
  {
    name: "Regular",
    price: "₹499",
    queries: "300 queries a month",
    note: "Serious study fuel: ten a day for daily learning and exam season revision.",
    perk: NOTEBOOK_PERK,
    featured: false,
  },
  {
    name: "Unlimited",
    price: "₹999",
    queries: "Unlimited queries",
    note: "The whole catch-net. Never ration your curiosity, never count a question.",
    perk: NOTEBOOK_PERK,
    featured: true,
  },
];

const INCLUDED = [
  "All boards: CBSE, ICSE, State, JEE, NEET",
  "English, Hinglish and Hindi",
  "Nine-part answer notebook with every answer, on every plan",
  "Deep-check examiner pass",
  "Photo doubts and voice sessions",
  "Re-explains, follow-ups and Deep-checks never count as queries",
  "A photo doubt is one query, same as a typed question",
];

export default function PricingSheet({ onAuth }: PricingSheetProps) {
  const calm = useCalm();

  return (
    <section id="pricing" className="landing-cv landing-cv-pricing bg-page px-5 py-16 text-ink md:px-8 md:py-24" aria-label="Pricing">
      <div className="mx-auto max-w-[960px]">
        <motion.div {...sheetRise(calm)} className="rounded-[2px] border-2 border-ink bg-page p-6 sm:p-10 md:p-12">
          <p className="kod-pill inline-block bg-lime text-pill-ink">one week free, no card</p>
          <h2 className="kod-display landing-balance mt-4 max-w-2xl text-[clamp(1.7rem,4.5vw,2.6rem)] leading-[1.1] text-ink">
            Priced like a notebook, not a coaching class.
          </h2>
          <p className="landing-pretty mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-dim md:text-base">
            Every new student gets one week free from the day they join: up to 10
            questions a day, never more, no card needed. After that, from ₹199 a
            month for a teacher who never runs out of patience. One query is one
            new question answered, and being re-taught is never penalised: every
            Still fuzzy re-explain, every follow-up on the same doubt, every
            Deep-check and notebook comes free with that question. So one Newton
            doubt with four re-explains, two follow-ups and a Deep-check is
            still one query.
          </p>

          {/* The plans as flat ledger rows */}
          <div className="mt-10">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`grid gap-x-6 gap-y-1 border-t-2 py-6 sm:grid-cols-[minmax(7rem,10rem)_minmax(6.5rem,auto)_1fr] sm:items-baseline md:py-7 ${
                  plan.featured ? "border-t-cobalt-bright bg-chip px-4 sm:px-5" : "border-t-ink-line"
                }`}
              >
                <h3 className="kod-display text-lg text-cobalt-bright">{plan.name}</h3>
                <p className="flex items-baseline gap-1">
                  <span className="kod-display text-[clamp(1.9rem,4vw,2.6rem)] leading-none tracking-tight text-ink">
                    {plan.price}
                  </span>
                  <span className="text-xs text-ink-dim">/ month</span>
                </p>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{plan.queries}</p>
                  <p className="landing-pretty mt-1 text-sm leading-relaxed text-ink-dim">{plan.note}</p>
                  {plan.perk && (
                    <p className="landing-pretty mt-1.5 text-[13px] font-medium leading-relaxed text-cobalt-bright">
                      {plan.perk}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* One calm ask */}
          <div className="mt-8 flex flex-col items-start gap-3 border-t-2 border-ink-line pt-8 sm:flex-row sm:items-center sm:gap-5">
            <button
              onClick={() => onAuth("signup")}
              className="kod-btn px-8 py-3.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Start your free week
            </button>
            <p className="text-sm text-ink-dim">
              No card needed. Pick a plan only if the teacher earns it.
            </p>
          </div>

          <p className="landing-pretty mt-8 max-w-2xl text-[15px] leading-relaxed text-ink">
            For the parent reading this: every plan is a one-time payment for 30
            days through Razorpay. No auto-renewal, no lock-in, no countdown
            offers. If we stop being useful, you simply do not buy the next month.
          </p>

          {/* The receipt foot */}
          <div className="mt-8 border-t-2 border-ink-line pt-6">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row">
              <p className="kod-display shrink-0 text-sm text-ink">Every plan gets the whole teacher:</p>
              <ul className="flex max-w-2xl flex-wrap gap-x-5 gap-y-1.5">
                {INCLUDED.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-ink-dim">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-ink-dim">
              Prices in INR. Every new account starts with one free week, up to 10
              questions a day. Each plan is a one-time payment for 30 days, with no
              auto-renewal: you choose again each month. Buying a plan ends the free
              week and your plan starts right away. Secure checkout by Razorpay.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
