import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, DataTable, Toggle, StatusBadge, EmptyState, ConfirmDialog, Modal } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Radio } from 'lucide-react';

const PROVIDERS = ['meta', 'google_ads', 'tiktok', 'taboola', 'ga4'];
const blank = { provider: 'meta', pixel_id: '', server_side_enabled: false, capi_secret_ref: '', event_name_lead: 'Lead', event_name_qualified: 'QualifiedLead', enabled: false };

export default function Tracking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => { setLoading(true); setRows((await base44.entities.TrackingConfig.list().catch(() => [])) || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) await base44.entities.TrackingConfig.update(editing.id, editing);
    else await base44.entities.TrackingConfig.create(editing);
    setEditing(null); load();
  };
  const toggleEnabled = async (row) => { await base44.entities.TrackingConfig.update(row.id, { enabled: !row.enabled }); load(); };
  const confirmDelete = async () => { await base44.entities.TrackingConfig.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Tracking" description="Pixel and server-side event configuration only — reporting on what these events produced lives in Analytics."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Tracking Config</Button>} />
      <Panel padded={false}>
        <DataTable
          loading={loading} rows={rows}
          empty={<EmptyState icon={Radio} title="No tracking configured yet" action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Tracking Config</Button>} />}
          columns={[
            { key: 'provider', header: 'Provider' },
            { key: 'pixel_id', header: 'Pixel ID' },
            { key: 'server_side_enabled', header: 'Server-side', render: (r) => r.server_side_enabled ? <StatusBadge label="enabled" tone="success" /> : <StatusBadge label="off" tone="neutral" /> },
            { key: 'enabled', header: 'Active', render: (r) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={!!r.enabled} onChange={() => toggleEnabled(r)} /></div> },
            { key: 'actions', header: '', className: 'text-right', render: (r) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditing(r)} />
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(r)} />
              </div>
            ) },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit tracking config' : 'New tracking config'}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <SelectInput label="Provider" value={editing.provider} options={PROVIDERS} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} />
            <TextInput label="Pixel ID" value={editing.pixel_id} onChange={(e) => setEditing({ ...editing, pixel_id: e.target.value })} />
            <TextInput label="Server-side (CAPI) secret reference" hint="Environment secret name — never the token value itself" value={editing.capi_secret_ref} onChange={(e) => setEditing({ ...editing, capi_secret_ref: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Lead event name" value={editing.event_name_lead} onChange={(e) => setEditing({ ...editing, event_name_lead: e.target.value })} />
              <TextInput label="Qualified event name" value={editing.event_name_qualified} onChange={(e) => setEditing({ ...editing, event_name_qualified: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!editing.server_side_enabled} onChange={(v) => setEditing({ ...editing, server_side_enabled: v })} /> Server-side events enabled
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} /> Active
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`Events will stop firing to ${deleteTarget?.provider}. Historical Analytics numbers are unaffected.`} />
    </AdminLayout>
  );
}
