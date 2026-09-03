import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Lock, Clock, ArrowRight, Star, Scale, Car, Truck, Bike,
  PersonStanding, HardHat, Footprints, CheckCircle2, Phone, FileText, Users,
} from "lucide-react";
import { CTAButton, Section, SectionHeading } from "@/components/site/ui";
import { QUIZ_URL, ACCIDENT_TYPES, STEPS, FAQS, STATS, TRUST_POINTS } from "@/lib/siteContent";

const ICONS = { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale };

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy pt-16">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(1100px 500px at 80% -10%, rgba(11,141,207,0.35), transparent), radial-gradient(800px 400px at 0% 100%, rgba(11,141,207,0.18), transparent)" }}
      />
      <div className="relative mx-auto grid max-w-[1280px] lg:grid-cols-2 lg:gap-12">
        <motion.div initial="hidden" animate="show" variants={rise} className="flex flex-col justify-center px-6 py-20 text-white lg:py-28 lg:pr-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Free and confidential claim check
          </span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Injured in an accident?
          </h1>
          <p className="mt-4 font-heading text-xl font-semibold sm:text-2xl">
            Find out if you may qualify for{" "}
            <span className="bg-gradient-to-r from-brand via-sky-300 to-teal-300 bg-clip-text text-transparent">compensation</span>.
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
            Answer a few questions about what happened. We will help you understand whether your situation may be worth
            discussing with a participating personal injury attorney, free, and in about two minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-white/65">
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> Takes about 2 minutes</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Free to use</span>
            <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-brand" /> Handled securely</span>
          </div>
          <div className="mt-9">
            <CTAButton size="lg">Start the claim check</CTAButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center px-6 pb-20 lg:py-28 lg:pl-6"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-float">
            <div className="flex items-center gap-2 text-brand">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold text-navy">Free Claim Check</span>
            </div>
            <h3 className="mt-4 font-heading text-2xl font-bold text-navy">See if your case may qualify</h3>
            <p className="mt-2 text-sm text-admuted">A quick, confidential review. No obligation.</p>
            <ul className="mt-5 space-y-3">
              {["What type of accident was it?", "When and where did it happen?", "Were you injured?", "Have you spoken to anyone yet?"].map((q, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-secondary/60 px-3.5 py-3 text-sm text-navy">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  {q}
                </li>
              ))}
            </ul>
            <a href={QUIZ_URL} target="_blank" rel="noopener noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] hover:bg-brand-hover">
              Start now <ArrowRight className="h-4 w-4" />
            </a>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-admuted">
              {[0,1,2,3,4].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              <span className="ml-1">12,000+ claims checked</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4 sm:px-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-heading text-2xl font-extrabold text-brand sm:text-3xl">{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-admuted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccidentTypesSection() {
  return (
    <Section className="bg-white">
      <SectionHeading eyebrow="We can help with" title="Common accident types" subtitle="Select what happened to start your free claim check." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ACCIDENT_TYPES.map((t, i) => {
          const Icon = ICONS[t.icon] || Car;
          return (
            <motion.div key={t.slug} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="group rounded-2xl border border-border bg-white p-6 shadow-lift transition-all hover:-translate-y-1 hover:border-brand/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm text-admuted">{t.blurb}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  return (
    <Section className="bg-secondary/40">
      <SectionHeading eyebrow="How it works" title="Three simple steps" subtitle="From questions to clarity in minutes." />
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div key={s.n} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative rounded-2xl border border-border bg-white p-8 shadow-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{s.n}</div>
            <h3 className="mt-5 font-heading text-xl font-bold text-navy">{s.title}</h3>
            <p className="mt-2 text-sm text-admuted">{s.body}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <CTAButton size="lg">Start my claim check</CTAButton>
      </div>
    </Section>
  );
}

function WhyUseSection() {
  return (
    <Section className="bg-white">
      <SectionHeading eyebrow="Why use ACH" title="Built to make the first step easier" subtitle="No pressure, no jargon, just clarity." />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((t, i) => {
          const Icon = { Clock, ShieldCheck, Lock, Scale }[t.icon] || ShieldCheck;
          return (
            <motion.div key={t.title} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl border border-border bg-white p-7 shadow-lift">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-base font-bold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm text-admuted">{t.body}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function FaqSection() {
  return (
    <Section className="bg-secondary/40">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" subtitle="Everything you need to know before you start." />
      <div className="mx-auto mt-12 max-w-3xl space-y-4">
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
    </Section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white">
      <div className="absolute inset-0" style={{ background: "radial-gradient(900px 400px at 50% 0%, rgba(11,141,207,0.35), transparent)" }} />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to find out if you qualify?</h2>
        <p className="mt-4 text-lg text-white/70">Take the free, confidential claim check. It only takes two minutes.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <CTAButton size="lg">Check My Claim</CTAButton>
          <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            Learn how it works
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> 2 minutes</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Free and confidential</span>
          <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-brand" /> No obligation</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <AccidentTypesSection />
      <HowItWorksSection />
      <WhyUseSection />
      <FaqSection />
      <FinalCTA />
    </>
  );
}