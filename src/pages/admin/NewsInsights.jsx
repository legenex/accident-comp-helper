import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Tabs, Pill, StatCard, FieldRow, SectionTitle,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Rss, ExternalLink, TrendingUp, ShieldAlert, FileUp, Gavel, Flame } from 'lucide-react';
import { checkFields, slugify } from '@/lib/compliance';

// MVA / personal-injury taxonomy. These are the categories that actually
// change what we write or how we advertise, not generic news buckets.
const CATEGORIES = [
  { value: 'verdict_settlement', label: 'Verdict / settlement' },
  { value: 'regulation', label: 'Regulation / advertising rules' },
  { value: 'state_law', label: 'State law change' },
  { value: 'safety_recall', label: 'Vehicle safety / recall' },
  { value: 'litigation_trend', label: 'Litigation trend' },
  { value: 'insurance', label: 'Insurer behaviour' },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const US_STATES = ['', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const blank = {
  title: '', source: '', source_url: '', published_at: '', status: 'new', score: 50,
  category: 'litigation_trend', state: '', summary: '', relevance_reason: '', content_angle: '',
};

function scoreTone(score) {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'neutral';
}

export default function NewsInsights() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('new');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Signal.list('-created_date', 400)) || []); }
    catch (e) { setError(e?.message || 'Failed to load signals'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const byStatus = (s) => rows.filter((r) => r.status === s);

  const filtered = useMemo(() => {
    const base = tab === 'all' ? rows : byStatus(tab);
    return base.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.title?.toLowerCase().includes(q) || r.source?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
      return matchesSearch && matchesCat;
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [rows, tab, search, categoryFilter]);

  const flags = editing ? checkFields({
    Title: editing.title, Summary: editing.summary, 'Content angle': editing.content_angle,
  }) : [];

  const openNew = () => setEditing({ ...blank });

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...editing, compliance_flags: flags };
      if (editing.id) await base44.entities.Signal.update(editing.id, payload);
      else await base44.entities.Signal.create(payload);
      setEditing(null); load();
    } catch (e) { setNotice(`Save failed: ${e?.message || String(e)}`); }
    setSaving(false);
  };

  const setStatus = async (signal, status) => {
    await base44.entities.Signal.update(signal.id, { status });
    load();
  };

  // Promote a signal into a blog draft. Never auto-publishes, and refuses
  // while compliance flags remain on the signal.
  const confirmPromote = async () => {
    const signal = promoting;
    const signalFlags = checkFields({ Title: signal.title, Summary: signal.summary, 'Content angle': signal.content_angle });
    if (signalFlags.length > 0) {
      setNotice(`Cannot promote "${signal.title}" — it has ${signalFlags.length} compliance flag(s). Edit it first.`);
      setPromoting(null);
      return;
    }
    setSaving(true);
    try {
      const post = await base44.entities.BlogPost.create({
        title: signal.title,
        slug: slugify(signal.title),
        status: 'draft',
        excerpt: signal.summary || '',
        body: [
          signal.content_angle ? `> Angle: ${signal.content_angle}` : '',
          '',
          signal.summary || '',
          '',
          signal.source_url ? `Source: ${signal.source || 'original report'} — ${signal.source_url}` : '',
        ].filter(Boolean).join('\n'),
        category: signal.category || '',
        tags: [signal.state, CATEGORY_LABEL[signal.category]].filter(Boolean),
      });
      await base44.entities.Signal.update(signal.id, { status: 'promoted', promoted_post_id: post.id });
      setPromoting(null);
      setNotice(`Created a draft post from "${signal.title}". It is a draft — nothing is live until you publish it.`);
      load();
    } catch (e) {
      setNotice(`Promote failed: ${e?.message || String(e)}`);
      setPromoting(null);
    }
    setSaving(false);
  };

  const confirmDelete = async () => { await base44.entities.Signal.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  const highValue = rows.filter((r) => (r.score || 0) >= 70 && r.status !== 'archived').length;
  const regulatory = rows.filter((r) => ['regulation', 'state_law'].includes(r.category) && r.status !== 'archived').length;

  return (
    <AdminLayout>
      <PageHeader title="News & Insights"
        description="MVA and personal-injury stories worth turning into content, and rule changes worth knowing about before they cost you an ad account."
        actions={<Button variant="gold" icon={Plus} onClick={openNew}>Add Signal</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Unreviewed" value={loading ? '—' : byStatus('new').length} icon={Rss} tone="brand" />
        <StatCard label="High relevance" value={loading ? '—' : highValue} icon={Flame} tone="success" />
        <StatCard label="Regulatory / law" value={loading ? '—' : regulatory} icon={Gavel} tone={regulatory > 0 ? 'warning' : 'neutral'} />
        <StatCard label="Promoted to drafts" value={loading ? '—' : byStatus('promoted').length} icon={FileUp} tone="neutral" />
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
          style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} style={{ color: '#5E7681' }}>Dismiss</button>
        </div>
      )}

      <Tabs tabs={[
        { label: 'New', value: 'new', count: byStatus('new').length },
        { label: 'Reviewing', value: 'reviewing', count: byStatus('reviewing').length },
        { label: 'Promoted', value: 'promoted', count: byStatus('promoted').length },
        { label: 'Archived', value: 'archived', count: byStatus('archived').length },
        { label: 'All', value: 'all', count: rows.length },
      ]} value={tab} onChange={setTab} />

      <div className="mt-4">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center gap-3 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search stories..." className="min-w-[220px] flex-1" />
            <SelectInput value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              options={[{ value: 'All', label: 'All categories' }, ...CATEGORIES]} />
          </div>
          <DataTable
            loading={loading} error={error} onRetry={load} rows={filtered} onRowClick={setEditing}
            empty={<div className="p-4"><EmptyState icon={Rss} title="Nothing here"
              description="Track MVA verdicts, state law changes, recalls and advertising-rule updates, then turn the useful ones into drafts."
              action={<Button variant="gold" icon={Plus} onClick={openNew}>Add Signal</Button>} /></div>}
            columns={[
              { key: 'title', header: 'Story' },
              { key: 'category', header: 'Category', render: (r) => r.category ? <Pill>{CATEGORY_LABEL[r.category] || r.category}</Pill> : null },
              { key: 'state', header: 'State' },
              { key: 'source', header: 'Source' },
              { key: 'score', header: 'Relevance', render: (r) => <StatusBadge label={String(r.score ?? 0)} tone={scoreTone(r.score || 0)} /> },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              {
                key: 'actions', header: '', className: 'text-right',
                render: (r) => (
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="Open source" /></a>}
                    {r.status === 'promoted' && r.promoted_post_id
                      ? <Button variant="ghost" size="sm" icon={FileUp} title="Open the draft" onClick={() => navigate('/admin/blog')} />
                      : <Button variant="ghost" size="sm" icon={TrendingUp} title="Promote to blog draft" onClick={() => setPromoting(r)} />}
                    <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => setEditing(r)} />
                    <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                  </div>
                ),
              },
            ]}
          />
        </Panel>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit signal' : 'Add signal'} wide
        footer={<>
          {editing?.id && editing.status !== 'archived' && <Button variant="secondary" onClick={() => { setStatus(editing, 'archived'); setEditing(null); }}>Archive</Button>}
          {editing?.id && editing.status === 'new' && <Button variant="secondary" onClick={() => { setStatus(editing, 'reviewing'); setEditing(null); }}>Mark reviewing</Button>}
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="gold" loading={saving} onClick={save}>Save</Button>
        </>}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Headline" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Source" value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} />
              <TextInput label="Published" type="date" value={(editing.published_at || '').slice(0, 10)} onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} />
            </div>
            <TextInput label="Source URL" value={editing.source_url} onChange={(e) => setEditing({ ...editing, source_url: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectInput label="Category" value={editing.category} options={CATEGORIES} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <SelectInput label="State" hint="If jurisdiction-specific" value={editing.state} options={US_STATES} onChange={(e) => setEditing({ ...editing, state: e.target.value })} />
              <TextInput label="Relevance (0-100)" type="number" value={editing.score} onChange={(e) => setEditing({ ...editing, score: Number(e.target.value) })} />
            </div>
            <TextArea label="Summary" rows={4} value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
            <TextArea label="Why it matters to MVA" rows={3} hint="What changes for our brands, ads, or claimants because of this"
              value={editing.relevance_reason} onChange={(e) => setEditing({ ...editing, relevance_reason: e.target.value })} />
            <TextArea label="Content angle" rows={3} hint="The article or ad angle this suggests"
              value={editing.content_angle} onChange={(e) => setEditing({ ...editing, content_angle: e.target.value })} />

            {flags.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(229,83,75,0.12)', border: '1px solid rgba(229,83,75,0.3)' }}>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" style={{ color: '#E5534B' }} />
                  <span className="text-sm font-semibold" style={{ color: '#E5534B' }}>{flags.length} compliance flag(s)</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm" style={{ color: '#93AAB2' }}>
                  {flags.map((f, i) => <li key={i}>• <span style={{ color: '#E5534B' }}>“{f.phrase}”</span> in {f.field} — {f.reason}</li>)}
                </ul>
                <p className="mt-2 text-xs" style={{ color: '#5E7681' }}>This signal can be saved, but cannot be promoted to a draft until these are cleared.</p>
              </div>
            )}

            {editing.id && (
              <div>
                <SectionTitle>Record</SectionTitle>
                <FieldRow label="Status" value={<StatusBadge status={editing.status} />} />
                <FieldRow label="Promoted post" value={editing.promoted_post_id || 'not promoted'} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!promoting} onClose={() => setPromoting(null)} onConfirm={confirmPromote}
        title="Promote to a blog draft?" confirmLabel="Create draft" loading={saving}
        consequence={`A new DRAFT post will be created from "${promoting?.title}" and this signal will be marked promoted. Nothing goes live until you publish the draft yourself.`} />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Any draft already created from it is unaffected.`} />
    </AdminLayout>
  );
}
