import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, DataTable, StatusBadge, Modal,
  ConfirmDialog, EmptyState, Pill, Toggle, NotConfigured, SectionTitle, FieldRow,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Plug, KeyRound } from 'lucide-react';

const blank = { name: '', provider: '', status: 'not_configured', secret_ref: '', config: {}, last_checked_at: '' };

// Integrations the panel knows how to talk about. Anything else can still be
// added manually as a generic entry.
const KNOWN = [
  { provider: 'leadbyte', label: 'LeadByte', hint: 'Lead distribution to buyers', secret: 'LEADBYTE_API_KEY' },
  { provider: 'ringba', label: 'Ringba', hint: 'Inbound call tracking and routing', secret: 'RINGBA_API_TOKEN' },
  { provider: 'trustedform', label: 'TrustedForm', hint: 'TCPA consent certificates', secret: 'TRUSTEDFORM_API_KEY' },
  { provider: 'slack', label: 'Slack', hint: 'New-lead alerts', secret: 'SLACK_WEBHOOK_URL' },
  { provider: 'anthropic', label: 'Anthropic', hint: 'Powers the site bot', secret: 'ANTHROPIC_API_KEY' },
];

export default function IntegrationsSettings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Integration.list()) || []); }
    catch (e) { setError(e?.message || 'Failed to load integrations'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const configured = new Set(rows.map((r) => r.provider));
  const suggestions = KNOWN.filter((k) => !configured.has(k.provider));

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await base44.entities.Integration.update(editing.id, editing);
      else await base44.entities.Integration.create(editing);
      setEditing(null); load();
    } finally { setSaving(false); }
  };
  const confirmDelete = async () => { await base44.entities.Integration.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Integrations" description="Third-party connections. Credentials are stored as environment secret references only, never as values."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Integration</Button>} />

      <div className="mb-6">
        <NotConfigured title="How credentials work here"
          description="This page records which secret each integration uses, by name. The secret value itself lives in the Base44 environment settings and is never stored in, shown by, or retrievable from this panel." />
      </div>

      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={rows} onRowClick={setEditing}
          empty={<div className="p-4"><EmptyState icon={Plug} title="No integrations yet"
            description="Record the connections this site depends on so the team knows what's wired up."
            action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Integration</Button>} /></div>}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'provider', header: 'Provider', render: (r) => <Pill>{r.provider}</Pill> },
            { key: 'secret_ref', header: 'Secret reference', render: (r) => r.secret_ref ? <Pill>{r.secret_ref}</Pill> : null },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'last_checked_at', header: 'Last checked', render: (r) => r.last_checked_at ? new Date(r.last_checked_at).toLocaleDateString() : null },
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

      {suggestions.length > 0 && (
        <div className="mt-6">
          <SectionTitle hint="Not yet recorded">Common for this stack</SectionTitle>
          <Panel padded={false}>
            <div className="divide-y" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
              {suggestions.map((s) => (
                <div key={s.provider} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#E8F1EF' }}>{s.label}</div>
                    <div className="text-xs" style={{ color: '#5E7681' }}>{s.hint}</div>
                  </div>
                  <Button variant="secondary" size="sm" icon={Plus}
                    onClick={() => setEditing({ ...blank, name: s.label, provider: s.provider, secret_ref: s.secret })}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit integration' : 'New integration'}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" loading={saving} onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <TextInput label="Provider" hint="Lowercase identifier, e.g. leadbyte" value={editing.provider} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} />
            <TextInput label="Secret reference" hint="Name of the environment secret, e.g. LEADBYTE_API_KEY. Never paste the credential itself."
              value={editing.secret_ref} onChange={(e) => setEditing({ ...editing, secret_ref: e.target.value })} />
            <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: 'rgba(88,166,255,0.12)', border: '1px solid rgba(88,166,255,0.3)' }}>
              <KeyRound className="h-4 w-4 flex-shrink-0" style={{ color: '#58A6FF' }} />
              <span className="text-xs" style={{ color: '#93AAB2' }}>
                This field records the secret's <em>name</em>, not its value. Pasting an actual key here would store it in plain text.
              </span>
            </div>
            <label className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: '1px solid rgba(148,180,190,0.14)' }}>
              <span className="text-sm" style={{ color: '#E8F1EF' }}>Mark as connected</span>
              <Toggle checked={editing.status === 'connected'}
                onChange={(v) => setEditing({ ...editing, status: v ? 'connected' : 'not_configured', last_checked_at: new Date().toISOString() })} />
            </label>
            {editing.id && (
              <div>
                <SectionTitle>Record</SectionTitle>
                <FieldRow label="Status" value={<StatusBadge status={editing.status} />} />
                <FieldRow label="Last checked" value={editing.last_checked_at ? new Date(editing.last_checked_at).toLocaleString() : null} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.name}" will be removed from this list. The underlying environment secret and anything using it are unaffected.`} />
    </AdminLayout>
  );
}
