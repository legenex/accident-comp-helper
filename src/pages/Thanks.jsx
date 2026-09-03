import React from "react";
import { CheckCircle2, Phone } from "lucide-react";

export default function Thanks() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Thank you</h1>
      <p className="mt-4 max-w-md text-white/70">
        Your request has been received. If you qualify, a participating attorney will reach out to you soon.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-white/55">
        <Phone className="h-4 w-4 text-brand" /> Keep your phone handy so you do not miss the call.
      </div>
    </div>
  );
}