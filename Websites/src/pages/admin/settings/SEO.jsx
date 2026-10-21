import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Pill, StatCard, SectionTitle,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Search, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

const blank = { path: '', title: '', description: '', keywords: '', og_image: '', no_index: false };

// Real SEO limits, so the counters mean something.
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function auditEntry(e) {
  const issues = [];
  if (!e.title) issues.push('Missing title');
  else if (e.title.length > TITLE_MAX) issues.push(`Title is ${e.title.length} chars (over ${TITLE_MAX})`);
  if (!e.description) issues.push('Missing description');
  else if (e.description.length > DESC_MAX) issues.push(`Description is ${e.description.length} chars (over ${DESC_MAX})`);
  else if (e.description.length < DESC_MIN) issues.push(`Description is ${e.description.length} chars (thin, under ${DESC_MIN})`);
  if (!e.path?.startsWith('/')) issues.push('Path should start with /');
  return issues;
}

function CharCount({ value, max, min }) {
  const len = (value || '').length;
  const over = len > max;
  const under = min && len > 0 && len < min;
  const color = over ? '#E5534B' : under ? '#D6A234' : '#5E7681';
  return <span style={{ color }}>{len}/{max}</span>;
}

export default function SeoSettings() {
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [s, p, b] = await Promise.all([
        base44.entities.SeoEntry.list('-created_date', 300),
        base44.entities.Page.list().catch(() => []),
        base44.entities.BlogPost.filter({ status: 'published' }).catch(() => []),
      ]);
      setRows(s || []); setPages(p || []); setPosts(b || []);
    } catch (e) { setError(e?.message || 'Failed to load SEO entries'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.path?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q);
  });

  const withIssues = rows.filter((r) => auditEntry(r).length > 0);

  // Real coverage gap: published URLs that have no SEO entry at all.
  const covered = new Set(rows.map((r) => r.path));
  const missing = [
    ...pages.filter((p) => p.status === 'published' && !covered.has(`/${p.slug}`)).map((p) => ({ path: `/${p.slug}`, label: p.title })),
    ...posts.filter((p) => !covered.has(`/blog/${p.slug}`)).map((p) => ({ path: `/blog/${p.slug}`, label: p.title })),
  ];

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await base44.entities.SeoEntry.update(editing.id, editing);
      else await base44.entities.SeoEntry.create(editing);
      setEditing(null); load();
    } finally { setSaving(false); }
  };
  const confirmDelete = async () => { await base44.entities.SeoEntry.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="SEO" description="Per-URL titles, descriptions and indexing rules."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Entry</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="URLs covered" value={loading ? '—' : rows.length} icon={FileText} tone="neutral" />
        <StatCard label="Entries with issues" value={loading ? '—' : withIssues.length} icon={AlertTriangle} tone={withIssues.length > 0 ? 'warning' : 'success'} />
        <StatCard label="Published URLs with no entry" value={loading ? '—' : missing.length} icon={Search} tone={missing.length > 0 ? 'warning' : 'success'} />
      </div>

      {missing.length > 0 && (
        <div className="mb-6">
          <SectionTitle hint="Published but not covered">Coverage gaps</SectionTitle>
          <Panel padded={false}>
            <div className="divide-y" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
              {missing.slice(0, 10).map((m) => (
                <div key={m.path} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm" style={{ color: '#E8F1EF' }}>{m.label}</div>
                    <Pill>{m.path}</Pill>
                  </div>
                  <Button variant="secondary" size="sm" icon={Plus}
                    onClick={() => setEditing({ ...blank, path: m.path, title: m.label })}>Add entry</Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <Panel padded={false}>
        <div className="p-4"><SearchInput value={search} onChange={setSearch} placeholder="Search by path or title..." /></div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={filtered} onRowClick={setEditing}
          empty={<div className="p-4"><EmptyState icon={Search} title="No SEO entries yet"
            description="Add per-URL titles and descriptions so search results read the way you want."
            action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Entry</Button>} /></div>}
          columns={[
            { key: 'path', header: 'Path', render: (r) => <Pill>{r.path}</Pill> },
            { key: 'title', header: 'Title' },
            { key: 'title_len', header: 'Title len', render: (r) => r.title ? `${r.title.length}` : null },
            { key: 'desc_len', header: 'Desc len', render: (r) => r.description ? `${r.description.length}` : null },
            { key: 'no_index', header: 'Indexing', render: (r) => r.no_index ? <StatusBadge label="noindex" tone="warning" /> : <StatusBadge label="indexed" tone="success" /> },
            {
              key: 'issues', header: 'Issues',
              render: (r) => {
                const issues = auditEntry(r);
                return issues.length === 0
                  ? <StatusBadge label="ok" tone="success" />
                  : <StatusBadge label={`${issues.length}`} tone="warning" />;
              },
            },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => setEditing(r)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit SEO entry' : 'New SEO entry'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" loading={saving} onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Path" hint="e.g. /blog/my-post" value={editing.path} onChange={(e) => setEditing({ ...editing, path: e.target.value })} />
            <TextInput label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              hint={<>Aim for under {TITLE_MAX} characters · <CharCount value={editing.title} max={TITLE_MAX} /></>} />
            <TextArea label="Description" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              hint={<>{DESC_MIN}–{DESC_MAX} characters reads best · <CharCount value={editing.description} max={DESC_MAX} min={DESC_MIN} /></>} />
            <TextInput label="Keywords" value={editing.keywords} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} />
            <TextInput label="Social share image URL" value={editing.og_image} onChange={(e) => setEditing({ ...editing, og_image: e.target.value })} />
            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <input type="checkbox" checked={!!editing.no_index} onChange={(e) => setEditing({ ...editing, no_index: e.target.checked })} />
              Ask search engines not to index this URL
            </label>

            {auditEntry(editing).length > 0 ? (
              <div className="rounded-xl p-4" style={{ background: 'rgba(214,162,52,0.12)', border: '1px solid rgba(214,162,52,0.4)' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: '#D6A234' }} />
                  <span className="text-sm font-semibold" style={{ color: '#D6A234' }}>Issues</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm" style={{ color: '#93AAB2' }}>
                  {auditEntry(editing).map((i, x) => <li key={x}>• {i}</li>)}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl p-4" style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.3)' }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: '#3FB950' }} />
                <span className="text-sm font-semibold" style={{ color: '#3FB950' }}>No issues</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`${deleteTarget?.path} will fall back to the site's default title and description in search results.`} />
    </AdminLayout>
  );
}
