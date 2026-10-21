import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { QUIZ_URL } from "@/lib/siteContent";

export default function AdvertorialPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Advertorial.filter({ slug, status: "published" }, "-created_date", 1)
      .then((r) => setItem((r ?? [])[0] ?? null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-navy"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" /></div>;
  if (!item) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
      <h1 className="font-heading text-2xl font-bold">Article not found</h1>
      <Link to="/" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">Back to home</Link>
    </div>
  );

  const cta = item.cta_url || QUIZ_URL;
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-navy pt-16 pb-14 text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{item.headline || item.title}</h1>
          {item.subheadline && <p className="mt-4 text-lg text-white/70">{item.subheadline}</p>}
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <article className="prose-legal text-navy">
            {item.body ? item.body.split("\n").map((p, i) => <p key={i}>{p}</p>) : <p className="text-admuted">No content yet.</p>}
          </article>
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
            <h3 className="font-heading text-xl font-bold text-navy">{item.cta_text || "Check My Claim"}</h3>
            <p className="mt-2 text-sm text-admuted">Free, confidential, and takes about 2 minutes.</p>
            <a href={cta} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
              {item.cta_text || "Check My Claim"} <ArrowRight className="h-4 w-4" />
            </a>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-admuted"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> No obligation</div>
          </div>
        </div>
      </section>
    </div>
  );
}