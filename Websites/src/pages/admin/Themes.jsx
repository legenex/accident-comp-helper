import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SearchInput, DataTable,
  StatusBadge, Modal, ConfirmDialog, EmptyState, Pill, SectionTitle,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Palette, Copy, CheckCircle2 } from 'lucide-react';
import { slugify } from '@/lib/compliance';

const blank = {
  name: '', slug: '', status: 'draft', description: '',
  config: { brand: '#028CC9', brandHover: '#2FA8DE', navy: '#0A1F2C', accent: '#D6A23C' },
};

const SWATCHES = [
  { key: 'brand', label: 'Brand / primary action' },
  { key: 'brandHover', label: 'Brand hover' },
  { key: 'navy', label: 'Dark surface' },
  { key: 'accent', label: 'Accent' },
];

export default function Themes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Theme.list('-created_date', 200)) || []); }
    catch (e) { setError(e?.message || 'Failed to load themes'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((t) => !search
    || t.name?.toLowerCase().includes(search.toLowerCase())
    || t.slug?.toLowerCase().includes(search.toLowerCase()));

  const activeTheme = rows.find((t) => t.status === 'active');

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...editing, slug: editing.slug || slugify(editing.name) };
      if (editing.id) await base44.entities.Theme.update(editing.id, payload);
      else await base44.entities.Theme.create(payload);
      setEditing(null); load();
    } finally { setSaving(false); }
  };

  // Exactly one theme can be active. Activating one stands the others down,
  // rather than leaving several claiming to be live.
  const activate = async (theme) => {
    setNotice(null);
    try {
      for (const other of rows.filter((t) => t.status === 'active' && t.id !== theme.id)) {
        await base44.entities.Theme.update(other.id, { status: 'draft' });
      }
      await base44.entities.Theme.update(theme.id, { status: 'active' });
      setNotice(`"${theme.name}" is now the active theme.`);
      load();
    } catch (e) { setNotice(`Could not activate: ${e?.message || String(e)}`); }
  };

  const duplicate = async (t) => {
    const { id: _id, created_date: _c, updated_date: _u, ...rest } = t;
    await base44.entities.Theme.create({ ...rest, name: `${t.name} (copy)`, slug: `${t.slug}-copy`, status: 'draft' });
    load();
  };

  const confirmDelete = async () => { await base44.entities.Theme.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  const setColor = (key, value) => setEditing({ ...editing, config: { ...(editing.config || {}), [key]: value } });

  return (
    <AdminLayout>
      <PageHeader title="Themes" description={activeTheme ? `Active theme: ${activeTheme.name}` : 'No theme is currently active — the site is using its built-in defaults.'}
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Theme</Button>} />

      {notice && (
        <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>{notice}</div>
      )}

      <Panel padded={false}>
        <div className="p-4"><SearchInput value={search} onChange={setSearch} placeholder="Search themes..." /></div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={filtered} onRowClick={setEditing}
          empty={<div className="p-4"><EmptyState icon={Palette} title="No themes yet"
            description="Define a colour set you can switch the public site to without a code change."
            action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Theme</Button>} /></div>}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'slug', header: 'Slug', render: (t) => <Pill>{t.slug}</Pill> },
            {
              key: 'colors', header: 'Colours',
              render: (t) => (
                <div className="flex gap-1">
                  {SWATCHES.map((s) => (
                    <span key={s.key} title={`${s.label}: ${t.config?.[s.key] || 'unset'}`}
                      className="h-4 w-4 rounded" style={{ background: t.config?.[s.key] || 'transparent', border: '1px solid rgba(148,180,190,0.26)' }} />
                  ))}
                </div>
              ),
            },
            { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (t) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={CheckCircle2} title={t.status === 'active' ? 'Already active' : 'Make active'}
                    disabled={t.status === 'active'} disabledReason="This is already the active theme"
                    onClick={() => activate(t)} />
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(t)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => setEditing(t)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(t)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit theme' : 'New theme'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" loading={saving} onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <TextInput label="Slug" hint="Generated from the name if left blank" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <TextArea label="Description" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />

            <div>
              <SectionTitle>Colours</SectionTitle>
              <div className="space-y-3">
                {SWATCHES.map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <input type="color" value={editing.config?.[s.key] || '#000000'} onChange={(e) => setColor(s.key, e.target.value)}
                      className="h-9 w-12 flex-shrink-0 cursor-pointer rounded border-0 bg-transparent" title={s.label} />
                    <div className="min-w-0 flex-1">
                      <TextInput label={s.label} value={editing.config?.[s.key] || ''} onChange={(e) => setColor(s.key, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Preview</SectionTitle>
              <Panel>
                <div className="rounded-xl p-6 text-center" style={{ background: editing.config?.navy || '#0A1F2C' }}>
                  <h3 className="font-heading text-lg font-bold text-white">Injured in an accident?</h3>
                  <p className="mt-1.5 text-sm text-white/60">Find out in two minutes whether you may qualify.</p>
                  <div className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                    style={{ background: editing.config?.brand || '#028CC9' }}>
                    Check my claim
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={deleteTarget?.status === 'active'
          ? `"${deleteTarget?.name}" is the ACTIVE theme. Deleting it will drop the site back to its built-in default colours.`
          : `"${deleteTarget?.name}" will be permanently deleted.`} />
    </AdminLayout>
  );
}
