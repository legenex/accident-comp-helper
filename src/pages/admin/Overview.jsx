import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, SectionTitle, StatCard, DataTable, StatusBadge, Button, NotConfigured, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Users2, CheckCircle2, Webhook as WebhookIcon, AlertTriangle, FileText, BookOpen } from 'lucide-react';

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Lead.list('-created_date', 500).catch(() => []),
      base44.entities.Webhook.list().catch(() => []),
      base44.entities.WebhookDelivery.list('-created_date', 200).catch(() => []),
      base44.entities.TrackingConfig.list().catch(() => []),
      base44.entities.BlogPost.list('-created_date', 5).catch(() => []),
      base44.entities.Page.list().catch(() => []),
    ]).then(([l, w, d, t, p, pg]) => {
      setLeads(l || []); setWebhooks(w || []); setDeliveries(d || []); setTracking(t || []); setPosts(p || []); setPages(pg || []);
      setLoading(false);
    });
  }, []);

  const last30 = leads.filter((l) => l.created_date && new Date(l.created_date) >= daysAgo(30));
  const qualified = leads.filter((l) => l.qualification_status === 'qualified' || l.qualification_status === 'sold');
  const enabledWebhooks = webhooks.filter((w) => w.enabled !== false);
  const failedDeliveries = deliveries.filter((d) => d.status === 'failed');

  // Needs-attention: real detected problems only, never fabricated.
  const problems = [];
  webhooks.filter((w) => w.enabled !== false && !w.endpoint_url).forEach((w) => problems.push({ text: `"${w.name}" is enabled with no endpoint URL`, href: '/admin/tools/webhooks' }));
  if (failedDeliveries.length > 0) problems.push({ text: `${failedDeliveries.length} failed webhook deliver${failedDeliveries.length === 1 ? 'y' : 'ies'} in the last 200 attempts`, href: '/admin/tools/webhooks' });
  if (tracking.filter((t) => t.enabled).length === 0) problems.push({ text: 'No tracking configuration is enabled', href: '/admin/settings/tracking' });

  const activeTracking = tracking.filter((t) => t.enabled);

  return (
    <AdminLayout>
      <PageHeader title="Overview" description="Accident Compensation Helper — admin" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/admin/leads"><StatCard label="Leads (30d)" value={loading ? '—' : last30.length} icon={Users2} tone="brand" /></Link>
        <Link to="/admin/leads"><StatCard label="Qualified" value={loading ? '—' : qualified.length} icon={CheckCircle2} tone="success" /></Link>
        <Link to="/admin/tools/webhooks"><StatCard label="Active webhooks" value={loading ? '—' : enabledWebhooks.length} icon={WebhookIcon} tone="neutral" /></Link>
        <Link to="/admin/tools/webhooks"><StatCard label="Failed deliveries" value={loading ? '—' : failedDeliveries.length} icon={AlertTriangle} tone={failedDeliveries.length > 0 ? 'danger' : 'neutral'} /></Link>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle>Needs attention</SectionTitle>
          <Panel padded={false}>
            {problems.length === 0 ? (
              <div className="p-4"><EmptyState icon={CheckCircle2} title="Nothing needs attention" description="No missing endpoints, failed deliveries, or unconfigured tracking detected." /></div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
                {problems.map((p, i) => (
                  <Link key={i} to={p.href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03]" style={{ color: '#E8F1EF' }}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: '#D6A234' }} />
                    {p.text}
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <div>
          <SectionTitle>Integration health</SectionTitle>
          {activeTracking.length === 0 ? (
            <NotConfigured title="No tracking connected" description="Pixel and server-side event tracking isn't configured yet." settingsHref="/admin/settings/tracking" />
          ) : (
            <Panel padded={false}>
              <div className="divide-y" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
                {activeTracking.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span style={{ color: '#E8F1EF' }}>{t.provider}</span>
                    <StatusBadge label="connected" tone="success" />
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle>Recent leads</SectionTitle>
          <Panel padded={false}>
            <DataTable
              loading={loading} rows={leads.slice(0, 8)}
              empty={<div className="p-4"><EmptyState icon={Users2} title="No leads yet" description="Leads arrive from the quiz and the on-site contact form." /></div>}
              columns={[
                { key: 'name', header: 'Name', render: (r) => [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email || r.mobile },
                { key: 'accident_state', header: 'State' },
                { key: 'qualification_status', header: 'Status', render: (r) => <StatusBadge status={r.qualification_status} /> },
                { key: 'created_date', header: 'Captured', render: (r) => r.created_date ? new Date(r.created_date).toLocaleDateString() : null },
              ]}
            />
          </Panel>
        </div>
        <div>
          <SectionTitle>Live asset counts</SectionTitle>
          <Panel>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2" style={{ color: '#93AAB2' }}><BookOpen className="h-3.5 w-3.5" />Blog posts</span><span style={{ color: '#E8F1EF' }}>{posts.length}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2" style={{ color: '#93AAB2' }}><FileText className="h-3.5 w-3.5" />Pages</span><span style={{ color: '#E8F1EF' }}>{pages.length}</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}
