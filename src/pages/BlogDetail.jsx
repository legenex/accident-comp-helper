import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Section, CTAButton } from "@/components/site/ui";
import { QUIZ_URL } from "@/lib/siteContent";

// Renders a published post. Drafts and scheduled posts are NOT reachable by
// URL — previously any status was served, which meant an unpublished draft
// (including one that failed the compliance gate) was publicly readable.

function CTABlock({ cta }) {
  const headline = cta?.headline || "Was your accident similar?";
  const body = cta?.body || "Take the free, confidential claim check to find out if you may qualify.";
  const buttonText = cta?.button_text || "Check My Claim";
  const href = cta?.button_url || QUIZ_URL;
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-8 text-center">
      <h3 className="font-heading text-xl font-bold text-navy">{headline}</h3>
      <p className="mt-2 text-sm text-admuted">{body}</p>
      <div className="mt-6">
        {cta?.button_url ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover">
            {buttonText}
          </a>
        ) : (
          <CTAButton size="lg">{buttonText}</CTAButton>
        )}
      </div>
    </div>
  );
}

function Body({ markdown }) {
  return (
    <article className="prose-legal mx-auto max-w-3xl text-navy">
      {markdown
        ? markdown.split("\n").map((para, i) => (para.trim() ? <p key={i}>{para}</p> : null))
        : <p className="text-admuted">This article has no content yet.</p>}
    </article>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [cta, setCta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.BlogPost.filter({ slug, status: "published" }, "-created_date", 1)
      .then(async (r) => {
        const found = (r ?? [])[0] ?? null;
        if (cancelled) return;
        setPost(found);
        if (!found) return;

        // Count the view. Best-effort: a failed counter must never break the page.
        base44.entities.BlogPost.update(found.id, { views: (found.views || 0) + 1 }).catch(() => {});

        // Resolve the attached CTA, falling back to the configured default.
        if (found.cta_position !== "none") {
          try {
            const ctas = await base44.entities.BlogCTA.list();
            const resolved = found.cta_id
              ? (ctas || []).find((c) => c.id === found.cta_id)
              : (ctas || []).find((c) => c.is_default);
            if (!cancelled) setCta(resolved || null);
          } catch { /* fall through to the built-in default block */ }
        }
      })
      .catch(() => { if (!cancelled) setPost(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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

  const position = post.cta_position || "bottom";
  const showCta = position !== "none";
  const paragraphs = (post.body || "").split("\n").filter((p) => p.trim());
  const midpoint = Math.ceil(paragraphs.length / 2);
  const displayDate = post.published_at || post.created_date;

  return (
    <>
      <section className="bg-navy pt-28 pb-14 text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
          {post.category && <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{post.category}</div>}
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-white/70">{post.excerpt}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/55">
            {post.author && <span>By {post.author}</span>}
            {displayDate && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(displayDate).toLocaleDateString("en-US")}</span>}
            {post.reading_time_minutes ? <span>{post.reading_time_minutes} min read</span> : null}
          </div>
        </div>
      </section>

      <Section className="bg-white">
        {showCta && position === "top" && <div className="mb-12"><CTABlock cta={cta} /></div>}

        {showCta && position === "middle" && paragraphs.length > 1 ? (
          <>
            <Body markdown={paragraphs.slice(0, midpoint).join("\n")} />
            <div className="my-12"><CTABlock cta={cta} /></div>
            <Body markdown={paragraphs.slice(midpoint).join("\n")} />
          </>
        ) : (
          <Body markdown={post.body} />
        )}

        {showCta && (position === "bottom" || (position === "middle" && paragraphs.length <= 1)) && (
          <div className="mt-12"><CTABlock cta={cta} /></div>
        )}
      </Section>
    </>
  );
}
