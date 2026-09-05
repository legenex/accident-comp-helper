import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Lock, Clock, ArrowRight, Scale, Car, Truck, Bike,
  PersonStanding, HardHat, Footprints, FileText, Users, Phone,
} from "lucide-react";
import { CTAButton, Section, SectionHeading } from "@/components/site/ui";
import HeroBackdrop from "@/components/site/HeroBackdrop";
import ClaimStarter from "@/components/site/ClaimStarter";
import { QUIZ_URL, ACCIDENT_TYPES, STEPS, FAQS, STATS, TRUST_POINTS } from "@/lib/siteContent";
import { HERO_SLIDES, ACCIDENT_PHOTOS, SUPPORT_PHOTOS, photo } from "@/lib/siteImages";

const ICONS = { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale };

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop slides={HERO_SLIDES} />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:gap-14 lg:pb-28 lg:pt-36">
        <motion.div initial="hidden" animate="show" variants={rise} className="text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Free and confidential claim check
          </span>

          <h1 className="mt-6 font-heading text-[2.75rem] font-extrabold leading-[1.03] tracking-tight drop-shadow-sm sm:text-6xl lg:text-[4.25rem]">
            Injured in an
            <br className="hidden sm:block" /> accident?
          </h1>

          <p className="mt-5 max-w-xl font-heading text-xl font-semibold leading-snug sm:text-2xl">
            Find out in two minutes whether you may qualify for{" "}
            <span className="bg-gradient-to-r from-brand via-sky-300 to-teal-300 bg-clip-text text-transparent">
              compensation
            </span>
            .
          </p>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
            Answer a few questions about what happened. We will help you understand whether your
            situation may be worth discussing with a participating personal injury attorney. It is
            free, and there is no obligation to go any further.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> Takes about 2 minutes</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Free to use</span>
            <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-brand" /> Handled securely</span>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <CTAButton size="lg">Start the claim check</CTAButton>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              See how it works
            </Link>
          </div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <ClaimStarter />
        </div>
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
      <SectionHeading
        eyebrow="We can help with"
        title="Common accident types"
        subtitle="Select what happened to start your free claim check."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ACCIDENT_TYPES.map((t, i) => {
          const Icon = ICONS[t.icon] || Car;
          const src = photo(ACCIDENT_PHOTOS[t.slug], { w: 640, q: 65 });
          return (
            <motion.a
              key={t.slug}
              href={`${QUIZ_URL}?type=${encodeURIComponent(t.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              variants={rise}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-float"
            >
              <div className="relative h-36 overflow-hidden bg-navy">
                {src && (
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.07]"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(28,44,59,0.85), rgba(28,44,59,0.15))" }}
                />
                <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-heading text-base font-bold text-white">{t.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-relaxed text-admuted">{t.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  Check this claim
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  return (
    <Section className="bg-secondary/40">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl shadow-float">
            <img
              src={photo(SUPPORT_PHOTOS.consultation, { w: 1100, q: 70 })}
              alt="Talking through what happened and what comes next"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden max-w-[230px] rounded-xl border border-border bg-white p-5 shadow-float sm:block">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-brand">
              <FileText className="h-4 w-4" />
            </div>
            <p className="mt-3 text-sm font-semibold leading-snug text-navy">
              No paperwork to fill in before you know where you stand.
            </p>
          </div>
        </motion.div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">How it works</div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Three simple steps
          </h2>
          <p className="mt-4 text-base text-admuted">From questions to clarity in minutes.</p>

          <div className="mt-9 space-y-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                variants={rise}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand font-heading text-base font-extrabold text-white">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-admuted">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-9">
            <CTAButton size="lg">Start my claim check</CTAButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

function WhyUseSection() {
  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Why use ACH"
        title="Built to make the first step easier"
        subtitle="No pressure, no jargon, just clarity."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((t, i) => {
          const Icon = { Clock, ShieldCheck, Lock, Scale }[t.icon] || ShieldCheck;
          return (
            <motion.div
              key={t.title}
              variants={rise}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-white p-7 shadow-lift transition-transform hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm text-admuted">{t.body}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/**
 * Credibility band. Deliberately free of invented settlement figures,
 * star ratings and named testimonials: everything here is a statement
 * about how the service itself operates, which we can stand behind.
 */
const ASSURANCES = [
  {
    icon: Users,
    title: "We are not a law firm",
    body: "ACH does not give legal advice and does not represent you. We help you work out whether your situation is worth a conversation with someone who can.",
  },
  {
    icon: Lock,
    title: "Your answers stay yours",
    body: "Nothing is passed to a participating attorney unless you ask us to. You are in control of that decision at every point.",
  },
  {
    icon: Phone,
    title: "No cold calling",
    body: "Completing the claim check does not sign you up to anything. If you would rather stop, you simply close the page.",
  },
];

function AssuranceSection() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white">
      <img
        src={photo(SUPPORT_PHOTOS.paperwork, { w: 1600, q: 60 })}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(28,44,59,0.97) 0%, rgba(28,44,59,0.9) 55%, rgba(28,44,59,0.75) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Straight answers
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            What we are, and what we are not
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Plenty of sites in this space are vague about it. We would rather be clear up front.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ASSURANCES.map((a, i) => (
            <motion.div
              key={a.title}
              variants={rise}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl border border-white/12 bg-white/[0.06] p-7 backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/20 text-brand">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{a.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <Section className="bg-secondary/40">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything you need to know before you start."
      />
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
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(900px 400px at 50% 0%, rgba(2,140,201,0.35), transparent)" }}
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to find out if you qualify?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Take the free, confidential claim check. It only takes two minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <CTAButton size="lg">Check My Claim</CTAButton>
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
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
      <AssuranceSection />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
