import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, AdminButton, AdminInput, Field, Pill } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save } from "lucide-react";

const TEMPLATES = [
  { type: "claim_estimator", label: "AI Claim Estimator", path: "/tools/claim-estimator" },
  { type: "settlement_ticker", label: "Live Settlement Ticker", path: "/tools/recent-wins" },
  { type: "letter_analyzer", label: "Settlement Offer Letter Analyzer", path: "/tools/letter-analyzer" },
  { type: "state_map", label: "State-Interactive Claim Map", path: "/tools/state-map" },
  { type: "letter_generator", label: "Dear Adjuster Letter Generator", path: "/tools/letter-generator" },
  { type: "crash_clock", label: "The Crash Clock: SOL Countdown", path: "/tools/crash-clock" },
  { type: "injury_predictor", label: "Crash Anatomy Injury Predictor", path: "/tools/injury-predictor" },
  { type: "adjuster_simulator", label: "AI Adjuster Roleplay Simulator", path: "/tools/adjuster-simulator" },
  { type: "case_index", label: "Anonymous Case Index", path: "/community/case-index" },
  { type: "lifestyle_calculator", label: "Lifestyle Cost Calculator", path: "/tools/lifestyle-cost" },
  { type: "other", label: "Custom Experiment", path: "/tools/custom" },
];

export default function ExperimentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [form, setForm] = useState({
    title: "", slug: "", path: "", experiment_type: "other", category: "",
    status: "draft", build_status: "planned",
    hero_headline: "", hero_subheadline: "", short_description: "",
    primary_cta_url: "https://quiz.accidentcompensationhelper.com/s/eval",
    primary_cta_text: "Start My Free Claim Check",
    disclaimer_short: "This is an educational tool only, not legal advice and not a guarantee of any specific outcome.",
    utm_medium_label: "", view_count: 0, clicks: 0, leads: 0,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    base44.entities.Experiment.get(id).then((e) => { setForm((f) => ({ ...f, ...e })); setLoading(false); }).catch(() => setLoading(false));
  }, [id, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const created = await base44.entities.Experiment.create(form);
        navigate(`/admin/experiments/${created.id}/edit`);
      } else {
        await base44.entities.Experiment.update(id, form);
      }
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout title="Loading..."><div className="h-64 animate-pulse rounded-xl bg-white/5" /></AdminLayout>;

  return (
    <AdminLayout title={isNew ? "New Experiment" : "Edit Experiment"} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Experiments", href: "/admin/experiments" }, { label: isNew ? "New" : "Edit" }]}>
      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin/experiments" className="inline-flex items-center gap-2 text-sm text-admuted hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to experiments</Link>
        <div className="flex items-center gap-3">
          <Pill tone={form.status === "published" ? "success" : "neutral"}>{form.status}</Pill>
          <AdminButton onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}</AdminButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Content</h3>
            <div className="space-y-4">
              <Field label="Title"><AdminInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="AI Claim Estimator" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug"><AdminInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="claim-estimator" /></Field>
                <Field label="Path"><AdminInput value={form.path} onChange={(e) => set("path", e.target.value)} placeholder="/tools/claim-estimator" /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Experiment type">
                  <select value={form.experiment_type} onChange={(e) => set("experiment_type", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand">
                    {TEMPLATES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Category"><AdminInput value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Estimator" /></Field>
              </div>
              <Field label="Hero headline"><AdminInput value={form.hero_headline} onChange={(e) => set("hero_headline", e.target.value)} placeholder="What is Your Case Actually Worth?" /></Field>
              <Field label="Hero subheadline"><textarea rows={2} value={form.hero_subheadline} onChange={(e) => set("hero_subheadline", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
              <Field label="Short description"><textarea rows={2} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
              <Field label="Disclaimer"><textarea rows={2} value={form.disclaimer_short} onChange={(e) => set("disclaimer_short", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Status</h3>
            <div className="space-y-4">
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand">
                  <option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option>
                </select>
              </Field>
              <Field label="Build status">
                <select value={form.build_status} onChange={(e) => set("build_status", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand">
                  <option value="planned">planned</option><option value="in_progress">in_progress</option><option value="beta">beta</option><option value="live">live</option>
                </select>
              </Field>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Call to action</h3>
            <div className="space-y-4">
              <Field label="CTA text"><AdminInput value={form.primary_cta_text} onChange={(e) => set("primary_cta_text", e.target.value)} /></Field>
              <Field label="CTA URL"><AdminInput value={form.primary_cta_url} onChange={(e) => set("primary_cta_url", e.target.value)} /></Field>
              <Field label="UTM medium label"><AdminInput value={form.utm_medium_label} onChange={(e) => set("utm_medium_label", e.target.value)} placeholder="claim-estimator" /></Field>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Metrics</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-xl font-bold text-white">{form.view_count || 0}</div><div className="text-xs text-admuted">Views</div></div>
              <div><div className="text-xl font-bold text-white">{form.clicks || 0}</div><div className="text-xs text-admuted">Clicks</div></div>
              <div><div className="text-xl font-bold text-white">{form.leads || 0}</div><div className="text-xs text-admuted">Leads</div></div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}