import React, { useEffect } from "react";
import { Phone, Clock, Check, PhoneCall } from "lucide-react";
import { SITE } from "@/lib/siteContent";
import PublicFooter from "@/components/site/PublicFooter";

// Post-submission page: the lead has completed the quiz and a specialist is
// about to call. The single job of this page is to get them to answer that
// call, so there is one action only and no competing links.

const STEPS = [
  {
    title: "We call you, in the next few minutes",
    body: "A specialist calls the number you gave us to confirm your details and connect you with the right attorney.",
    emphasis: "Please answer.",
    now: true,
  },
  {
    title: "Your case is reviewed",
    body: "An attorney who handles your type of accident in your state looks over what you told us to see whether it's a fit.",
  },
  {
    title: "You're introduced to your match",
    body: "If it's a fit, you're connected directly. Most accident attorneys work on contingency, so there is typically no upfront cost to find out whether your situation is one they handle.",
  },
  {
    title: "You decide",
    body: "Whether to move forward is always your choice. No obligation, no pressure.",
  },
];

const TRUST = [
  "Vetted, state-licensed attorneys",
  "No cost to check your match",
  "No obligation, your choice",
];

export default function Submitted() {
  const phone = SITE.phone;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  useEffect(() => {
    document.title = `We'll be calling you | ${SITE.name}`;
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-navy">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Primary card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
            {/* Call incoming alert */}
            <div className="mx-auto max-w-sm rounded-xl border-2 border-brand bg-navy px-6 py-6 shadow-lg">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                <Phone className="h-5 w-5" />
              </div>
              <p className="mt-4 font-heading text-lg font-bold text-white">Important: call incoming</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                Keep your phone nearby
              </p>
            </div>

            <h1 className="mt-8 font-heading text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">
              Congratulations. We'll be{" "}
              <span className="block font-display italic text-brand">calling you.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-slate-600">
              Based on your answers, you may be a strong match for an attorney in our network who handles
              your type of accident in your state.{" "}
              <strong className="font-semibold text-navy">
                A specialist will call you in the next few minutes
              </strong>{" "}
              to go over the details and make the connection.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 rounded-xl bg-navy px-6 py-4 text-white">
              <PhoneCall className="h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm font-semibold sm:text-base">Please make sure to answer your phone.</p>
            </div>

            <p className="mx-auto mt-5 max-w-lg text-xs italic leading-relaxed text-slate-500">
              <span className="font-semibold not-italic text-slate-600">Please note:</span> we can't confirm
              your match or connect you with an attorney until we've spoken with you. The call may come from
              an unfamiliar number, so keep your phone close.
            </p>
          </div>

          {/* What happens next */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-10 sm:px-10">
            <h2 className="flex items-center justify-center gap-2 font-heading text-xl font-bold text-navy">
              <Clock className="h-5 w-5 text-brand" /> What happens next
            </h2>

            <ol className="mt-6 space-y-3">
              {STEPS.map((step, i) => (
                <li
                  key={i}
                  className={`relative rounded-xl border bg-white px-5 py-4 ${
                    step.now ? "border-brand ring-1 ring-brand/30" : "border-slate-200"
                  }`}
                >
                  {step.now && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Now
                    </span>
                  )}
                  <div className="flex gap-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        step.now ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step.now ? <Phone className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-heading text-[15px] font-bold text-navy">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {step.body}
                        {step.emphasis && (
                          <strong className="ml-1 font-semibold text-navy">{step.emphasis}</strong>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Call now */}
        {telHref && (
          <div className="mt-6 rounded-2xl border border-navyline bg-panel px-6 py-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-white">Don't want to wait?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
              You can call us now and we'll get started on confirming your match right away.
            </p>
            <a
              href={telHref}
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 font-heading text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.03] hover:bg-brand-hover"
            >
              <Phone className="h-5 w-5" /> {phone}
            </a>
            <p className="mt-4 text-xs text-white/50">Speak with a specialist now and skip the wait.</p>
          </div>
        )}

        {/* Trust row */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-white/70">
              <Check className="h-4 w-4 shrink-0 text-brand" /> {item}
            </li>
          ))}
        </ul>
      </div>

      <PublicFooter />
    </main>
  );
}
