import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Clock, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { QUIZ_URL } from "@/lib/siteContent";

export default function ExperimentPage() {
  const location = useLocation();
  const path = location.pathname;
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Experiment.filter({ path, status: "published" }, "-created_date", 1)
      .then((r) => setExp((r ?? [])[0] ?? null))
      .catch(() => setExp(null))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => {
    if (exp?.id) {
      base44.entities.Experiment.update(exp.id, { view_count: (exp.view_count || 0) + 1 }).catch(() => {});
    }
  }, [exp?.id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-navy"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" /></div>;
  }
  if (!exp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
        <AlertTriangle className="h-10 w-10 text-warning" />
        <h1 className="mt-4 font-heading text-2xl font-bold">This tool is not available</h1>
        <p className="mt-2 text-white/60">It may have been moved or is no longer published.</p>
        <Link to="/" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">Back to home</Link>
      </div>
    );
  }

  const ctaUrl = exp.primary_cta_url || QUIZ_URL;
  const ctaText = exp.primary_cta_text || "Start My Free Claim Check";

  const features = [
    "Free and confidential",
    "Takes about 2 minutes",
    "No obligation to proceed",
    "Educational, not legal advice",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pt-16 text-white">
        <div className="absolute inset-0" style={{ background: "radial-gradient(900px 400px at 80% -10%, rgba(11,141,207,0.35), transparent)" }} />
        <div className="relative mx-auto grid max-w-[1280px] lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col justify-center px-6 py-20 lg:py-28">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-4 py-1.5 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> {exp.category || "Free Tool"}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {exp.hero_headline || exp.title}
            </h1>
            {exp.hero_subheadline && <p className="mt-5 max-w-xl text-lg text-white/75">{exp.hero_subheadline}</p>}
            <p className="mt-4 max-w-xl text-sm text-white/55">{exp.short_description}</p>
            <div className="mt-8">
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
                {ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65">
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> 2 minutes</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Free</span>
              <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-brand" /> Confidential</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center justify-center px-6 pb-20 lg:py-28">
            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-float">
              <h3 className="font-heading text-xl font-bold text-navy">{exp.title}</h3>
              <p className="mt-2 text-sm text-admuted">{exp.hero_subheadline || "Get an instant read on your situation."}</p>
              <ul className="mt-5 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 rounded-lg bg-secondary/60 px-3.5 py-3 text-sm text-navy">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] hover:bg-brand-hover">
                {ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">How it works</div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Three quick steps</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { n: 1, t: "Answer a few questions", b: "Tell us what happened in a quick, confidential check." },
              { n: 2, t: "Get an instant read", b: "We help you understand whether your situation may qualify." },
              { n: 3, t: "Connect if you choose", b: "Request a free, no-obligation conversation with a participating attorney." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-white p-8 shadow-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{s.n}</div>
                <h3 className="mt-5 font-heading text-xl font-bold text-navy">{s.t}</h3>
                <p className="mt-2 text-sm text-admuted">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-secondary/40 py-12">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="text-sm text-admuted">{exp.disclaimer_short || "This is an educational tool only, not legal advice and not a guarantee of any specific outcome."}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{exp.title}</h2>
          <p className="mt-4 text-lg text-white/70">Take the free, confidential check now.</p>
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
            {ctaText} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}