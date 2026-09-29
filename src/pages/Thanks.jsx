import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, PhoneCall, ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/siteContent";
import Logo from "@/components/site/Logo";
import { PhoneHeader, PhoneButton, MiniFooter } from "@/components/site/PhoneBits";

// Generic post-submission confirmation. Lighter than /submitted: the details
// are in, a specialist will call, and there is no qualification language.

const TRUST = [
  "Vetted, state-licensed attorneys",
  "No cost to check your match",
  "No obligation, your choice",
];

export default function Thanks() {
  useEffect(() => {
    document.title = `Thank you | ${SITE.name}`;
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <PhoneHeader>
        <Logo variant="light" className="h-16 w-auto sm:h-20" />
      </PhoneHeader>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl bg-white px-5 py-8 text-center shadow-2xl sm:px-10 sm:py-12 lg:px-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>

            <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
              <span className="font-black text-brand">THANK YOU.</span>
            </h1>
            <p className="mt-2 font-display text-lg font-bold italic text-brand sm:text-xl">
              We've received your details.
            </p>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
              A specialist will call you shortly to go over your options and answer any questions.{" "}
              <strong className="font-semibold text-navy">Please keep an eye on your phone.</strong>
            </p>

            <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-3 rounded-xl bg-navy px-6 py-4 text-white">
              <PhoneCall className="h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm font-semibold sm:text-base">Please make sure to answer your phone.</p>
            </div>

            <p className="mx-auto mt-5 max-w-xl text-xs italic leading-relaxed text-slate-500">
              <span className="font-semibold not-italic text-slate-600">Please note:</span> we can't go over
              your options or connect you with an attorney until we've spoken with you. The call may come from
              an unfamiliar number, so keep your phone close.
            </p>

            <div className="mt-9 rounded-2xl bg-brand-soft px-5 py-8 sm:px-8">
              <p className="font-heading text-lg font-bold text-navy sm:text-xl">
                Don't wanna wait? Click the button below to call now, and fast track your claim.
              </p>
              <div className="mt-5">
                <PhoneButton />
              </div>
              <p className="mt-4 text-xs text-slate-500">Speak with a specialist now and skip the wait.</p>
            </div>

            <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-slate-200 bg-white px-6 py-6 text-left">
              <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold text-navy">
                <Check className="h-4 w-4 text-brand" strokeWidth={3} /> No cost, no obligation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                There is no cost to check your match. Most accident attorneys work on contingency, so there is
                typically no upfront cost to find out whether your situation is one they handle. Whether you
                move forward is always your choice.
              </p>
            </div>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="h-4 w-4 shrink-0 text-brand" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <MiniFooter />
    </div>
  );
}