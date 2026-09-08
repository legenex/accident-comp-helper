import React from "react";
import { motion } from "framer-motion";
import { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale, ArrowRight } from "lucide-react";
import { PageHero, Section, CTAButton } from "@/components/site/ui";
import { ACCIDENT_TYPES, QUIZ_URL } from "@/lib/siteContent";
import { ACCIDENT_PHOTOS, photo } from "@/lib/siteImages";

const ICONS = { Car, Truck, Bike, PersonStanding, HardHat, Footprints, Scale };

export default function AccidentTypes() {
  return (
    <>
      <PageHero
        eyebrow="Accident types"
        title="What kind of accident was it?"
        subtitle="Select the type that fits your situation to start your free, confidential claim check."
      />
      <Section className="bg-white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ACCIDENT_TYPES.map((t, i) => {
            const Icon = ICONS[t.icon] || Car;
            const src = photo(ACCIDENT_PHOTOS[t.slug], { w: 640, q: 65 });
            return (
              <motion.a
                key={t.slug}
                href={`${QUIZ_URL}?type=${encodeURIComponent(t.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-float"
              >
                <div className="relative h-40 overflow-hidden bg-navy">
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
                    style={{ background: "linear-gradient(to top, rgba(28,44,59,0.88), rgba(28,44,59,0.12))" }}
                  />
                  <div className="absolute bottom-3.5 left-4 flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-md">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-heading text-base font-bold text-white">{t.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-admuted">{t.blurb}</p>
                  <span className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Start check
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
