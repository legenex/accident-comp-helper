import React from "react";
import { Phone } from "lucide-react";
import { SITE } from "@/lib/siteContent";

// Ringba / TrueCall dynamic number insertion.
//
// Every phone link on the site carries class `__tc_dni_phone` so the TrueCall
// DNI script can swap in the tracking number at runtime. Until that script
// loads (or if it never does), the link falls back to the static number in
// SITE.phone, so the page always shows a working number.
//
// NOTE: the TrueCall loader <script> itself still needs to be pasted into
// index.html. See the comment in index.html.

export function PhoneLink({ className = "", iconClassName = "", showIcon = true, children }) {
  return (
    <a href={SITE.phoneHref} className={`__tc_dni_phone ${className}`}>
      {showIcon && <Phone className={iconClassName || "h-5 w-5"} />}
      {children || SITE.phone}
    </a>
  );
}

// Big pill CTA used on /submitted and /thanks.
export function PhoneButton({ className = "" }) {
  return (
    <PhoneLink
      className={`inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 font-heading text-xl font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:bg-brand-hover sm:text-2xl ${className}`}
      iconClassName="h-6 w-6"
    />
  );
}

// Header bar: logo left, "prefer to speak to someone" + number right.
export function PhoneHeader({ children }) {
  return (
    <header className="border-b border-white/10 bg-navy">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center">{children}</div>
        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
          <span className="text-xs text-white/70 sm:text-sm">Prefer to speak to someone right now?</span>
          <PhoneLink
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-base font-bold text-white transition-colors hover:bg-brand-hover"
            iconClassName="h-4 w-4"
          />
        </div>
      </div>
    </header>
  );
}

// Compact footer for the conversion pages (small, no nav columns).
export function MiniFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs leading-relaxed text-white/45">
          &copy; {new Date().getFullYear()} Next Consulting LLC. All rights reserved. {SITE.name} is not a law
          firm and does not provide legal advice.
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <a href="/privacy-policy" className="text-white/60 hover:text-white">Privacy Policy</a>
          <a href="/terms-of-service" className="text-white/60 hover:text-white">Terms and Conditions</a>
          <a href="/disclosures" className="text-white/60 hover:text-white">Disclosures</a>
          <a href="/partner-list" className="text-white/60 hover:text-white">Partners</a>
          <a href="/ca-notice" className="text-white/60 hover:text-white">California Notice</a>
        </nav>
      </div>
    </footer>
  );
}
