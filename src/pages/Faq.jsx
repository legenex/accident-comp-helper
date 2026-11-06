import React from "react";
import { PageHero, Section, CTAButton } from "@/components/site/ui";
import { FAQS } from "@/lib/siteContent";

export default function Faq() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" subtitle="Everything you need to know before starting your free claim check." />
      <Section className="bg-white">
        <div className="mx-auto max-w-3xl space-y-4">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-white p-6 shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base font-bold text-navy">
                {f.q}
                <span className="ml-4 text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-admuted">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CTAButton size="lg">Check My Claim</CTAButton>
        </div>
      </Section>
    </>
  );
}