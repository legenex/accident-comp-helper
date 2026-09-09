import React, { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { PageHero, Section } from "@/components/site/ui";
import { SITE } from "@/lib/siteContent";
import { base44 } from "@/api/base44Client";

// Capture surface: runs the identical pipeline as the quiz ingest endpoint —
// validate -> normalise -> create -> attribution -> calculate -> deliver —
// by posting into the same ingestLead function with source: 'contact_form'.
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const [first_name, ...rest] = form.name.trim().split(" ");
    const params = new URLSearchParams(window.location.search);
    try {
      const res = await base44.functions.invoke("ingestLead", {
        first_name: first_name || form.name,
        last_name: rest.join(" ") || undefined,
        email: form.email,
        notes: form.message,
        source: "contact_form",
        source_ref: "site_contact_page",
        landing_url: window.location.href,
        referrer_url: document.referrer || undefined,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
      });
      if (res?.data?.ok === false || res?.ok === false) {
        setError((res.data || res).error || "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch (err) {
      // A dead endpoint must never cost the submission from the visitor's
      // point of view being confusing — but we do surface a real error here
      // since this is a direct form, not a fire-and-forget background call.
      setError(err?.message || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch" subtitle="Questions about the claim check or how we work? Send us a message and we will get back to you." />
      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-xl font-bold text-navy">We are here to help</h3>
            <p className="mt-3 text-sm text-admuted">Reach out any time. For an immediate claim check, use the Check My Claim button.</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <Mail className="h-5 w-5 text-brand" />
                <span className="text-sm font-medium text-navy">{SITE.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <MessageSquare className="h-5 w-5 text-brand" />
                <span className="text-sm font-medium text-navy">We respond within one business day</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-8 shadow-lift">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"><Send className="h-6 w-6" /></div>
                <h3 className="mt-4 font-heading text-xl font-bold text-navy">Message sent</h3>
                <p className="mt-2 text-sm text-admuted">Thanks for reaching out. We will reply soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="How can we help?" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] hover:bg-brand-hover disabled:opacity-60">
                  {submitting ? "Sending..." : "Send message"} <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
