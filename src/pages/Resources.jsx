import React from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { PageHero, Section, CTAButton } from "@/components/site/ui";
import { QUIZ_URL } from "@/lib/siteContent";

const RESOURCES = [
  { title: "What to do after a car accident", blurb: "A step-by-step checklist for the moments and days after a collision." },
  { title: "Understanding your settlement offer", blurb: "How to read an insurance offer and what to watch for." },
  { title: "The statute of limitations, explained", blurb: "How long you have to file a claim in your state." },
  { title: "Documenting your injuries", blurb: "Why medical records matter and how to keep them organized." },
  { title: "When to talk to an attorney", blurb: "Signs your case may benefit from professional help." },
  { title: "Dealing with insurance adjusters", blurb: "What to say, what to avoid, and how to stay protected." },
];

export default function Resources() {
  return (
    <>
      <PageHero eyebrow="Resources" title="Guides to help you move forward" subtitle="Plain-language resources to help you understand the claims process." />
      <Section className="bg-white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <motion.a
              key={r.title}
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="group rounded-2xl border border-border bg-white p-7 shadow-lift transition-all hover:-translate-y-1 hover:border-brand/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand"><FileText className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy">{r.title}</h3>
              <p className="mt-2 text-sm text-admuted">{r.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
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