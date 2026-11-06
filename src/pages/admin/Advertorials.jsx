import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Tabs, Pill, StatCard, FieldRow,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Newspaper, ExternalLink, Copy, Eye, MousePointerClick, Users2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { checkFields, slugify } from '@/lib/compliance';

const QUIZ_URL = 'https://quiz.accidentcompensationhelper.com/s/eval';
const blank = {
  title: '', slug: '', status: 'draft', headline: '', subheadline: '', body: '',
  author: '', cta_url: QUIZ_URL, cta_text: 'Check my claim', views: 0, clicks: 0, leads: 0,
};

const rate = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : null);

export default function Advertorials() {
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
    try { setRows((await base44.entities.Advertorial.list('-created_date', 300)) || []); }
    catch (e) { setError(e?.message || 'Failed to load advertorials'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.title?.toLowerCase().includes(q) || r.slug?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = rows.reduce((a, r) => ({
    views: a.views + (r.views || 0), clicks: a.clicks + (r.clicks || 0), leads: a.leads + (r.leads || 0),
  }), { views: 0, clicks: 0, leads: 0 });

  // Advertorials carry the heaviest advertising risk of any page type here,
  // because they read like editorial. Same gate as the blog and landers.
  const flags = editing ? checkFields({
    Headline: editing.headline, Subheadline: editing.subheadline, Body: editing.body, 'CTA text': editing.cta_text,
  }) : [];
  const publishBlocked = flags.length > 0;

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
      if (editing.id) await base44.entities.Advertorial.update(editing.id, payload);
      else await base44.entities.Advertorial.create(payload);
      setEditing(null); setNotice(null); load();
    } catch (e) { setNotice(`Save failed: ${e?.message || String(e)}`); }
    setSaving(false);
  };

  const duplicate = async (r) => {
    const { id: _id, created_date: _c, updated_date: _u, ...rest } = r;
    await base44.entities.Advertorial.create({ ...rest, title: `${r.title} (copy)`, slug: `${r.slug}-copy`, status: 'draft', views: 0, clicks: 0, leads: 0 });
    load();
  };
  const confirmDelete = async () => { await base44.entities.Advertorial.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Advertorials" description="Editorial-style acquisition pages. These read like articles, so the advertising rules apply hardest here."
        actions={<Button variant="gold" icon={Plus} onClick={() => { setEditing({ ...blank }); setEditorTab('content'); }}>New Advertorial</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total views" value={loading ? '—' : totals.views} icon={Eye} tone="neutral" />
        <StatCard label="CTA clicks" value={loading ? '—' : totals.clicks} icon={MousePointerClick} tone="brand" />
        <StatCard label="Leads" value={loading ? '—' : totals.leads} icon={Users2} tone="success" />
        <StatCard label="Click → lead" value={loading ? '—' : (rate(totals.leads, totals.clicks) || 'not tracked')} tone="neutral" />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search advertorials..." className="min-w-[220px] flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={['All', 'draft', 'published', 'archived']} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={filtered}
          onRowClick={(r) => { setEditing({ ...blank, ...r }); setEditorTab('content'); }}
          empty={<div className="p-4"><EmptyState icon={Newspaper} title="No advertorials yet"
            description="Long-form editorial pages that carry native traffic into the claim check."
            action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Advertorial</Button>} /></div>}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'slug', header: 'URL', render: (r) => <Pill>/a/{r.slug}</Pill> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'views', header: 'Views' },
            { key: 'ctr', header: 'CTR', render: (r) => rate(r.clicks, r.views) },
            { key: 'leads', header: 'Leads' },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {r.status === 'published' && <a href={`/a/${r.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="View live" /></a>}
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => { setEditing({ ...blank, ...r }); setEditorTab('content'); }} />
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

      <Modal open={!!editing} onClose={() => { setEditing(null); setNotice(null); }} title={editing?.id ? 'Edit advertorial' : 'New advertorial'} wide
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
                  <TextInput label="Slug" hint="Public URL is /a/<slug>" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </div>
                <TextInput label="Headline" value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} />
                <TextInput label="Subheadline" value={editing.subheadline} onChange={(e) => setEditing({ ...editing, subheadline: e.target.value })} />
                <TextInput label="Byline / author" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
                <TextArea label="Body (Markdown)" rows={14} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              </div>
            )}

            {editorTab === 'cta' && (
              <div className="space-y-4 pt-2">
                <TextInput label="CTA text" value={editing.cta_text} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
                <TextInput label="CTA URL" value={editing.cta_url} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} />
              </div>
            )}

            {editorTab === 'performance' && (
              <div className="pt-2">
                <FieldRow label="Views" value={editing.views ?? 0} />
                <FieldRow label="CTA clicks" value={editing.clicks ?? 0} />
                <FieldRow label="Click-through rate" value={rate(editing.clicks, editing.views) || 'not tracked'} />
                <FieldRow label="Leads" value={editing.leads ?? 0} />
                <FieldRow label="Click → lead" value={rate(editing.leads, editing.clicks) || 'not tracked'} />
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
                        <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Editorial framing does not exempt a page from advertising rules — if anything it raises the bar.</p>
                      </div>
                    </div>
                    {flags.map((f, i) => (
                      <Panel key={i}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill>{f.field}</Pill>
                          <span className="text-sm font-semibold" style={{ color: '#E5534B' }}>“{f.phrase}”</span>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: '#93AAB2' }}>{f.reason}</p>
                        {f.context && <p className="mt-1.5 text-xs italic" style={{ color: '#5E7681' }}>{f.context}</p>}
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
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Any live native campaign pointing at /a/${deleteTarget?.slug} will start sending paid traffic to a 404.`} />
    </AdminLayout>
  );
}
