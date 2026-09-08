import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, AdminButton, Field, AdminInput } from "@/components/admin/ui";
import { Save, Globe, Bell, ShieldCheck } from "lucide-react";

export default function Settings() {
  const [tab, setTab] = useState("general");
  const [general, setGeneral] = useState({
    site_name: "Accident Compensation Helper",
    domain: "accidentcompensationhelper.com",
    quiz_url: "https://quiz.accidentcompensationhelper.com/s/eval",
    support_email: "support@accidentcompensationhelper.com",
  });
  const [notifications, setNotifications] = useState({ new_lead_email: true, weekly_summary: true, slack_alerts: false });
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <AdminLayout title="Settings" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}>
      <div className="mb-6"><h2 className="text-2xl font-bold text-white">Settings</h2><p className="mt-1 text-sm text-admuted">Manage your site configuration</p></div>
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="h-fit lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.id ? "bg-brand text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>
        </Card>
        <div className="lg:col-span-3">
          {tab === "general" && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-white">General</h3>
              <div className="space-y-4">
                <Field label="Site name"><AdminInput value={general.site_name} onChange={(e) => setGeneral({ ...general, site_name: e.target.value })} /></Field>
                <Field label="Domain"><AdminInput value={general.domain} onChange={(e) => setGeneral({ ...general, domain: e.target.value })} /></Field>
                <Field label="Quiz / survey URL" hint="Every primary CTA routes here."><AdminInput value={general.quiz_url} onChange={(e) => setGeneral({ ...general, quiz_url: e.target.value })} /></Field>
                <Field label="Support email"><AdminInput value={general.support_email} onChange={(e) => setGeneral({ ...general, support_email: e.target.value })} /></Field>
              </div>
            </Card>
          )}
          {tab === "notifications" && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-white">Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: "new_lead_email", label: "Email me when a new lead comes in" },
                  { key: "weekly_summary", label: "Weekly performance summary" },
                  { key: "slack_alerts", label: "Slack alerts for new leads" },
                ].map((n) => (
                  <label key={n.key} className="flex items-center justify-between rounded-lg border border-navyline bg-navy/60 px-4 py-3">
                    <span className="text-sm text-white">{n.label}</span>
                    <input type="checkbox" checked={notifications[n.key]} onChange={(e) => setNotifications({ ...notifications, [n.key]: e.target.checked })} className="h-5 w-10 accent-brand" />
                  </label>
                ))}
              </div>
            </Card>
          )}
          {tab === "security" && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-white">Security</h3>
              <div className="space-y-4">
                <Field label="Current password"><AdminInput type="password" placeholder="••••••••" /></Field>
                <Field label="New password"><AdminInput type="password" placeholder="••••••••" /></Field>
                <Field label="Confirm new password"><AdminInput type="password" placeholder="••••••••" /></Field>
              </div>
            </Card>
          )}
          <div className="mt-6"><AdminButton onClick={save}><Save className="h-4 w-4" /> {saved ? "Saved" : "Save changes"}</AdminButton></div>
        </div>
      </div>
    </AdminLayout>
  );
}