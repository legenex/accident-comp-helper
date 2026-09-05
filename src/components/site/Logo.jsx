import React from "react";
import { cn } from "@/lib/utils";

/**
 * ACH brand logo.
 *
 * Drop the real artwork into /public/brand/ using exactly these names and
 * it is picked up automatically, no code change needed:
 *
 *   /public/brand/ach-mark.svg        square mark  (favicon, collapsed rail)
 *   /public/brand/ach-wordmark.svg    wide lockup, dark text on light
 *   /public/brand/ach-wordmark-light.svg   wide lockup, white text on navy
 *
 * Until those files exist, the inline fallback below renders instead.
 * The fallback is deliberately close to the real mark, but it is a
 * placeholder: ship the real files before launch.
 */

const MARK_SRC = "/brand/ach-mark.svg";
const WORDMARK_SRC = {
  dark: "/brand/ach-wordmark.svg",
  light: "/brand/ach-wordmark-light.svg",
};

/** Inline fallback mark. viewBox and rect now actually agree (they did not before). */
export function Mark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Accident Compensation Helper">
      <rect width="64" height="64" rx="14" fill="#028CC9" />
      <path
        d="M32 14l14 5v9c0 9-6 16-14 19-8-3-14-10-14-19v-9l14-5z"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M25 32l5 5 9-10"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Tries the real asset first and quietly falls back to the inline SVG if
 * the file is not there yet, so a missing logo never shows a broken image.
 */
function SmartImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = React.useState(false);
  if (failed || !src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      decoding="async"
    />
  );
}

export default function Logo({ variant = "dark", className, showMark = true, wordmark = true }) {
  const light = variant === "light";
  const textColor = light ? "text-white" : "text-navy";

  if (variant === "mark" || !wordmark) {
    return (
      <SmartImage
        src={MARK_SRC}
        alt="Accident Compensation Helper"
        className={cn("h-9 w-9", className)}
        fallback={<Mark className={cn("h-9 w-9", className)} />}
      />
    );
  }

  const inlineLockup = (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showMark && <Mark className="h-9 w-9 flex-shrink-0" />}
      <div className="leading-[1.05]">
        <div className={cn("font-heading text-[17px] font-extrabold tracking-tight", textColor)}>
          Accident Compensation
        </div>
        <div className={cn("font-heading text-[17px] font-extrabold tracking-tight", textColor)}>
          Helper
        </div>
      </div>
    </div>
  );

  return (
    <SmartImage
      src={WORDMARK_SRC[light ? "light" : "dark"]}
      alt="Accident Compensation Helper"
      className={cn("h-9 w-auto", className)}
      fallback={inlineLockup}
    />
  );
}
