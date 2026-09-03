import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, AdminButton, Field, AdminInput, Pill } from "@/components/admin/ui";
import { Bot, Save, MessageSquare, Sparkles } from "lucide-react";

export default function ClaimBot() {
  const [config, setConfig] = useState({
    enabled: true,
    name: "ACH Assistant",
    welcome_message: "Hi! I can help you figure out if your accident may qualify for compensation. Want to start a quick, free check?",
    cta_text: "Start My Free Claim Check",
    cta_url: "https://quiz.accidentcompensationhelper.com/s/eval",
    position: "bottom-right",
    accent_color: "#0B8DCF",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  return (
    <AdminLayout title="ClaimBot" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "ClaimBot" }]}>
      <div className="mb-6 flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">ClaimBot</h2><p className="mt-1 text-sm text-admuted">Configure your site assistant</p></div>
        <div className="flex items-center gap-3"><Pill tone={config.enabled ? "success" : "neutral"}>{config.enabled ? "Active" : "Disabled"}</Pill></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">General</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-navyline bg-navy/60 px-4 py-3">
                <span className="text-sm text-white">Enable ClaimBot</span>
                <input type="checkbox" checked={config.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-5 w-10 accent-brand" />
              </label>
              <Field label="Bot name"><AdminInput value={config.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Welcome message"><textarea rows={3} value={config.welcome_message} onChange={(e) => set("welcome_message", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Call to action</h3>
            <div className="space-y-4">
              <Field label="CTA text"><AdminInput value={config.cta_text} onChange={(e) => set("cta_text", e.target.value)} /></Field>
              <Field label="CTA URL"><AdminInput value={config.cta_url} onChange={(e) => set("cta_url", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Position"><select value={config.position} onChange={(e) => set("position", e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand"><option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option></select></Field>
                <Field label="Accent color"><AdminInput value={config.accent_color} onChange={(e) => set("accent_color", e.target.value)} /></Field>
              </div>
            </div>
          </Card>
          <div><AdminButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}><Save className="h-4 w-4" /> {saved ? "Saved" : "Save changes"}</AdminButton></div>
        </div>
        <Card className="h-fit">
          <h3 className="mb-4 text-sm font-semibold text-white">Preview</h3>
          <div className="rounded-xl border border-navyline bg-navy/40 p-4">
            <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"><Bot className="h-4 w-4" /></div><span className="text-sm font-semibold text-white">{config.name}</span></div>
            <div className="mt-3 rounded-2xl rounded-tl-sm bg-panel px-4 py-3 text-sm text-slate-200">{config.welcome_message}</div>
            <div className="mt-3 flex justify-end"><div className="rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-sm text-white">{config.cta_text}</div></div>
          </div>
          <p className="mt-3 text-xs text-admuted">The widget appears on public pages to guide visitors to the claim check.</p>
        </Card>
      </div>
    </AdminLayout>
  );
}