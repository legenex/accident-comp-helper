import React from "react";
import { ShieldCheck, Scale, Users, HeartHandshake } from "lucide-react";
import { CTAButton, PageHero, Section, SectionHeading } from "@/components/site/ui";

export default function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="We make the first step after an accident easier" subtitle="Accident Compensation Helper was built to give people a clear, free, and confidential way to understand whether their situation may be worth pursuing." />
      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading center={false} eyebrow="Our mission" title="Clarity, not confusion" subtitle="After an accident, the path forward can feel overwhelming. We help you cut through the noise with a simple claim check and, if you qualify, a connection to a participating attorney." />
            <div className="mt-8">
              <CTAButton>Check My Claim</CTAButton>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Free and confidential", b: "No cost, no obligation, ever." },
              { icon: Scale, t: "Not a law firm", b: "We do not provide legal advice. We help you find it." },
              { icon: Users, t: "People first", b: "Built around what people need after an accident." },
              { icon: HeartHandshake, t: "No pressure", b: "You decide whether to take the next step." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-border bg-white p-6 shadow-lift">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand"><c.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{c.t}</h3>
                <p className="mt-2 text-sm text-admuted">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section className="bg-secondary/40">
        <SectionHeading eyebrow="Important" title="A clear disclaimer" subtitle="Accident Compensation Helper is not a law firm and does not provide legal advice. Using this site does not create an attorney-client relationship. Any connection to an attorney is your choice." />
        <div className="mt-10 text-center">
          <CTAButton size="lg">Start my claim check</CTAButton>
        </div>
      </Section>
    </>
  );
}