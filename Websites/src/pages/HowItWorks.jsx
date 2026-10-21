import React from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Lock, FileText } from "lucide-react";
import { CTAButton, PageHero, Section } from "@/components/site/ui";
import { STEPS } from "@/lib/siteContent";
import { SUPPORT_PHOTOS, photo } from "@/lib/siteImages";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From accident to answers in three steps"
        subtitle="A simple, confidential process designed to help you understand your options quickly."
      />

      <Section className="bg-white">
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={rise}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-white p-8 shadow-lift transition-transform hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-heading text-lg font-extrabold text-white">
                {s.n}
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-admuted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">What you get</div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              A clear, no-pressure read on your situation
            </h2>
            <p className="mt-4 text-base text-admuted">
              The claim check is designed to tell you something useful whether or not you decide to
              take it any further.
            </p>

            <div className="mt-9 space-y-5">
              {[
                { icon: Clock, t: "Fast answers", b: "An instant read on whether your case may qualify." },
                { icon: ShieldCheck, t: "Confidential", b: "Your details stay private until you choose to connect." },
                { icon: Lock, t: "No obligation", b: "Free to use, with no commitment to move forward." },
              ].map((c, i) => (
                <motion.div
                  key={c.t}
                  variants={rise}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-lift">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-navy">{c.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-admuted">{c.b}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-9">
              <CTAButton size="lg">Start my claim check</CTAButton>
            </div>
          </div>

          <motion.div
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative order-first lg:order-last"
          >
            <div className="overflow-hidden rounded-2xl shadow-float">
              <img
                src={photo(SUPPORT_PHOTOS.notes, { w: 1100, q: 70 })}
                alt="Working through the details of what happened"
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden max-w-[235px] rounded-xl border border-border bg-white p-5 shadow-float sm:block">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-brand">
                <FileText className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-navy">
                Four short questions. No documents needed to start.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
