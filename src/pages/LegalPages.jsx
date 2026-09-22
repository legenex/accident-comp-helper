import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PageHero, Section } from "@/components/site/ui";
import { base44 } from "@/api/base44Client";
import { LEGAL_DEFAULTS } from "@/lib/legalDefaults";

// Clean, text-first template for footer legal pages.
// Copy source of truth: a *published* Page record in Admin > Pages with a
// matching slug. If none exists (or the fetch fails), the default copy in
// src/lib/legalDefaults.js is shown instead.

function formatUpdated(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function useLegalPage(slug) {
  const fallback = LEGAL_DEFAULTS[slug] || { title: "", updated: null, body: "" };
  const [page, setPage] = useState({ ...fallback, loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.Page.filter({ slug, status: "published" }, "-updated_date", 1);
        const rec = rows?.[0];
        if (!cancelled && rec?.body?.trim()) {
          setPage({
            title: rec.title || fallback.title,
            updated: formatUpdated(rec.updated_date) || fallback.updated,
            body: rec.body,
            meta_title: rec.meta_title,
            meta_description: rec.meta_description,
            loading: false,
          });
          return;
        }
      } catch {
        // fall through to defaults
      }
      if (!cancelled) setPage({ ...fallback, loading: false });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!page.title) return;
    document.title = page.meta_title || `${page.title} | Accident Compensation Helper`;
  }, [page.title, page.meta_title]);

  return page;
}

function LegalPage({ slug }) {
  const page = useLegalPage(slug);
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={page.title}
        subtitle={page.updated ? `Last updated: ${page.updated}` : undefined}
      />
      <Section className="bg-white">
        <article className="prose-legal mx-auto max-w-3xl text-navy">
          <ReactMarkdown
            components={{
              a: ({ href, children, ...props }) => (
                <a href={href} className="font-medium text-brand underline underline-offset-2 hover:opacity-80" {...props}>{children}</a>
              ),
            }}
          >
            {page.body}
          </ReactMarkdown>
        </article>
      </Section>
    </>
  );
}

export function Privacy() { return <LegalPage slug="privacy" />; }
export function Terms() { return <LegalPage slug="terms" />; }
export function PrivacyChoices() { return <LegalPage slug="privacy-choices" />; }
export default LegalPage;
