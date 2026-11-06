import React, { useEffect, useState, useMemo, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, SearchInput, DataTable, Pill, Modal, ConfirmDialog, Toggle, StatusBadge, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Download, Upload, Edit, Trash2, Database, DownloadCloud } from 'lucide-react';
import { CUSTOM_FIELDS_SEED } from '@/lib/seed/registrySeed';

const FIELD_TYPES = ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'date', 'email', 'phone', 'system', 'Calculated'];
const blank = {
  field_name: '', label: '', field_type: 'text', source: 'inbound', sample_value: '',
  options: [], include_in_leadbyte: false, leadbyte_field_name: '', auto_created: false,
  sort_order: 0, required: false, system_role: '', deprecated: false,
};

export default function CustomFields() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockedRefs, setBlockedRefs] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const importInputRef = useRef(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.CustomField.list('sort_order', 500)) || []); }
    catch (e) { setError(e?.message || 'Failed to load the field registry'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const types = useMemo(() => ['All', ...new Set(rows.map((r) => r.field_type).filter(Boolean))], [rows]);
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.field_name?.toLowerCase().includes(q) || r.label?.toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || r.field_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const save = async () => {
    if (editing.id) await base44.entities.CustomField.update(editing.id, editing);
    else await base44.entities.CustomField.create(editing);
    setEditing(null); load();
  };

  // Import is idempotent: existing field_names are skipped, never overwritten,
  // so re-running can't clobber live configuration.
  const importRecords = async (incoming) => {
    setBusy(true); setNotice(null);
    try {
      const existing = new Set(rows.map((r) => r.field_name));
      const toCreate = incoming.filter((f) => f.field_name && !existing.has(f.field_name));
      for (const item of toCreate) {
        const { id: _id, ...rest } = item;
        await base44.entities.CustomField.create(rest);
      }
      setNotice(`Imported ${toCreate.length} field(s), skipped ${incoming.length - toCreate.length} already present.`);
      await load();
    } catch (e) {
      setNotice(`Import failed: ${e?.message || String(e)}`);
    }
    setBusy(false);
  };

  const loadDefaults = () => importRecords(CUSTOM_FIELDS_SEED);

  const importJson = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    let incoming = [];
    try { incoming = JSON.parse(await file.text()); } catch { setNotice('Invalid JSON file'); return; }
    if (!Array.isArray(incoming)) { setNotice('Expected a JSON array of field definitions'); return; }
    importRecords(incoming);
    e.target.value = '';
  };

  const exportJson = () => {
    const clean = rows.map(({ id: _id, created_date: _c, updated_date: _u, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'custom-fields.json'; a.click();
    URL.revokeObjectURL(url);
  };

  // Reference-blocking delete: a field still referenced by a calculated
  // field, webhook mapping or contact form shows its references instead of
  // being deleted.
  const attemptDelete = async (field) => {
    const [calcFields, webhooks, forms] = await Promise.all([
      base44.entities.CalculatedField.list().catch(() => []),
      base44.entities.Webhook.list().catch(() => []),
      base44.entities.ContactForm.list().catch(() => []),
    ]);
    const refs = [];
    (calcFields || []).forEach((c) => {
      if (c.input_field === field.field_name) refs.push(`Calculated field "${c.output_label || c.output_token}" reads this field`);
      if (typeof c.config === 'string' && c.config.includes(`"${field.field_name}"`)) refs.push(`Calculated field "${c.output_label || c.output_token}" references it in a condition`);
    });
    (webhooks || []).forEach((w) => {
      if (Object.values(w.payload_mapping || {}).some((v) => typeof v === 'string' && v.includes(`{{${field.field_name}}}`))) refs.push(`Webhook "${w.name}" maps this field`);
    });
    (forms || []).forEach((f) => { if ((f.field_keys || []).includes(field.field_name)) refs.push(`Contact form "${f.name}" includes this field`); });

    if (refs.length > 0) { setBlockedRefs({ field, refs: [...new Set(refs)] }); return; }
    setDeleteTarget(field);
  };

  const confirmDelete = async () => {
    await base44.entities.CustomField.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Custom Fields"
        description="The field registry — the dictionary everything else references. No feature invents its own field name."
        actions={<>
          <Button variant="secondary" icon={DownloadCloud} loading={busy} onClick={loadDefaults}>Load default registry</Button>
          <Button variant="secondary" icon={Upload} onClick={() => importInputRef.current?.click()}>Import</Button>
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
          <Button variant="secondary" icon={Download} onClick={exportJson}>Export</Button>
          <Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Field</Button>
        </>}
      />

      {notice && (
        <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>
          {notice}
        </div>
      )}

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or label..." className="min-w-[220px] flex-1" />
          <SelectInput value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={types} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<div className="p-4"><EmptyState icon={Database} title="No fields in the registry yet"
            description="Load the default Legenex registry (82 fields) or import your own export."
            action={<Button variant="gold" icon={DownloadCloud} loading={busy} onClick={loadDefaults}>Load default registry</Button>} /></div>}
          rows={filtered}
          columns={[
            { key: 'field_name', header: 'Field name', render: (r) => <Pill>{r.field_name}</Pill> },
            { key: 'label', header: 'Label' },
            { key: 'field_type', header: 'Type', render: (r) => <StatusBadge label={r.field_type} tone="neutral" /> },
            { key: 'source', header: 'Source' },
            { key: 'leadbyte_field_name', header: 'Downstream key', render: (r) => r.leadbyte_field_name ? <Pill>{r.leadbyte_field_name}</Pill> : null },
            { key: 'include_in_leadbyte', header: 'In payload', render: (r) => r.include_in_leadbyte ? <StatusBadge label="yes" tone="success" /> : <StatusBadge label="no" tone="neutral" /> },
            { key: 'required', header: 'Required', render: (r) => r.required ? <StatusBadge label="required" tone="warning" /> : null },
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
              <TextInput label="Field name" hint="Canonical name, e.g. accident_state" value={editing.field_name} onChange={(e) => setEditing({ ...editing, field_name: e.target.value })} />
              <TextInput label="Label" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Type" value={editing.field_type} options={FIELD_TYPES} onChange={(e) => setEditing({ ...editing, field_type: e.target.value })} />
              <TextInput label="Source" value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} />
            </div>
            <TextInput label="Downstream field name" hint="What the buyer/downstream system expects, if different" value={editing.leadbyte_field_name} onChange={(e) => setEditing({ ...editing, leadbyte_field_name: e.target.value })} />
            <TextInput label="Options (comma-separated)" value={(editing.options || []).join(', ')}
              onChange={(e) => setEditing({ ...editing, options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            <TextInput label="Sample value" value={editing.sample_value} onChange={(e) => setEditing({ ...editing, sample_value: e.target.value })} />
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                <Toggle checked={!!editing.required} onChange={(v) => setEditing({ ...editing, required: v })} /> Required
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                <Toggle checked={!!editing.include_in_leadbyte} onChange={(v) => setEditing({ ...editing, include_in_leadbyte: v })} /> Include in buyer payload
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
        consequence={`"${deleteTarget?.field_name}" will be removed from the registry. Anything that referenced it by name will start reading an undefined value.`} />

      <Modal open={!!blockedRefs} onClose={() => setBlockedRefs(null)} title="This field is still referenced"
        footer={<Button variant="secondary" onClick={() => setBlockedRefs(null)}>Close</Button>}>
        <p className="mb-3 text-sm" style={{ color: '#93AAB2' }}>Remove these references first, then delete "{blockedRefs?.field?.field_name}":</p>
        <ul className="space-y-1.5 text-sm" style={{ color: '#E8F1EF' }}>
          {blockedRefs?.refs.map((r, i) => <li key={i} className="flex items-start gap-2"><Database className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: '#5E7681' }} />{r}</li>)}
        </ul>
      </Modal>
    </AdminLayout>
  );
}
