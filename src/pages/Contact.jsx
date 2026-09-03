import React, { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { PageHero, Section } from "@/components/site/ui";
import { SITE } from "@/lib/siteContent";

export default function Contact() {
  const [sent, setSent] = useState(false);
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
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Name</label>
                  <input required className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Email</label>
                  <input required type="email" className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-admuted">Message</label>
                  <textarea required rows={5} className="mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="How can we help?" />
                </div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] hover:bg-brand-hover">
                  Send message <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}