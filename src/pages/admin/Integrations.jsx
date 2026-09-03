import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton } from "@/components/admin/ui";
import { BarChart2, Search, Facebook, Slack, Puzzle, RefreshCw } from "lucide-react";

const integrations = [
  { name: "Google Analytics", desc: "Track visitors, traffic sources and conversions.", icon: BarChart2, connected: true, category: "Analytics" },
  { name: "Google Search Console", desc: "Monitor search performance and indexing.", icon: Search, connected: true, category: "Search" },
  { name: "Facebook CAPI", desc: "Send conversion events server-side via the Conversions API.", icon: Facebook, connected: true, category: "Ads" },
  { name: "Slack", desc: "Get lead and activity notifications in your channel.", icon: Slack, connected: false, category: "Notifications" },
];

export default function Integrations() {
  return (
    <AdminLayout title="Integrations" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Integrations" }]}>
      <div className="mb-6"><h2 className="text-2xl font-bold text-white">Integrations</h2><p className="mt-1 text-sm text-admuted">Connect your analytics, ads and notification tools</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((i) => (
          <Card key={i.name} className="flex items-start gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand"><i.icon className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-white">{i.name}</h3>
                <Pill tone={i.connected ? "success" : "neutral"}>{i.connected ? "Connected" : "Disconnected"}</Pill>
              </div>
              <p className="mt-1.5 text-sm text-admuted">{i.desc}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-admuted">{i.category}</span>
                <div className="ml-auto">
                  {i.connected ? (
                    <AdminButton variant="secondary" className="px-3 py-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Reconnect</AdminButton>
                  ) : (
                    <AdminButton className="px-3 py-1.5 text-xs"><Puzzle className="h-3.5 w-3.5" /> Connect</AdminButton>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}