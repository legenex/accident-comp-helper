import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PageHero, Section } from "@/components/site/ui";
import { base44 } from "@/api/base44Client";
import { LEGAL_DEFAULTS } from "@/lib/legalDefaults";

// Clean, text-first template for footer legal pages.
// Copy source of truth: a *published* Page record in Admin > Pages with a
// matching slug. If none exists (or the fetch fails), the default copy in
// src/lib/legalDefaults.js is shown instead.
//
// Layouts:
//  - "prose" (default): continuous document (Privacy, Terms).
//  - "cards": each "## Section" is separated by a divider, and every
//    "### Subsection" inside a section renders as its own bordered card
//    (Disclosures: one card per state).

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
            layout: fallback.layout,
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
  }, [slug]);

  useEffect(() => {
    if (!page.title) return;
    document.title = page.meta_title || `${page.title} | Accident Compensation Helper`;
  }, [page.title, page.meta_title]);

  return page;
}

const mdComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} className="font-medium text-brand underline underline-offset-2 hover:opacity-80" {...props}>{children}</a>
  ),
};

function Md({ children }) {
  return <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>;
}

// Split markdown on a heading level ("## " or "### ") into
// { intro, sections: [{ heading, content }] }.
function splitOn(md, marker) {
  const lines = (md || "").split("\n");
  const intro = [];
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith(marker)) {
      current = { heading: line.slice(marker.length).trim(), content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(line);
    } else {
      intro.push(line);
    }
  }
  return {
    intro: intro.join("\n").trim(),
    sections: sections.map((s) => ({ heading: s.heading, content: s.content.join("\n").trim() })),
  };
}

function CardsLayout({ body }) {
  const { intro, sections } = splitOn(body, "## ");
  return (
    <div className="text-navy">
      {intro && <div className="prose-legal mb-10"><Md>{intro}</Md></div>}
      <div className="divide-y divide-slate-200">
        {sections.map((sec, i) => {
          const { intro: secIntro, sections: cards } = splitOn(sec.content, "### ");
          return (
            <section key={i} className="py-10 first:pt-0 last:pb-0">
              <h2 className="text-xl font-bold tracking-tight text-navy sm:text-2xl">{sec.heading}</h2>
              {secIntro && <div className="prose-legal mt-4 text-[15px] leading-relaxed text-slate-600"><Md>{secIntro}</Md></div>}
              {cards.length > 0 && (
                <div className="mt-6 space-y-3">
                  {cards.map((card, j) => (
                    <div key={j} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <h3 className="text-sm font-semibold text-navy">{card.heading}</h3>
                      <div className="mt-1.5 text-sm leading-relaxed text-slate-600 [&_p]:mb-2 [&_p:last-child]:mb-0">
                        <Md>{card.content}</Md>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function LegalPage({ slug }) {
  const page = useLegalPage(slug);
  const cards = page.layout === "cards";
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={page.title}
        subtitle={page.updated ? `Last updated: ${page.updated}` : undefined}
      />
      <Section className={cards ? "bg-slate-50" : "bg-white"}>
        <article className="mx-auto max-w-3xl">
          {cards ? (
            <CardsLayout body={page.body} />
          ) : (
            <div className="prose-legal text-navy"><Md>{page.body}</Md></div>
          )}
        </article>
      </Section>
    </>
  );
}

export function Privacy() { return <LegalPage slug="privacy" />; }
export function Terms() { return <LegalPage slug="terms" />; }
export function PrivacyChoices() { return <LegalPage slug="privacy-choices" />; }
export function Disclosures() { return <LegalPage slug="disclosures" />; }
export default LegalPage;
