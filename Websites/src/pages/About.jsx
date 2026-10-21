import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, Users, HeartHandshake } from "lucide-react";
import { CTAButton, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { SUPPORT_PHOTOS, photo } from "@/lib/siteImages";

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl shadow-float"
          >
            <img
              src={photo(SUPPORT_PHOTOS.handshake, { w: 1100, q: 70 })}
              alt="Being pointed in the right direction after an accident"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>
        </div>
      </Section>

      <Section className="bg-white pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Free and confidential", b: "No cost, no obligation, ever." },
            { icon: Scale, t: "Not a law firm", b: "We do not provide legal advice. We help you find it." },
            { icon: Users, t: "People first", b: "Built around what people need after an accident." },
            { icon: HeartHandshake, t: "No pressure", b: "You decide whether to take the next step." },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-lift transition-transform hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand"><c.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-base font-bold text-navy">{c.t}</h3>
              <p className="mt-2 text-sm text-admuted">{c.b}</p>
            </motion.div>
          ))}
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