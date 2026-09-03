import React from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Lock, ArrowRight, FileText, Users, Phone } from "lucide-react";
import { CTAButton, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { STEPS } from "@/lib/siteContent";

export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="How it works" title="From accident to answers in three steps" subtitle="A simple, confidential process designed to help you understand your options quickly." />
      <Section className="bg-white">
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-white p-8 shadow-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{s.n}</div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-admuted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>
      <Section className="bg-secondary/40">
        <SectionHeading eyebrow="What you get" title="A clear, no-pressure read on your situation" />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { icon: Clock, t: "Fast answers", b: "An instant read on whether your case may qualify." },
            { icon: ShieldCheck, t: "Confidential", b: "Your details stay private until you choose to connect." },
            { icon: Lock, t: "No obligation", b: "Free to use, with no commitment to move forward." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-white p-7 text-center shadow-lift">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-brand"><c.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-base font-bold text-navy">{c.t}</h3>
              <p className="mt-2 text-sm text-admuted">{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CTAButton size="lg">Start my claim check</CTAButton>
        </div>
      </Section>
    </>
  );
}