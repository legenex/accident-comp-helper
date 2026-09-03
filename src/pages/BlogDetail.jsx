import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Section, CTAButton } from "@/components/site/ui";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ slug }, "-created_date", 1)
      .then((r) => setPost((r ?? [])[0] ?? null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32"><div className="mx-auto h-64 max-w-3xl animate-pulse rounded-2xl bg-secondary/40" /></div>;
  if (!post) {
    return (
      <Section className="bg-white">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-navy">Article not found</h1>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-brand"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      <section className="bg-navy pt-28 pb-14 text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
          {post.category && <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{post.category}</div>}
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-white/70">{post.excerpt}</p>}
          <div className="mt-5 flex items-center gap-4 text-sm text-white/55">
            {post.author && <span>By {post.author}</span>}
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(post.created_date).toLocaleDateString("en-US")}</span>
          </div>
        </div>
      </section>
      <Section className="bg-white">
        <article className="prose-legal mx-auto max-w-3xl text-navy">
          {post.body ? (
            post.body.split("\n").map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p className="text-admuted">This article has no content yet.</p>
          )}
        </article>
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-secondary/40 p-8 text-center">
          <h3 className="font-heading text-xl font-bold text-navy">Was your accident similar?</h3>
          <p className="mt-2 text-sm text-admuted">Take the free, confidential claim check to find out if you may qualify.</p>
          <div className="mt-6"><CTAButton size="lg">Check My Claim</CTAButton></div>
        </div>
      </Section>
    </>
  );
}