import React from "react";
import { cn } from "@/lib/utils";

// ACH brand logo. Wide wordmark for headers/footers/sidebar; square mark for favicon/collapsed rail.
// variant: "light" (white text, dark bg) | "dark" (navy text, light bg) | "mark" (icon only)

export function Mark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="164" height="164" rx="14" fill="#0B8DCF" />
      <path d="M32 14l14 5v9c0 9-6 16-14 19-8-3-14-10-14-19v-9l14-5z" fill="none" stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M25 32l5 5 9-10" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ variant = "dark", className, showMark = true }) {
  const light = variant === "light";
  const textColor = light ? "text-white" : "text-navy";
  const subColor = light ? "text-white/55" : "text-admuted";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showMark && <Mark className="h-9 w-9 flex-shrink-0" />}
      <div className="leading-none">
        <div className={cn("font-heading text-[17px] font-extrabold tracking-tight", textColor)}>
          Accident Compensation
        </div>
        <div className={cn("font-heading text-[17px] font-extrabold tracking-tight", textColor)}>
          Helper
        </div>
      </div>
    </div>
  );
}