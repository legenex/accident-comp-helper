import React, { useEffect } from "react";
import { QUIZ_URL } from "@/lib/siteContent";

// Survey entry point: every primary CTA routes to the quiz URL.
export default function ClaimCheck() {
  useEffect(() => {
    window.location.href = QUIZ_URL;
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
        <p className="mt-6 text-lg font-semibold">Taking you to the claim check...</p>
        <a href={QUIZ_URL} className="mt-4 inline-block text-sm text-brand underline">Click here if you are not redirected</a>
      </div>
    </div>
  );
}