import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, SearchInput, DataTable, Pagination, StatusBadge, Tabs, FieldRow, Modal, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Download, RefreshCw, Users2, Columns } from 'lucide-react';

const ALL_COLUMNS = [
  { key: 'created_date', header: 'Captured', render: (r) => r.created_date ? new Date(r.created_date).toLocaleString() : null },
  { key: 'name', header: 'Name', render: (r) => [r.first_name, r.last_name].filter(Boolean).join(' ') || null },
  { key: 'email', header: 'Email' },
  { key: 'mobile', header: 'Mobile' },
  { key: 'accident_type', header: 'Accident type' },
  { key: 'accident_state', header: 'State' },
  { key: 'qualification_status', header: 'Qualification', render: (r) => r.qualification_status ? <StatusBadge status={r.qualification_status} /> : null },
  { key: 'source', header: 'Source' },
  { key: 'source_ref', header: 'Source ref' },
  { key: 'utm_source', header: 'UTM source' },
  { key: 'utm_medium', header: 'UTM medium' },
  { key: 'utm_campaign', header: 'UTM campaign' },
  { key: 'ad_label', header: 'Ad label' },
  { key: 'injured', header: 'Injured', render: (r) => r.injured === undefined ? null : (r.injured ? 'Yes' : 'No') },
  { key: 'treatment', header: 'Treatment' },
  { key: 'fault', header: 'Fault' },
  { key: 'attorney', header: 'Attorney' },
  { key: 'incident_date', header: 'Incident date' },
];
const DEFAULT_VISIBLE = ['created_date', 'name', 'email', 'mobile', 'accident_state', 'qualification_status', 'source'];
const COL_STORAGE_KEY = 'ach_admin_leads_columns';
const VIEWS_STORAGE_KEY = 'ach_admin_leads_saved_views';
const PAGE_SIZE = 25;

const DETAIL_TABS = ['Overview', 'Contact', 'Case', 'Qualification', 'Attribution', 'Custom Fields', 'Calculated', 'Tracking', 'Deliveries'];

function LeadDetail({ lead, onClose, onRecalculated }) {
  const [tab, setTab] = useState('Overview');
  const [calcDefs, setCalcDefs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [recalculating, setRecalculating] = useState(false);
  const [current, setCurrent] = useState(lead);

  useEffect(() => {
    base44.entities.CalculatedField.list().then((d) => setCalcDefs(d || [])).catch(() => {});
    base44.entities.WebhookDelivery.filter({ lead_id: lead.id }).then((d) => setDeliveries(d || [])).catch(() => {});
  }, [lead.id]);

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke('runCalculatedFields', { lead_id: lead.id });
      const updated = res?.data || res;
      setCurrent({ ...current, calculated_fields: updated.calculated_fields });
      onRecalculated?.();
    } finally { setRecalculating(false); }
  };

  return (
    <Modal open onClose={onClose} title={[current.first_name, current.last_name].filter(Boolean).join(' ') || current.email || current.mobile || 'Lead'} wide>
      <div className="space-y-4">
        <Tabs tabs={DETAIL_TABS.map((t) => ({ label: t, value: t }))} value={tab} onChange={setTab} />
        {tab === 'Overview' && (
          <div>
            <FieldRow label="Qualification" value={<StatusBadge status={current.qualification_status} />} />
            <FieldRow label="Source" value={current.source} />
            <FieldRow label="Captured" value={current.created_date ? new Date(current.created_date).toLocaleString() : null} />
            <FieldRow label="Accident type" value={current.accident_type} />
            <FieldRow label="State" value={current.accident_state} />
            <div className="mt-4"><Button variant="secondary" icon={RefreshCw} loading={recalculating} onClick={recalculate}>Recalculate</Button></div>
          </div>
        )}
        {tab === 'Contact' && (<div>
          <FieldRow label="First name" value={current.first_name} /><FieldRow label="Last name" value={current.last_name} />
          <FieldRow label="Email" value={current.email} /><FieldRow label="Mobile" value={current.mobile} /><FieldRow label="Zip" value={current.zip_code} />
        </div>)}
        {tab === 'Case' && (<div>
          <FieldRow label="Accident type" value={current.accident_type} /><FieldRow label="Incident date" value={current.incident_date} />
          <FieldRow label="Injured" value={current.injured === undefined ? null : (current.injured ? 'Yes' : 'No')} />
          <FieldRow label="Injury type" value={current.injury_type} /><FieldRow label="Treatment" value={current.treatment} />
          <FieldRow label="Medical bills" value={current.medical_bills} /><FieldRow label="Lost wages" value={current.lost_wages} />
          <FieldRow label="Fault" value={current.fault} /><FieldRow label="Attorney" value={current.attorney} />
        </div>)}
        {tab === 'Qualification' && (<div>
          <FieldRow label="Status" value={<StatusBadge status={current.qualification_status} />} />
          <FieldRow label="Disqualify reason" value={current.disqualify_reason} />
        </div>)}
        {tab === 'Attribution' && (<div>
          <FieldRow label="UTM source" value={current.utm_source} /><FieldRow label="UTM medium" value={current.utm_medium} />
          <FieldRow label="UTM campaign" value={current.utm_campaign} /><FieldRow label="UTM content" value={current.utm_content} />
          <FieldRow label="UTM term" value={current.utm_term} /><FieldRow label="Ad label" value={current.ad_label} />
          <FieldRow label="Landing URL" value={current.landing_url} /><FieldRow label="Referrer" value={current.referrer_url} />
          <FieldRow label="gclid" value={current.gclid} /><FieldRow label="fbclid" value={current.fbclid} />
        </div>)}
        {tab === 'Custom Fields' && (
          Object.keys(current.custom_fields || {}).length === 0
            ? <EmptyState title="No custom field values on this record" />
            : Object.entries(current.custom_fields).map(([k, v]) => <FieldRow key={k} label={k} value={typeof v === 'object' ? JSON.stringify(v) : v} />)
        )}
        {tab === 'Calculated' && (
          calcDefs.length === 0 ? <EmptyState title="No calculated fields defined yet" /> :
          calcDefs.map((f) => <FieldRow key={f.id} label={f.label} value={current.calculated_fields?.[f.token] !== undefined ? String(current.calculated_fields[f.token]) : 'not produced'} />)
        )}
        {tab === 'Tracking' && (<div>
          <FieldRow label="IP address" value={current.ip_address} /><FieldRow label="User agent" value={current.user_agent} />
          <FieldRow label="Consent version" value={current.consent_version} /><FieldRow label="Consent timestamp" value={current.consent_timestamp} />
        </div>)}
        {tab === 'Deliveries' && (
          deliveries.length === 0 ? <EmptyState title="No webhook deliveries for this lead yet" /> :
          <div className="space-y-2">
            {deliveries.map((d) => (
              <Panel key={d.id}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><StatusBadge status={d.status} /><span style={{ color: '#93AAB2' }}>{d.event}</span></div>
                  <span className="font-mono text-xs" style={{ color: '#5E7681' }}>{d.http_status || '—'} · {d.duration_ms ?? '—'}ms</span>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [qualFilter, setQualFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(() => {
    try { return JSON.parse(localStorage.getItem(COL_STORAGE_KEY)) || DEFAULT_VISIBLE; } catch { return DEFAULT_VISIBLE; }
  });

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Lead.list('-created_date', 1000)) || []); }
    catch (e) { setError(e?.message || 'Failed to load leads'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => { try { localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(visibleCols)); } catch { /* private browsing */ } }, [visibleCols]);

  const qualificationOptions = ['All', 'new', 'qualified', 'soft_dq', 'hard_dq', 'sold', 'unsold', 'returned'];
  const sourceOptions = useMemo(() => ['All', ...new Set(rows.map((r) => r.source).filter(Boolean))], [rows]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || [r.first_name, r.last_name, r.email, r.mobile].filter(Boolean).join(' ').toLowerCase().includes(q);
    const matchesQual = qualFilter === 'All' || r.qualification_status === qualFilter;
    const matchesSource = sourceFilter === 'All' || r.source === sourceFilter;
    return matchesSearch && matchesQual && matchesSource;
  });
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));

  const exportCsv = () => {
    const header = columns.map((c) => c.header).join(',');
    const lines = filtered.map((r) => columns.map((c) => {
      const v = c.render ? c.render(r) : r[c.key];
      const text = typeof v === 'object' && v !== null ? '' : String(v ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    }).join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <PageHeader title="Leads" description={`${filtered.length} of ${rows.length} leads`}
        actions={<>
          <Button variant="secondary" icon={Columns} onClick={() => setColumnsOpen(true)}>Columns</Button>
          <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
        </>} />

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, mobile..." className="min-w-[220px] flex-1" />
          <SelectInput value={qualFilter} onChange={(e) => { setQualFilter(e.target.value); setPage(1); }} options={qualificationOptions} />
          <SelectInput value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} options={sourceOptions} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<EmptyState icon={Users2} title="No leads yet" description="Leads arrive from the quiz at quiz.accidentcompensationhelper.com and the on-site contact form." />}
          rows={paged} onRowClick={setSelected}
          columns={columns}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </Panel>

      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} onRecalculated={load} />}

      <Modal open={columnsOpen} onClose={() => setColumnsOpen(false)} title="Visible columns"
        footer={<Button variant="gold" onClick={() => setColumnsOpen(false)}>Done</Button>}>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_COLUMNS.map((c) => (
            <label key={c.key} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm" style={{ color: '#E8F1EF' }}>
              <input type="checkbox" checked={visibleCols.includes(c.key)}
                onChange={() => setVisibleCols((prev) => prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key])} />
              {c.header}
            </label>
          ))}
        </div>
      </Modal>
    </AdminLayout>
  );
}
