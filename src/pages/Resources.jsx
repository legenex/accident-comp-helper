import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHero, Section, CTAButton } from "@/components/site/ui";
import { QUIZ_URL } from "@/lib/siteContent";
import { RESOURCE_PHOTOS, photo } from "@/lib/siteImages";

const RESOURCES = [
  { key: "after-a-crash", title: "What to do after a car accident", blurb: "A step-by-step checklist for the moments and days after a collision." },
  { key: "settlement-offer", title: "Understanding your settlement offer", blurb: "How to read an insurance offer and what to watch for." },
  { key: "statute-of-limitations", title: "The statute of limitations, explained", blurb: "How long you have to file a claim in your state." },
  { key: "documenting-injuries", title: "Documenting your injuries", blurb: "Why medical records matter and how to keep them organized." },
  { key: "talk-to-an-attorney", title: "When to talk to an attorney", blurb: "Signs your case may benefit from professional help." },
  { key: "insurance-adjusters", title: "Dealing with insurance adjusters", blurb: "What to say, what to avoid, and how to stay protected." },
];

export default function Resources() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Guides to help you move forward"
        subtitle="Plain-language resources to help you understand the claims process."
      />
      <Section className="bg-white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <motion.a
              key={r.key}
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-float"
            >
              <div className="relative h-40 overflow-hidden bg-navy">
                <img
                  src={photo(RESOURCE_PHOTOS[r.key], { w: 640, q: 65 })}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.07]"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(28,44,59,0.7), rgba(28,44,59,0.05))" }}
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-lg font-bold leading-snug text-navy">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-admuted">{r.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CTAButton size="lg">Check My Claim</CTAButton>
        </div>
      </Section>
    </>
  );
}
