import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Tabs, Pill, NotConfigured, Pagination,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, BookOpen, ShieldAlert, ShieldCheck, ExternalLink, Tag, Megaphone } from 'lucide-react';
import { checkFields, readingTimeMinutes, slugify } from '@/lib/compliance';

const PAGE_SIZE = 20;
const STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'];
const blankPost = {
  title: '', slug: '', status: 'draft', excerpt: '', body: '', author: '', category: '',
  tags: [], featured_image: '', meta_title: '', meta_description: '', canonical_url: '',
  publish_at: '', cta_id: '', cta_position: 'bottom', compliance_flags: [],
};

export default function BlogManager() {
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ctas, setCtas] = useState([]);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);
  const [editorTab, setEditorTab] = useState('content');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCta, setEditingCta] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [p, c, t, i] = await Promise.all([
        base44.entities.BlogPost.list('-created_date', 500),
        base44.entities.BlogCategory.list().catch(() => []),
        base44.entities.BlogCTA.list().catch(() => []),
        base44.entities.BlogInstructions.list().catch(() => []),
      ]);
      setPosts(p || []); setCategories(c || []); setCtas(t || []);
      setInstructions((i && i[0]) || null);
    } catch (e) { setError(e?.message || 'Failed to load blog data'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const bannedPatterns = instructions?.banned_patterns || [];

  // Live compliance scan of whatever is currently in the editor.
  const liveFlags = useMemo(() => {
    if (!editing) return [];
    return checkFields({
      Title: editing.title, Excerpt: editing.excerpt, Body: editing.body,
      'Meta title': editing.meta_title, 'Meta description': editing.meta_description,
    }, bannedPatterns);
  }, [editing, bannedPatterns]);

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => { setEditing({ ...blankPost }); setEditorTab('content'); };
  const openEdit = (p) => { setEditing({ ...blankPost, ...p }); setEditorTab('content'); };

  // The gate: publishing (or scheduling) is blocked while flags remain.
  const publishBlocked = liveFlags.length > 0;

  const save = async (overrideStatus) => {
    const nextStatus = overrideStatus || editing.status;
    if ((nextStatus === 'published' || nextStatus === 'scheduled') && publishBlocked) {
      setNotice('Publishing is blocked while compliance flags remain. Clear them in the Compliance tab first.');
      setEditorTab('compliance');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        status: nextStatus,
        slug: editing.slug || slugify(editing.title),
        reading_time_minutes: readingTimeMinutes(editing.body),
        compliance_flags: liveFlags,
        compliance_checked_at: new Date().toISOString(),
        published_at: nextStatus === 'published' ? (editing.published_at || new Date().toISOString()) : editing.published_at,
      };
      if (editing.id) await base44.entities.BlogPost.update(editing.id, payload);
      else await base44.entities.BlogPost.create(payload);
      setEditing(null); setNotice(null); load();
    } catch (e) {
      setNotice(`Save failed: ${e?.message || String(e)}`);
    }
    setSaving(false);
  };

  const confirmDelete = async () => { await base44.entities.BlogPost.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  const saveCategory = async () => {
    const payload = { ...editingCategory, slug: editingCategory.slug || slugify(editingCategory.name) };
    if (editingCategory.id) await base44.entities.BlogCategory.update(editingCategory.id, payload);
    else await base44.entities.BlogCategory.create(payload);
    setEditingCategory(null); load();
  };
  const saveCta = async () => {
    if (editingCta.id) await base44.entities.BlogCTA.update(editingCta.id, editingCta);
    else await base44.entities.BlogCTA.create(editingCta);
    setEditingCta(null); load();
  };

  return (
    <AdminLayout>
      <PageHeader title="Blog Manager" description="Posts, categories, and reusable CTAs. Publishing is gated on the compliance check."
        actions={tab === 'posts' ? <Button variant="gold" icon={Plus} onClick={openNew}>New Post</Button>
          : tab === 'categories' ? <Button variant="gold" icon={Plus} onClick={() => setEditingCategory({ name: '', slug: '', description: '' })}>New Category</Button>
          : <Button variant="gold" icon={Plus} onClick={() => setEditingCta({ name: '', headline: '', body: '', button_text: 'Check my claim', button_url: 'https://quiz.accidentcompensationhelper.com/s/eval', is_default: false })}>New CTA</Button>} />

      <Tabs tabs={[
        { label: 'Posts', value: 'posts', count: posts.length },
        { label: 'Categories', value: 'categories', count: categories.length },
        { label: 'CTAs', value: 'ctas', count: ctas.length },
      ]} value={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'posts' && (
          <Panel padded={false}>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search posts..." className="min-w-[220px] flex-1" />
              <SelectInput value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={['All', ...STATUSES]} />
            </div>
            <DataTable
              loading={loading} error={error} onRetry={load} rows={paged} onRowClick={openEdit}
              empty={<div className="p-4"><EmptyState icon={BookOpen} title="No posts yet" description="Write a post, or promote a story from News & Insights."
                action={<Button variant="gold" icon={Plus} onClick={openNew}>New Post</Button>} /></div>}
              columns={[
                { key: 'title', header: 'Title' },
                { key: 'category', header: 'Category' },
                { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
                {
                  key: 'compliance', header: 'Compliance',
                  render: (p) => (p.compliance_flags || []).length > 0
                    ? <StatusBadge label={`${p.compliance_flags.length} flag${p.compliance_flags.length === 1 ? '' : 's'}`} tone="danger" />
                    : p.compliance_checked_at ? <StatusBadge label="clear" tone="success" /> : null,
                },
                { key: 'reading_time_minutes', header: 'Read', render: (p) => p.reading_time_minutes ? `${p.reading_time_minutes} min` : null },
                { key: 'views', header: 'Views' },
                {
                  key: 'actions', header: '', className: 'text-right',
                  render: (p) => (
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {p.status === 'published' && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="View live" /></a>}
                      <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => openEdit(p)} />
                      <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(p)} />
                    </div>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </Panel>
        )}

        {tab === 'categories' && (
          <Panel padded={false}>
            <DataTable
              loading={loading} rows={categories} onRowClick={setEditingCategory}
              empty={<div className="p-4"><EmptyState icon={Tag} title="No categories yet" description="Group posts so readers and search engines can navigate them." /></div>}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'slug', header: 'Slug', render: (c) => <Pill>{c.slug}</Pill> },
                { key: 'count', header: 'Posts', render: (c) => posts.filter((p) => p.category === c.slug).length },
                {
                  key: 'actions', header: '', className: 'text-right',
                  render: (c) => (
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditingCategory(c)} />
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={async () => {
                        const used = posts.filter((p) => p.category === c.slug).length;
                        if (used > 0) { setNotice(`"${c.name}" is used by ${used} post(s). Reassign them before deleting.`); return; }
                        await base44.entities.BlogCategory.delete(c.id); load();
                      }} />
                    </div>
                  ),
                },
              ]}
            />
          </Panel>
        )}

        {tab === 'ctas' && (
          <Panel padded={false}>
            <DataTable
              loading={loading} rows={ctas} onRowClick={setEditingCta}
              empty={<div className="p-4"><EmptyState icon={Megaphone} title="No CTAs yet" description="Reusable call-to-action blocks you can drop into any post." /></div>}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'headline', header: 'Headline' },
                { key: 'button_text', header: 'Button' },
                { key: 'is_default', header: 'Default', render: (c) => c.is_default ? <StatusBadge label="default" tone="success" /> : null },
                {
                  key: 'actions', header: '', className: 'text-right',
                  render: (c) => (
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditingCta(c)} />
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={async () => { await base44.entities.BlogCTA.delete(c.id); load(); }} />
                    </div>
                  ),
                },
              ]}
            />
          </Panel>
        )}
      </div>

      {notice && (
        <div className="mt-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(214,162,52,0.12)', border: '1px solid rgba(214,162,52,0.4)', color: '#D6A234' }}>{notice}</div>
      )}

      {/* ---------------------------- Post editor ---------------------------- */}
      <Modal open={!!editing} onClose={() => { setEditing(null); setNotice(null); }} title={editing?.id ? 'Edit post' : 'New post'} wide
        footer={<>
          <Button variant="secondary" onClick={() => { setEditing(null); setNotice(null); }}>Cancel</Button>
          <Button variant="secondary" loading={saving} onClick={() => save('draft')}>Save draft</Button>
          <Button variant="gold" loading={saving} disabled={publishBlocked}
            disabledReason={publishBlocked ? `${liveFlags.length} compliance flag(s) must be cleared before publishing` : undefined}
            onClick={() => save('published')}>Publish</Button>
        </>}>
        {editing && (
          <div className="space-y-4">
            <Tabs tabs={[
              { label: 'Content', value: 'content' },
              { label: 'SEO', value: 'seo' },
              { label: 'CTA', value: 'cta' },
              { label: 'Compliance', value: 'compliance', count: liveFlags.length },
            ]} value={editorTab} onChange={setEditorTab} />

            {editorTab === 'content' && (
              <div className="space-y-4 pt-2">
                <TextInput label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Slug" hint="Generated from the title if left blank" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                  <SelectInput label="Category" value={editing.category} options={['', ...categories.map((c) => ({ value: c.slug, label: c.name }))]} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Author" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
                  <SelectInput label="Status" value={editing.status} options={STATUSES} onChange={(e) => setEditing({ ...editing, status: e.target.value })} />
                </div>
                {editing.status === 'scheduled' && (
                  <TextInput label="Publish at" type="datetime-local" value={editing.publish_at} onChange={(e) => setEditing({ ...editing, publish_at: e.target.value })} />
                )}
                <TextArea label="Excerpt" rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
                <TextArea label="Body (Markdown)" rows={14} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  hint={`${readingTimeMinutes(editing.body)} min read`} />
                <TextInput label="Featured image URL" value={editing.featured_image} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} />
              </div>
            )}

            {editorTab === 'seo' && (
              <div className="space-y-4 pt-2">
                <TextInput label="Meta title" hint={`${(editing.meta_title || '').length}/60`} value={editing.meta_title} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
                <TextArea label="Meta description" rows={3} hint={`${(editing.meta_description || '').length}/160`} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
                <TextInput label="Canonical URL" value={editing.canonical_url} onChange={(e) => setEditing({ ...editing, canonical_url: e.target.value })} />
                <TextInput label="Tags (comma-separated)" value={(editing.tags || []).join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
              </div>
            )}

            {editorTab === 'cta' && (
              <div className="space-y-4 pt-2">
                {ctas.length === 0 ? (
                  <NotConfigured title="No CTAs defined" description="Create a reusable CTA on the CTAs tab, then attach it to posts here." />
                ) : (
                  <>
                    <SelectInput label="CTA" value={editing.cta_id}
                      options={[{ value: '', label: 'Use the default CTA' }, ...ctas.map((c) => ({ value: c.id, label: c.name }))]}
                      onChange={(e) => setEditing({ ...editing, cta_id: e.target.value })} />
                    <SelectInput label="Position" value={editing.cta_position} options={['top', 'middle', 'bottom', 'none']} onChange={(e) => setEditing({ ...editing, cta_position: e.target.value })} />
                  </>
                )}
              </div>
            )}

            {editorTab === 'compliance' && (
              <div className="space-y-3 pt-2">
                {liveFlags.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.3)' }}>
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#3FB950' }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#3FB950' }}>No compliance issues found</p>
                      <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Checked title, excerpt, body and meta fields against the banned-phrase list.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(229,83,75,0.12)', border: '1px solid rgba(229,83,75,0.3)' }}>
                      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#E5534B' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#E5534B' }}>Publishing is blocked</p>
                        <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Edit the copy to remove each phrase below. The Publish button unlocks once this list is empty.</p>
                      </div>
                    </div>
                    {liveFlags.map((f, i) => (
                      <Panel key={i}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill>{f.field}</Pill>
                          <span className="text-sm font-semibold" style={{ color: '#E5534B' }}>“{f.phrase}”</span>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: '#93AAB2' }}>{f.reason}</p>
                        <p className="mt-1.5 text-xs italic" style={{ color: '#5E7681' }}>{f.context}</p>
                      </Panel>
                    ))}
                  </>
                )}
                {!instructions && (
                  <NotConfigured title="Using built-in rules only"
                    description="No BlogInstructions record exists yet, so only the built-in MVA advertising rules are applied. Add your own banned phrases in Settings → Knowledge Base."
                    settingsHref="/admin/settings/knowledge-base" />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Anyone linking to /blog/${deleteTarget?.slug} will get a 404.`} />

      {/* -------------------------- Category editor -------------------------- */}
      <Modal open={!!editingCategory} onClose={() => setEditingCategory(null)} title={editingCategory?.id ? 'Edit category' : 'New category'}
        footer={<><Button variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button><Button variant="gold" onClick={saveCategory}>Save</Button></>}>
        {editingCategory && (
          <div className="space-y-4">
            <TextInput label="Name" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
            <TextInput label="Slug" hint="Generated from the name if left blank" value={editingCategory.slug} onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })} />
            <TextArea label="Description" rows={3} value={editingCategory.description} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} />
          </div>
        )}
      </Modal>

      {/* ----------------------------- CTA editor ---------------------------- */}
      <Modal open={!!editingCta} onClose={() => setEditingCta(null)} title={editingCta?.id ? 'Edit CTA' : 'New CTA'}
        footer={<><Button variant="secondary" onClick={() => setEditingCta(null)}>Cancel</Button><Button variant="gold" onClick={saveCta}>Save</Button></>}>
        {editingCta && (
          <div className="space-y-4">
            <TextInput label="Name" value={editingCta.name} onChange={(e) => setEditingCta({ ...editingCta, name: e.target.value })} />
            <TextInput label="Headline" value={editingCta.headline} onChange={(e) => setEditingCta({ ...editingCta, headline: e.target.value })} />
            <TextArea label="Body" rows={3} value={editingCta.body} onChange={(e) => setEditingCta({ ...editingCta, body: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Button text" value={editingCta.button_text} onChange={(e) => setEditingCta({ ...editingCta, button_text: e.target.value })} />
              <TextInput label="Button URL" value={editingCta.button_url} onChange={(e) => setEditingCta({ ...editingCta, button_url: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
