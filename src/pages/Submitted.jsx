import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { QUIZ_URL } from "@/lib/siteContent";

export default function Submitted() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Your answers are submitted</h1>
      <p className="mt-4 max-w-md text-white/70">
        Thanks for completing the claim check. We are reviewing your details and will be in touch if your situation may qualify.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-white/55">
        <ShieldCheck className="h-4 w-4 text-brand" /> Your information is kept confidential.
      </div>
      <a href={QUIZ_URL} target="_blank" rel="noopener noreferrer" className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
        Return to claim check
      </a>
    </div>
  );
}