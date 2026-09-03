import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero, Section } from "@/components/site/ui";
import { base44 } from "@/api/base44Client";
import { Clock, ArrowRight } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: "published" }, "-created_date", 50)
      .then((r) => setPosts(r ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero eyebrow="Blog" title="Accident compensation insights" subtitle="Plain-language guides to help you understand your options after an injury." />
      <Section className="bg-white">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/40" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-secondary/40 p-12 text-center">
            <p className="text-sm text-admuted">No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-lift transition-all hover:-translate-y-1 hover:border-brand/40">
                <div className="h-40 w-full bg-gradient-to-br from-secondary to-brand/20" />
                <div className="flex flex-1 flex-col p-6">
                  {p.category && <span className="text-xs font-semibold uppercase tracking-wider text-brand">{p.category}</span>}
                  <h3 className="mt-2 font-heading text-lg font-bold text-navy">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-admuted">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}