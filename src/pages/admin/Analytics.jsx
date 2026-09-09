import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, SectionTitle, StatCard, SelectInput, Button, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Users2, CheckCircle2, Percent, Download } from 'lucide-react';

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

function Bar({ label, value, max, tone = '#028CC9' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: '#93AAB2' }}>
        <span>{label}</span><span className="tabular-nums" style={{ color: '#E8F1EF' }}>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#122430' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function groupCount(rows, key) {
  const map = {};
  rows.forEach((r) => { const v = r[key] || 'unknown'; map[v] = (map[v] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');

  useEffect(() => {
    base44.entities.Lead.list('-created_date', 2000).then((l) => { setLeads(l || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const cutoff = daysAgo(Number(range));
    return leads.filter((l) => !l.created_date || new Date(l.created_date) >= cutoff);
  }, [leads, range]);

  const total = filtered.length;
  const qualified = filtered.filter((l) => l.qualification_status === 'qualified' || l.qualification_status === 'sold').length;
  const rate = total > 0 ? `${Math.round((qualified / total) * 100)}%` : '—';

  const bySource = groupCount(filtered, 'source');
  const byState = groupCount(filtered, 'accident_state');
  const byCampaign = groupCount(filtered, 'utm_campaign');
  const byType = groupCount(filtered, 'accident_type');
  const maxSource = Math.max(1, ...bySource.map((s) => s[1]));

  // Funnel — every stage is a real count from Lead.qualification_status.
  // A stage with no underlying event source is labelled "not tracked",
  // never estimated.
  const funnel = [
    { label: 'Captured', value: total },
    { label: 'Qualified', value: filtered.filter((l) => l.qualification_status === 'qualified').length },
    { label: 'Sold', value: filtered.filter((l) => l.qualification_status === 'sold').length },
    { label: 'Site conversion (view → capture)', value: null }, // no page-view tracking source wired yet
  ];

  const exportCsv = () => {
    const header = 'source,count';
    const lines = bySource.map(([s, c]) => `"${s}",${c}`);
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'source-performance.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <PageHeader title="Analytics" description="Lead capture and qualification performance."
        actions={<>
          <SelectInput value={range} onChange={(e) => setRange(e.target.value)} options={[{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }, { value: '3650', label: 'All time' }]} />
          <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        </>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Leads captured" value={loading ? '—' : total} icon={Users2} tone="brand" />
        <StatCard label="Qualified" value={loading ? '—' : qualified} icon={CheckCircle2} tone="success" />
        <StatCard label="Qualification rate" value={loading ? '—' : rate} icon={Percent} tone="neutral" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>Conversion funnel</SectionTitle>
          <Panel>
            <div className="space-y-3">
              {funnel.map((f) => f.value === null ? (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span style={{ color: '#93AAB2' }}>{f.label}</span>
                  <span style={{ color: '#5E7681' }}>not tracked</span>
                </div>
              ) : <Bar key={f.label} label={f.label} value={f.value} max={total} />)}
            </div>
          </Panel>
        </div>
        <div>
          <SectionTitle>By source</SectionTitle>
          <Panel>
            {bySource.length === 0 ? <EmptyState title="No source data yet" /> : (
              <div className="space-y-3">{bySource.slice(0, 8).map(([s, c]) => <Bar key={s} label={s} value={c} max={maxSource} tone="#D6A23C" />)}</div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <SectionTitle>By campaign</SectionTitle>
          <Panel padded={false}>
            {byCampaign.length === 0 ? <div className="p-4"><EmptyState title="No campaign data yet" /></div> : (
              <table className="w-full text-sm"><tbody>
                {byCampaign.slice(0, 10).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid rgba(148,180,190,0.14)' }}>
                    <td className="px-3 py-2" style={{ color: '#E8F1EF' }}>{k}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: '#93AAB2' }}>{v}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </Panel>
        </div>
        <div>
          <SectionTitle>By type</SectionTitle>
          <Panel padded={false}>
            {byType.length === 0 ? <div className="p-4"><EmptyState title="No type data yet" /></div> : (
              <table className="w-full text-sm"><tbody>
                {byType.map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid rgba(148,180,190,0.14)' }}>
                    <td className="px-3 py-2" style={{ color: '#E8F1EF' }}>{k}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: '#93AAB2' }}>{v}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </Panel>
        </div>
        <div>
          <SectionTitle>By geography</SectionTitle>
          <Panel padded={false}>
            {byState.length === 0 ? <div className="p-4"><EmptyState title="No geography data yet" /></div> : (
              <table className="w-full text-sm"><tbody>
                {byState.slice(0, 10).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid rgba(148,180,190,0.14)' }}>
                    <td className="px-3 py-2" style={{ color: '#E8F1EF' }}>{k}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: '#93AAB2' }}>{v}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}
