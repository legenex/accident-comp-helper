import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUIZ_URL } from "@/lib/siteContent";

export function CTAButton({ to = QUIZ_URL, children = "Check My Claim", className, external = true, size = "md" }) {
  const sizes = { md: "px-6 py-3 text-sm", lg: "px-7 py-4 text-base" };
  const cls = cn(
    "inline-flex items-center gap-2 rounded-full bg-brand font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover",
    sizes[size],
    className
  );
  if (external) {
    return (
      <a href={to} className={cls} target="_blank" rel="noopener noreferrer">
        {children} <ArrowRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true, className }) {
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</div>
      )}
      <h2 className="font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-admuted">{subtitle}</p>}
    </div>
  );
}

export function Section({ id, className, children }) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function PageHero({ title, subtitle, eyebrow }) {
  return (
    <section className="bg-navy pt-28 pb-16 text-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        {eyebrow && <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</div>}
        <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
}