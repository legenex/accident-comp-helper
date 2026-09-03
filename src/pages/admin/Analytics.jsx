import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/admin/ui";
import { Users, TrendingUp, Clock, Target, MousePointerClick } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const traffic = [
  { day: "Mon", visitors: 820, conversions: 42 },
  { day: "Tue", visitors: 940, conversions: 51 },
  { day: "Wed", visitors: 1120, conversions: 63 },
  { day: "Thu", visitors: 1284, conversions: 71 },
  { day: "Fri", visitors: 1410, conversions: 88 },
  { day: "Sat", visitors: 980, conversions: 54 },
  { day: "Sun", visitors: 760, conversions: 38 },
];

const sources = [
  { source: "Organic", visitors: 4120 },
  { source: "Paid", visitors: 2890 },
  { source: "Direct", visitors: 1640 },
  { source: "Referral", visitors: 980 },
  { source: "Social", visitors: 620 },
];

const stats = [
  { label: "Visitors", value: "8,492", change: "+7%", icon: Users },
  { label: "Pageviews", value: "21,304", change: "+9%", icon: TrendingUp },
  { label: "Avg. Time", value: "2m 34s", change: "+5%", icon: Clock },
  { label: "Conversions", value: "342", change: "+18%", icon: Target },
];

export default function Analytics() {
  return (
    <AdminLayout title="Analytics" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Analytics" }]}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-admuted">{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand"><s.icon className="h-4 w-4" /></div>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="mt-1 text-xs text-success">{s.change} vs last period</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Traffic (last 7 days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B8DCF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0B8DCF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#24384A", border: "1px solid #33485C", borderRadius: 8, color: "#fff" }} />
                <Area type="monotone" dataKey="visitors" stroke="#0B8DCF" fill="url(#v)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-white">Top sources</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="source" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ background: "#24384A", border: "1px solid #33485C", borderRadius: 8, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="visitors" fill="#0B8DCF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Conversion funnel</h2>
        <div className="space-y-3">
          {[
            { stage: "Visitors", value: 8492, pct: 100, icon: Users },
            { stage: "Started claim check", value: 2341, pct: 28, icon: MousePointerClick },
            { stage: "Completed", value: 981, pct: 12, icon: Target },
            { stage: "Connected", value: 342, pct: 4, icon: TrendingUp },
          ].map((f) => (
            <div key={f.stage} className="flex items-center gap-4">
              <div className="flex w-48 items-center gap-2 text-sm text-slate-300"><f.icon className="h-4 w-4 text-brand" /> {f.stage}</div>
              <div className="flex-1 overflow-hidden rounded-lg bg-white/5">
                <div className="h-7 rounded-lg bg-brand/40" style={{ width: `${f.pct}%` }} />
              </div>
              <div className="w-20 text-right text-sm font-semibold text-white">{f.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}