import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Phone, PhoneCall, ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/siteContent";

// Generic post-submission confirmation. Lighter than /submitted: the details
// are in, a specialist will call, and there is no qualification language.

const TRUST = [
  "Vetted, state-licensed attorneys",
  "No cost to check your match",
  "No obligation, your choice",
];

export default function Thanks() {
  const phone = SITE.phone;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  useEffect(() => {
    document.title = `Thank you | ${SITE.name}`;
  }, []);

  return (
    <main className="min-h-screen bg-navy px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-2xl sm:px-10 sm:py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>

          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-navy">
            Thank you.
          </h1>
          <p className="mt-1 font-display text-lg font-bold italic text-brand">
            We've received your details.
          </p>

          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-slate-600">
            A specialist will call you shortly to go over your options and answer any questions.{" "}
            <strong className="font-semibold text-navy">Please keep an eye on your phone.</strong>
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 rounded-xl bg-navy px-6 py-4 text-white">
            <PhoneCall className="h-5 w-5 shrink-0 text-brand" />
            <p className="text-sm font-semibold sm:text-base">Please make sure to answer your phone.</p>
          </div>

          <p className="mx-auto mt-5 max-w-lg text-xs italic leading-relaxed text-slate-500">
            <span className="font-semibold not-italic text-slate-600">Please note:</span> we can't go over
            your options or connect you with an attorney until we've spoken with you. The call may come from
            an unfamiliar number, so keep your phone close.
          </p>

          {telHref && (
            <div className="mt-8 rounded-xl bg-slate-50 px-6 py-8">
              <h2 className="font-heading text-lg font-bold text-navy">Don't want to wait? Call us now.</h2>
              <a
                href={telHref}
                className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 font-heading text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.03] hover:bg-brand-hover"
              >
                <Phone className="h-5 w-5" /> {phone}
              </a>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-6 text-left">
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

        <p className="mt-10 text-center text-xs text-white/35">
          &copy; {new Date().getFullYear()} Next Consulting LLC. All rights reserved. Not a law firm.
        </p>
      </div>
    </main>
  );
}
