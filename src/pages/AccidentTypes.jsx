import React from "react";
import { motion } from "framer-motion";
import { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale, ArrowRight } from "lucide-react";
import { PageHero, Section, CTAButton } from "@/components/site/ui";
import { ACCIDENT_TYPES, QUIZ_URL } from "@/lib/siteContent";

const ICONS = { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale };

export default function AccidentTypes() {
  return (
    <>
      <PageHero eyebrow="Accident types" title="What kind of accident was it?" subtitle="Select the type that fits your situation to start your free, confidential claim check." />
      <Section className="bg-white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ACCIDENT_TYPES.map((t, i) => {
            const Icon = ICONS[t.icon] || Car;
            return (
              <motion.a
                key={t.slug}
                href={QUIZ_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-lift transition-all hover:-translate-y-1 hover:border-brand/40"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-bold text-navy">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-admuted">{t.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Start check <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <CTAButton size="lg">Check My Claim</CTAButton>
        </div>
      </Section>
    </>
  );
}