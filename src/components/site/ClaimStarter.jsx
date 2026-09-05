import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Car, Truck, Bike, PersonStanding,
  HardHat, Footprints, Check, Lock, Clock,
} from "lucide-react";
import { QUIZ_URL, ACCIDENT_TYPES } from "@/lib/siteContent";

const ICONS = { Car, Truck, Bike, PersonStanding, HardHat, Footprints };

/**
 * The hero's right-hand card.
 *
 * The old version listed the four questions the quiz would ask, which
 * asked the visitor to read rather than to act. This makes the first
 * question of the quiz live on the page instead: picking an accident
 * type is a small commitment that carries straight through to the
 * survey via ?type=<slug>, so nobody answers the same thing twice.
 */
export default function ClaimStarter() {
  const [picked, setPicked] = useState(null);
  const options = ACCIDENT_TYPES.slice(0, 6);
  const href = picked ? `${QUIZ_URL}?type=${encodeURIComponent(picked)}` : QUIZ_URL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md rounded-2xl border border-white/15 bg-white/95 p-6 shadow-float backdrop-blur-xl sm:p-7"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand" />
        <span className="text-sm font-semibold text-navy">Free claim check</span>
        <span className="ml-auto text-xs font-medium text-admuted">Step 1 of 4</span>
      </div>

      <h3 className="mt-4 font-heading text-2xl font-bold leading-tight text-navy">
        What kind of accident was it?
      </h3>
      <p className="mt-2 text-sm text-admuted">
        Pick one to begin. You can change it later.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {options.map((t) => {
          const Icon = ICONS[t.icon] || Car;
          const on = picked === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setPicked(on ? null : t.slug)}
              aria-pressed={on}
              className={[
                "group relative flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-[13px] font-semibold transition-all duration-200",
                on
                  ? "border-brand bg-brand text-white shadow-lift"
                  : "border-border bg-secondary/50 text-navy hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white",
              ].join(" ")}
            >
              <Icon className={on ? "h-4 w-4 flex-shrink-0 text-white" : "h-4 w-4 flex-shrink-0 text-brand"} />
              <span className="leading-tight">{t.title.replace(" Accidents", "")}</span>
              {on && <Check className="ml-auto h-3.5 w-3.5 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={[
          "mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all",
          picked
            ? "bg-brand text-white shadow-lift hover:scale-[1.02] hover:bg-brand-hover"
            : "bg-navy text-white hover:bg-navy/90",
        ].join(" ")}
      >
        {picked ? "Continue" : "Start the claim check"}
        <ArrowRight className="h-4 w-4" />
      </a>

      <AnimatePresence initial={false}>
        {picked && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-center text-xs text-admuted"
          >
            <span className="mt-3 block">Your answer carries over. Three questions to go.</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-[11px] font-medium text-admuted">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> About 2 minutes</span>
        <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-brand" /> Confidential</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> No obligation</span>
      </div>
    </motion.div>
  );
}
