/**
 * Act six: pricing. Calm and honest, no urgency theatre. The Unlimited plan
 * wears the night palette: the story's darkness, now owned.
 */
import type { AuthMode } from "./Landing";

interface PricingSectionProps {
  onAuth: (mode: AuthMode) => void;
}

const PLANS = [
  {
    name: "Starter",
    price: "₹199",
    queries: "150 queries a month",
    note: "About five questions a day. Room to breathe for daily doubts.",
    featured: false,
  },
  {
    name: "Regular",
    price: "₹499",
    queries: "400 queries a month",
    note: "Serious study fuel: enough for daily learning and exam season revision.",
    featured: false,
  },
  {
    name: "Unlimited",
    price: "₹999",
    queries: "Unlimited queries",
    note: "The whole catch-net. Never ration your curiosity, never count a question.",
    featured: true,
  },
];

const INCLUDED = [
  "All boards: CBSE, ICSE, State, JEE, NEET",
  "English, Hinglish and Hindi",
  "Exam-ready answers + the nine-part notebook",
  "Deep-check examiner pass",
  "Photo doubts and voice sessions",
];

export default function PricingSection({ onAuth }: PricingSectionProps) {
  return (
    <section id="pricing" className="border-t border-editorial-line bg-editorial-ivory px-4 py-20 md:px-8 md:py-28" aria-label="Pricing">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="landing-balance font-serif text-[clamp(2.1rem,5vw,3.25rem)] italic leading-tight tracking-[-0.01em] text-editorial-charcoal">
            Priced like a notebook, not a coaching class.
          </h2>
          <p className="landing-pretty mt-5 text-[15px] leading-relaxed text-editorial-charcoal/70 md:text-base">
            From ₹199 a month for a teacher who never runs out of patience.
            One query is one question answered.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-3xl p-7 md:p-8 ${
                plan.featured
                  ? "bg-night text-chalk"
                  : "border border-editorial-line bg-white text-editorial-charcoal"
              }`}
            >
              <h3 className={`font-serif text-xl italic ${plan.featured ? "text-sage-bright" : "text-editorial-sage"}`}>
                {plan.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-serif text-5xl italic tracking-tight">{plan.price}</span>
                <span className={`text-sm ${plan.featured ? "text-chalk-dim" : "text-editorial-charcoal/65"}`}>/ month</span>
              </p>
              <p className="mt-4 text-[15px] font-semibold">{plan.queries}</p>
              <p className={`landing-pretty mt-2 flex-1 text-sm leading-relaxed ${plan.featured ? "text-chalk-dim" : "text-editorial-charcoal/70"}`}>
                {plan.note}
              </p>
              <button
                onClick={() => onAuth("signup")}
                className={`mt-7 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.featured
                    ? "bg-sage-bright text-night focus-visible:outline-sage-bright"
                    : "bg-editorial-charcoal text-white focus-visible:outline-editorial-sage"
                }`}
              >
                Start free today
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-sm font-semibold text-editorial-charcoal">Every plan gets the whole teacher:</p>
          <ul className="flex max-w-3xl flex-wrap gap-x-5 gap-y-1.5">
            {INCLUDED.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-editorial-charcoal/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-[13px] text-editorial-charcoal/65">
          Prices in INR. Every new account is free while we are in early access;
          plans switch on at public launch, and you will be able to cancel anytime.
        </p>
      </div>
    </section>
  );
}
