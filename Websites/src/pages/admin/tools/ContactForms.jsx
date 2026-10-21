import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, DataTable, Modal, ConfirmDialog, Toggle, StatusBadge, EmptyState, FieldRow } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, FileEdit } from 'lucide-react';

const blank = { name: '', slug: '', field_keys: [], presentation_overrides: {}, hidden_capture_enabled: true, submit_button_text: 'Send message', success_message: 'Thanks for reaching out. We will reply soon.', status: 'draft' };

export default function ContactForms() {
  const [rows, setRows] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [forms, fields] = await Promise.all([base44.entities.ContactForm.list(), base44.entities.CustomField.list('sort_order')]);
      setRows(forms || []); setRegistry(fields || []);
    } catch (e) { setError(e?.message || 'Failed to load contact forms'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) await base44.entities.ContactForm.update(editing.id, editing);
    else await base44.entities.ContactForm.create(editing);
    setEditing(null); load();
  };
  const confirmDelete = async () => { await base44.entities.ContactForm.delete(deleteTarget.id); setDeleteTarget(null); load(); };
  const toggleField = (key) => {
    const has = (editing.field_keys || []).includes(key);
    setEditing({ ...editing, field_keys: has ? editing.field_keys.filter((k) => k !== key) : [...(editing.field_keys || []), key] });
  };

  return (
    <AdminLayout>
      <PageHeader title="Contact Forms" description="Fields are selected from the Custom Fields registry, never invented. The public renderer submits into the canonical Lead pipeline."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Form</Button>} />
      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<EmptyState icon={FileEdit} title="No contact forms yet" action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Form</Button>} />}
          rows={rows}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'slug', header: 'Slug', render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
            { key: 'field_keys', header: 'Fields', render: (r) => (r.field_keys || []).length },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'submission_count', header: 'Submissions' },
            { key: 'actions', header: '', className: 'text-right', render: (r) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditing(r)} />
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(r)} />
              </div>
            ) },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit form' : 'New form'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <TextInput label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium" style={{ color: '#93AAB2' }}>Fields (from the registry)</div>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg p-2" style={{ border: '1px solid rgba(148,180,190,0.14)' }}>
                {registry.length === 0 ? <p className="p-2 text-sm" style={{ color: '#5E7681' }}>No fields in the registry yet — add some under Custom Fields first.</p> : registry.map((f) => (
                  <label key={f.field_name} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm" style={{ color: '#E8F1EF' }}>
                    <input type="checkbox" checked={(editing.field_keys || []).includes(f.field_name)} onChange={() => toggleField(f.field_name)} />
                    {f.label} <span className="font-mono text-xs" style={{ color: '#5E7681' }}>({f.field_name})</span>
                  </label>
                ))}
              </div>
            </div>
            <TextInput label="Submit button text" value={editing.submit_button_text} onChange={(e) => setEditing({ ...editing, submit_button_text: e.target.value })} />
            <TextInput label="Success message" value={editing.success_message} onChange={(e) => setEditing({ ...editing, success_message: e.target.value })} />
            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!editing.hidden_capture_enabled} onChange={(v) => setEditing({ ...editing, hidden_capture_enabled: v })} /> Hidden capture (attribution, consent) enabled
            </label>
            <FieldRow label="Status" value={
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="rounded px-2 py-1 text-sm" style={{ background: '#122430', color: '#E8F1EF', border: '1px solid rgba(148,180,190,0.26)' }}>
                <option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option>
              </select>} />
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.name}" will no longer be embeddable. Its past submissions are kept as Leads.`} />
    </AdminLayout>
  );
}
