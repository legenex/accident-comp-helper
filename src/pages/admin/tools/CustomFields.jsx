import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, SearchInput, DataTable, Pill, Modal, ConfirmDialog, Toggle, StatusBadge } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Download, Upload, Edit, Trash2, Database } from 'lucide-react';

const FIELD_TYPES = ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'date', 'email', 'phone'];
const blank = { canonical_name: '', label: '', field_type: 'text', category: '', required: false, downstream_mapping_key: '', is_canonical: false, deprecated: false, sort_order: 0 };

export default function CustomFields() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockedRefs, setBlockedRefs] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.CustomField.list('sort_order')) || []); }
    catch (e) { setError(e?.message || 'Failed to load the field registry'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => ['All', ...new Set(rows.map((r) => r.category).filter(Boolean))], [rows]);
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.canonical_name?.toLowerCase().includes(q) || r.label?.toLowerCase().includes(q);
    const matchesCat = category === 'All' || r.category === category;
    return matchesSearch && matchesCat;
  });

  const save = async () => {
    if (editing.id) await base44.entities.CustomField.update(editing.id, editing);
    else await base44.entities.CustomField.create(editing);
    setEditing(null); load();
  };

  // Reference-blocking delete: check CalculatedField.input_field, Webhook
  // payload_mapping, and ContactForm.field_keys before allowing a delete.
  const attemptDelete = async (field) => {
    const [calcFields, webhooks, forms] = await Promise.all([
      base44.entities.CalculatedField.list().catch(() => []),
      base44.entities.Webhook.list().catch(() => []),
      base44.entities.ContactForm.list().catch(() => []),
    ]);
    const refs = [];
    (calcFields || []).forEach((c) => { if (c.input_field === field.canonical_name) refs.push(`Calculated field "${c.label}" reads this field`); });
    (webhooks || []).forEach((w) => {
      const mapping = w.payload_mapping || {};
      if (Object.values(mapping).some((v) => typeof v === 'string' && v.includes(`{{${field.canonical_name}}}`))) refs.push(`Webhook "${w.name}" maps this field`);
    });
    (forms || []).forEach((f) => { if ((f.field_keys || []).includes(field.canonical_name)) refs.push(`Contact form "${f.name}" includes this field`); });

    if (refs.length > 0) { setBlockedRefs({ field, refs }); return; }
    setDeleteTarget(field);
  };

  const confirmDelete = async () => {
    await base44.entities.CustomField.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'custom-fields.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    let incoming = [];
    try { incoming = JSON.parse(text); } catch { alert('Invalid JSON file'); return; }
    const existingNames = new Set(rows.map((r) => r.canonical_name));
    let created = 0, skipped = 0;
    for (const item of incoming) {
      if (existingNames.has(item.canonical_name)) { skipped++; continue; }
      await base44.entities.CustomField.create(item);
      created++;
    }
    alert(`Imported ${created} field(s), skipped ${skipped} duplicate token(s).`);
    load();
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Custom Fields"
        description="The field registry — the dictionary everything else references. No feature invents its own field name."
        actions={<>
          <Button variant="secondary" icon={Upload} as="label">
            Import<input type="file" accept="application/json" className="hidden" onChange={importJson} />
          </Button>
          <Button variant="secondary" icon={Download} onClick={exportJson}>Export</Button>
          <Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Field</Button>
        </>}
      />

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or label..." className="min-w-[220px] flex-1" />
          <SelectInput value={category} onChange={(e) => setCategory(e.target.value)} options={categories} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<div className="p-4"><Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>Add the first field</Button></div>}
          rows={filtered}
          columns={[
            { key: 'canonical_name', header: 'Name', render: (r) => <Pill>{r.canonical_name}</Pill> },
            { key: 'label', header: 'Label' },
            { key: 'field_type', header: 'Type', render: (r) => <StatusBadge label={r.field_type} tone="neutral" /> },
            { key: 'category', header: 'Category' },
            { key: 'required', header: 'Required', render: (r) => r.required ? <StatusBadge label="required" tone="warning" /> : null },
            { key: 'deprecated', header: 'Status', render: (r) => r.deprecated ? <StatusBadge label="deprecated" tone="neutral" /> : <StatusBadge label="active" tone="success" /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditing(r)} title="Edit" />
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => attemptDelete(r)} title="Delete" />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit field' : 'New field'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Canonical name" hint="e.g. accident_state" value={editing.canonical_name} onChange={(e) => setEditing({ ...editing, canonical_name: e.target.value })} />
              <TextInput label="Label" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Type" value={editing.field_type} options={FIELD_TYPES} onChange={(e) => setEditing({ ...editing, field_type: e.target.value })} />
              <TextInput label="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </div>
            <TextInput label="Downstream mapping key" hint="Field name a buyer/system expects, if different from the canonical name" value={editing.downstream_mapping_key} onChange={(e) => setEditing({ ...editing, downstream_mapping_key: e.target.value })} />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                <Toggle checked={!!editing.required} onChange={(v) => setEditing({ ...editing, required: v })} /> Required
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                <Toggle checked={!!editing.deprecated} onChange={(v) => setEditing({ ...editing, deprecated: v })} /> Deprecated
              </label>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="Delete this field?" confirmLabel="Delete"
        consequence={`"${deleteTarget?.canonical_name}" will be removed from the registry. Anything that referenced it by name will start reading an undefined value.`} />

      <Modal open={!!blockedRefs} onClose={() => setBlockedRefs(null)} title="This field is still referenced"
        footer={<Button variant="secondary" onClick={() => setBlockedRefs(null)}>Close</Button>}>
        <p className="mb-3 text-sm" style={{ color: '#93AAB2' }}>Remove these references first, then delete "{blockedRefs?.field?.canonical_name}":</p>
        <ul className="space-y-1.5 text-sm" style={{ color: '#E8F1EF' }}>
          {blockedRefs?.refs.map((r, i) => <li key={i} className="flex items-start gap-2"><Database className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: '#5E7681' }} />{r}</li>)}
        </ul>
      </Modal>
    </AdminLayout>
  );
}
