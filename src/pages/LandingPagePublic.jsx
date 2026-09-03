import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { QUIZ_URL } from "@/lib/siteContent";

export default function LandingPagePublic() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LandingPage.filter({ slug, status: "published" }, "-created_date", 1)
      .then((r) => setItem((r ?? [])[0] ?? null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-navy"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" /></div>;
  if (!item) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
      <h1 className="font-heading text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">Back to home</Link>
    </div>
  );

  const cta = item.cta_url || QUIZ_URL;
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-navy pt-16 text-white">
        <div className="absolute inset-0" style={{ background: "radial-gradient(900px 400px at 80% -10%, rgba(11,141,207,0.35), transparent)" }} />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">{item.headline || item.title}</h1>
          {item.subheadline && <p className="mt-5 text-lg text-white/75">{item.subheadline}</p>}
          <a href={cta} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
            {item.cta_text || "Check My Claim"} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
      {item.body && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <article className="prose-legal text-navy">{item.body.split("\n").map((p, i) => <p key={i}>{p}</p>)}</article>
          </div>
        </section>
      )}
      <section className="bg-navy py-16 text-center text-white">
        <a href={cta} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
          {item.cta_text || "Check My Claim"} <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}