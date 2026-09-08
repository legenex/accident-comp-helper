import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUIZ_URL } from "@/lib/siteContent";
import { PAGE_HERO_PHOTOS, photo } from "@/lib/siteImages";

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

/**
 * Banner at the top of every inner page.
 *
 * It resolves its own photo from the current route via PAGE_HERO_PHOTOS,
 * so adding or changing a banner image is a one-line edit in siteImages.js
 * and never needs a change here or in the page itself. Pass `image` to
 * override, or `image={null}` for a plain navy banner.
 */
export function PageHero({ title, subtitle, eyebrow, image, cta = false, children }) {
  const { pathname } = useLocation();
  const resolved =
    image === null
      ? null
      : image || PAGE_HERO_PHOTOS[pathname] || PAGE_HERO_PHOTOS.legal;

  return (
    <section className="relative isolate overflow-hidden bg-navy pb-16 pt-32 text-white sm:pb-20 sm:pt-36">
      {resolved && (
        <img
          src={photo(resolved.id, { w: 1800, q: 62 })}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
          style={{ objectPosition: resolved.focus || "50% 50%" }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: resolved
            ? "linear-gradient(100deg, rgba(28,44,59,0.96) 0%, rgba(28,44,59,0.9) 42%, rgba(28,44,59,0.66) 72%, rgba(28,44,59,0.5) 100%)"
            : "radial-gradient(900px 420px at 15% -20%, rgba(2,140,201,0.3), transparent)",
        }}
      />
      {resolved && (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{ background: "linear-gradient(115deg, rgba(2,140,201,0.5), transparent 60%)" }}
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(28,44,59,0.75))" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        {eyebrow && (
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</div>
        )}
        <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{subtitle}</p>}
        {cta && (
          <div className="mt-8">
            <CTAButton>Check My Claim</CTAButton>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}