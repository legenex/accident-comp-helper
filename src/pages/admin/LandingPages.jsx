import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Tabs, Pill, StatCard, FieldRow,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Layout, ExternalLink, Copy, MousePointerClick, Users2, Eye, ShieldAlert, ShieldCheck } from 'lucide-react';
import { checkFields, slugify } from '@/lib/compliance';

const QUIZ_URL = 'https://quiz.accidentcompensationhelper.com/s/eval';
const blank = {
  title: '', slug: '', status: 'draft', headline: '', subheadline: '', body: '',
  cta_url: QUIZ_URL, cta_text: 'Check my claim', views: 0, clicks: 0, leads: 0,
};

function rate(numerator, denominator) {
  if (!denominator) return null;
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default function LandingPages() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [editorTab, setEditorTab] = useState('content');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.LandingPage.list('-created_date', 300)) || []); }
    catch (e) { setError(e?.message || 'Failed to load landing pages'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.title?.toLowerCase().includes(q) || r.slug?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = rows.reduce((acc, r) => ({
    views: acc.views + (r.views || 0), clicks: acc.clicks + (r.clicks || 0), leads: acc.leads + (r.leads || 0),
  }), { views: 0, clicks: 0, leads: 0 });

  const flags = editing ? checkFields({
    Headline: editing.headline, Subheadline: editing.subheadline, Body: editing.body, 'CTA text': editing.cta_text,
  }) : [];
  const publishBlocked = flags.length > 0;

  const openNew = () => { setEditing({ ...blank }); setEditorTab('content'); };
  const openEdit = (r) => { setEditing({ ...blank, ...r }); setEditorTab('content'); };

  const save = async (overrideStatus) => {
    const nextStatus = overrideStatus || editing.status;
    if (nextStatus === 'published' && publishBlocked) {
      setNotice('Publishing is blocked while compliance flags remain.');
      setEditorTab('compliance');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...editing, status: nextStatus, slug: editing.slug || slugify(editing.title) };
      if (editing.id) await base44.entities.LandingPage.update(editing.id, payload);
      else await base44.entities.LandingPage.create(payload);
      setEditing(null); setNotice(null); load();
    } catch (e) { setNotice(`Save failed: ${e?.message || String(e)}`); }
    setSaving(false);
  };

  const duplicate = async (r) => {
    const { id: _id, created_date: _c, updated_date: _u, ...rest } = r;
    await base44.entities.LandingPage.create({
      ...rest, title: `${r.title} (copy)`, slug: `${r.slug}-copy`, status: 'draft', views: 0, clicks: 0, leads: 0,
    });
    load();
  };

  const confirmDelete = async () => { await base44.entities.LandingPage.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Landing Pages" description="Standalone campaign pages. Every CTA routes into the claim check."
        actions={<Button variant="gold" icon={Plus} onClick={openNew}>New Landing Page</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total views" value={loading ? '—' : totals.views} icon={Eye} tone="neutral" />
        <StatCard label="CTA clicks" value={loading ? '—' : totals.clicks} icon={MousePointerClick} tone="brand" />
        <StatCard label="Leads" value={loading ? '—' : totals.leads} icon={Users2} tone="success" />
        <StatCard label="Click → lead" value={loading ? '—' : (rate(totals.leads, totals.clicks) || 'not tracked')} tone="neutral" />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search landing pages..." className="min-w-[220px] flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={['All', 'draft', 'published', 'archived']} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={filtered} onRowClick={openEdit}
          empty={<div className="p-4"><EmptyState icon={Layout} title="No landing pages yet"
            description="Build a campaign page that drives straight into the claim check."
            action={<Button variant="gold" icon={Plus} onClick={openNew}>New Landing Page</Button>} /></div>}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'slug', header: 'URL', render: (r) => <Pill>/lp/{r.slug}</Pill> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'views', header: 'Views' },
            { key: 'clicks', header: 'Clicks' },
            { key: 'ctr', header: 'CTR', render: (r) => rate(r.clicks, r.views) },
            { key: 'leads', header: 'Leads' },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {r.status === 'published' && <a href={`/lp/${r.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="View live" /></a>}
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => openEdit(r)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      {notice && (
        <div className="mt-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(214,162,52,0.12)', border: '1px solid rgba(214,162,52,0.4)', color: '#D6A234' }}>{notice}</div>
      )}

      <Modal open={!!editing} onClose={() => { setEditing(null); setNotice(null); }} title={editing?.id ? 'Edit landing page' : 'New landing page'} wide
        footer={<>
          <Button variant="secondary" onClick={() => { setEditing(null); setNotice(null); }}>Cancel</Button>
          <Button variant="secondary" loading={saving} onClick={() => save('draft')}>Save draft</Button>
          <Button variant="gold" loading={saving} disabled={publishBlocked}
            disabledReason={publishBlocked ? `${flags.length} compliance flag(s) must be cleared before publishing` : undefined}
            onClick={() => save('published')}>Publish</Button>
        </>}>
        {editing && (
          <div className="space-y-4">
            <Tabs tabs={[
              { label: 'Content', value: 'content' },
              { label: 'CTA', value: 'cta' },
              { label: 'Performance', value: 'performance' },
              { label: 'Compliance', value: 'compliance', count: flags.length },
            ]} value={editorTab} onChange={setEditorTab} />

            {editorTab === 'content' && (
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Title" hint="Internal name" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  <TextInput label="Slug" hint="Public URL is /lp/<slug>" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </div>
                <TextInput label="Headline" value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} />
                <TextInput label="Subheadline" value={editing.subheadline} onChange={(e) => setEditing({ ...editing, subheadline: e.target.value })} />
                <TextArea label="Body (Markdown)" rows={12} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              </div>
            )}

            {editorTab === 'cta' && (
              <div className="space-y-4 pt-2">
                <TextInput label="CTA text" value={editing.cta_text} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
                <TextInput label="CTA URL" hint="Defaults to the hosted claim check" value={editing.cta_url} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} />
                <Panel title="Preview">
                  <div className="text-center">
                    <h3 className="font-heading text-xl font-bold" style={{ color: '#E8F1EF' }}>{editing.headline || 'Your headline'}</h3>
                    <p className="mt-1.5 text-sm" style={{ color: '#93AAB2' }}>{editing.subheadline || 'Your subheadline'}</p>
                    <div className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold" style={{ background: '#028CC9', color: '#fff' }}>
                      {editing.cta_text || 'Check my claim'}
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {editorTab === 'performance' && (
              <div className="pt-2">
                <FieldRow label="Views" value={editing.views ?? 0} />
                <FieldRow label="CTA clicks" value={editing.clicks ?? 0} />
                <FieldRow label="Click-through rate" value={rate(editing.clicks, editing.views) || 'not tracked'} />
                <FieldRow label="Leads" value={editing.leads ?? 0} />
                <FieldRow label="Click → lead" value={rate(editing.leads, editing.clicks) || 'not tracked'} />
                <p className="mt-3 text-xs" style={{ color: '#5E7681' }}>
                  Counters increment from the public page. A stage with no event source reads “not tracked” rather than showing an estimated figure.
                </p>
              </div>
            )}

            {editorTab === 'compliance' && (
              <div className="space-y-3 pt-2">
                {flags.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.3)' }}>
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#3FB950' }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#3FB950' }}>No compliance issues found</p>
                      <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Checked headline, subheadline, body and CTA text.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(229,83,75,0.12)', border: '1px solid rgba(229,83,75,0.3)' }}>
                      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#E5534B' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#E5534B' }}>Publishing is blocked</p>
                        <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Ad copy on a lead-gen page carries the same advertising rules as the site itself.</p>
                      </div>
                    </div>
                    {flags.map((f, i) => (
                      <Panel key={i}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill>{f.field}</Pill>
                          <span className="text-sm font-semibold" style={{ color: '#E5534B' }}>“{f.phrase}”</span>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: '#93AAB2' }}>{f.reason}</p>
                      </Panel>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Any live ad pointing at /lp/${deleteTarget?.slug} will start sending traffic to a 404.`} />
    </AdminLayout>
  );
}
