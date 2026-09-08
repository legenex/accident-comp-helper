import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/admin/ui";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Clock, Target, FileText, BookOpen, Zap, Eye } from "lucide-react";

const metrics = [
  { label: "Total Visitors Today", value: "1,284", change: "+12%", icon: Users },
  { label: "This Week", value: "8,492", change: "+7%", icon: TrendingUp },
  { label: "Avg. Time on Page", value: "2m 34s", change: "+5%", icon: Clock },
  { label: "Conversions", value: "342", change: "+18%", icon: Target },
];

const integrations = [
  { name: "Google Analytics", connected: true },
  { name: "Google Search Console", connected: true },
  { name: "Facebook CAPI", connected: true },
  { name: "Slack", connected: false },
];

const recentActivity = [
  { action: "Homepage updated", user: "Admin", time: "2 min ago", icon: FileText },
  { action: "New blog post published", user: "Editor", time: "1 hr ago", icon: BookOpen },
  { action: "SEO settings updated", user: "Admin", time: "3 hrs ago", icon: Zap },
  { action: "New user registered", user: "System", time: "5 hrs ago", icon: Users },
  { action: "Privacy Policy edited", user: "Admin", time: "Yesterday", icon: FileText },
];

const topPages = [
  { page: "/", visits: 4820, bounce: "38%", avgTime: "3m 12s" },
  { page: "/claim", visits: 2341, bounce: "24%", avgTime: "4m 55s" },
  { page: "/submitted", visits: 981, bounce: "12%", avgTime: "2m 01s" },
  { page: "/thanks", visits: 634, bounce: "15%", avgTime: "1m 48s" },
  { page: "/privacy", visits: 210, bounce: "65%", avgTime: "1m 02s" },
];

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard" breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-admuted">{m.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <m.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="mt-1 text-xs text-success">{m.change} vs last period</div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Top Pages</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-admuted">
                <th className="pb-2 text-left font-medium">Page</th>
                <th className="pb-2 text-right font-medium">Visits</th>
                <th className="hidden pb-2 text-right font-medium sm:table-cell">Bounce</th>
                <th className="hidden pb-2 text-right font-medium sm:table-cell">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.page} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-mono text-xs text-brand">{p.page}</td>
                  <td className="py-2.5 text-right font-semibold text-white">{p.visits.toLocaleString()}</td>
                  <td className="hidden py-2.5 text-right text-slate-300 sm:table-cell">{p.bounce}</td>
                  <td className="hidden py-2.5 text-right text-slate-300 sm:table-cell">{p.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-white">Integration Status</h2>
          <div className="space-y-3">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between border-b border-white/5 py-2">
                <span className="text-sm text-slate-300">{i.name}</span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${i.connected ? "text-success" : "text-destructive"}`}>
                  <span className={`h-2 w-2 rounded-full ${i.connected ? "bg-success" : "bg-destructive"} animate-pulse`} />
                  {i.connected ? "Connected" : "Disconnected"}
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/integrations" className="mt-4 block text-center text-xs text-brand hover:underline">
            Manage Integrations →
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-white/5 py-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white">{a.action}</div>
                  <div className="text-xs text-admuted">by {a.user}</div>
                </div>
                <span className="flex-shrink-0 text-xs text-admuted">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/blog" className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/10 p-3 transition-all hover:bg-brand/20">
              <BookOpen className="h-4 w-4 text-brand" /><span className="text-sm font-medium text-white">New Blog Post</span>
            </Link>
            <Link to="/admin/pages" className="flex items-center gap-3 rounded-lg border border-navyline bg-white/5 p-3 transition-all hover:bg-white/10">
              <FileText className="h-4 w-4 text-slate-300" /><span className="text-sm font-medium text-white">Edit Pages</span>
            </Link>
            <Link to="/admin/analytics" className="flex items-center gap-3 rounded-lg border border-navyline bg-white/5 p-3 transition-all hover:bg-white/10">
              <Eye className="h-4 w-4 text-slate-300" /><span className="text-sm font-medium text-white">View Analytics</span>
            </Link>
            <Link to="/admin/seo" className="flex items-center gap-3 rounded-lg border border-navyline bg-white/5 p-3 transition-all hover:bg-white/10">
              <Zap className="h-4 w-4 text-slate-300" /><span className="text-sm font-medium text-white">SEO Manager</span>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}