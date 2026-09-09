import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, DataTable, Pill, Modal, ConfirmDialog, Toggle, StatusBadge, Tabs, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Webhook as WebhookIcon, History } from 'lucide-react';

const RETRY_OPTIONS = ['none', '3x', '5x'];
const blank = { name: '', provider: '', endpoint_url: '', http_method: 'POST', auth_secret_ref: '', triggers: ['lead.created'], conditions: [], payload_mapping: {}, timeout_ms: 8000, retry_policy: '3x', enabled: true };

function successRate(w) {
  const total = (w.success_count || 0) + (w.failure_count || 0);
  if (total === 0) return '—';
  return `${Math.round(((w.success_count || 0) / total) * 100)}%`;
}

function MappingEditor({ mapping, onChange }) {
  const entries = Object.entries(mapping || {});
  const update = (i, key, val) => {
    const next = [...entries]; next[i] = [key, val];
    onChange(Object.fromEntries(next));
  };
  return (
    <div className="space-y-2">
      {entries.map(([k, v], i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput placeholder="outbound key" value={k} onChange={(e) => update(i, e.target.value, v)} className="flex-1" />
          <span style={{ color: '#5E7681' }}>=</span>
          <TextInput placeholder="literal or {{token}}" value={v} onChange={(e) => update(i, k, e.target.value)} className="flex-1" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { const next = entries.filter((_, x) => x !== i); onChange(Object.fromEntries(next)); }} />
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => onChange({ ...mapping, [`field_${entries.length + 1}`]: '' })}>Add mapping row</Button>
    </div>
  );
}

export default function Webhooks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editorTab, setEditorTab] = useState('config');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logsFor, setLogsFor] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testLeadId, setTestLeadId] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Webhook.list()) || []); }
    catch (e) { setError(e?.message || 'Failed to load webhooks'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) await base44.entities.Webhook.update(editing.id, editing);
    else await base44.entities.Webhook.create(editing);
    setEditing(null); load();
  };
  const confirmDelete = async () => { await base44.entities.Webhook.delete(deleteTarget.id); setDeleteTarget(null); load(); };
  const toggleEnabled = async (row) => { await base44.entities.Webhook.update(row.id, { enabled: !row.enabled }); load(); };

  const openLogs = async (webhook) => {
    setLogsFor(webhook);
    const deliveries = (await base44.entities.WebhookDelivery.filter({ webhook_id: webhook.id }).catch(() => [])) || [];
    setLogs(deliveries.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 50));
  };

  const runTest = async () => {
    if (!testLeadId) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await base44.functions.invoke('fireWebhooks', { lead_id: testLeadId, event: 'lead.created', webhook_id: editing.id, dry_run: true });
      setTestResult(res?.data || res);
    } catch (e) { setTestResult({ ok: false, error: e?.message || String(e) }); }
    setTesting(false);
  };

  return (
    <AdminLayout>
      <PageHeader title="Webhooks" description="Outbound delivery to buyers and downstream systems, with calculations, retries, and idempotency."
        actions={<Button variant="gold" icon={Plus} onClick={() => { setEditing({ ...blank }); setEditorTab('config'); }}>New Webhook</Button>} />
      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<EmptyState icon={WebhookIcon} title="No webhooks yet" description="Connect a lead buyer or downstream system." action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Webhook</Button>} />}
          rows={rows}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'provider', header: 'Provider' },
            { key: 'triggers', header: 'Trigger', render: (r) => (r.triggers || []).join(', ') },
            { key: 'endpoint_url', header: 'Endpoint', render: (r) => <span className="font-mono text-xs">{r.endpoint_url}</span> },
            { key: 'enabled', header: 'Enabled', render: (r) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={!!r.enabled} onChange={() => toggleEnabled(r)} /></div> },
            { key: 'last_delivery_status', header: 'Last delivery', render: (r) => r.last_delivery_status ? <StatusBadge status={r.last_delivery_status} /> : null },
            { key: 'success_rate', header: 'Success rate', render: successRate },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={History} title="Delivery log" onClick={() => openLogs(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => { setEditing(r); setEditorTab('config'); }} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit webhook' : 'New webhook'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Tabs tabs={[{ label: 'Configuration', value: 'config' }, { label: 'Payload Mapping', value: 'mapping' }, { label: 'Test', value: 'test' }]} value={editorTab} onChange={setEditorTab} />
            {editorTab === 'config' && (
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  <TextInput label="Provider" value={editing.provider} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} />
                </div>
                <TextInput label="Endpoint URL" value={editing.endpoint_url} onChange={(e) => setEditing({ ...editing, endpoint_url: e.target.value })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectInput label="Method" value={editing.http_method} options={['POST', 'GET', 'PUT']} onChange={(e) => setEditing({ ...editing, http_method: e.target.value })} />
                  <SelectInput label="Retry policy" value={editing.retry_policy} options={RETRY_OPTIONS} onChange={(e) => setEditing({ ...editing, retry_policy: e.target.value })} />
                </div>
                <TextInput label="Auth secret reference" hint="Name of an environment secret (e.g. LEADBYTE_API_KEY) — never the credential value itself" value={editing.auth_secret_ref} onChange={(e) => setEditing({ ...editing, auth_secret_ref: e.target.value })} />
                <TextInput label="Triggers (comma-separated)" value={(editing.triggers || []).join(', ')} onChange={(e) => setEditing({ ...editing, triggers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                  <Toggle checked={!!editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} /> Enabled
                </label>
              </div>
            )}
            {editorTab === 'mapping' && (
              <div className="pt-2">
                <MappingEditor mapping={editing.payload_mapping} onChange={(m) => setEditing({ ...editing, payload_mapping: m })} />
              </div>
            )}
            {editorTab === 'test' && (
              <div className="space-y-3 pt-2">
                <TextInput label="Lead ID to test against" value={testLeadId} onChange={(e) => setTestLeadId(e.target.value)} />
                <Button variant="gold" onClick={runTest} loading={testing} disabled={!editing.id} disabledReason="Save the webhook first">Resolve payload (dry-run — nothing is sent)</Button>
                {testResult && (
                  <pre className="overflow-x-auto rounded-lg p-3 text-xs" style={{ background: '#0D1A20', color: '#E8F1EF', border: '1px solid rgba(148,180,190,0.14)' }}>
                    {JSON.stringify(testResult.results?.[0]?.resolved_payload || testResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.name}" will stop receiving deliveries. Its delivery history is kept for audit purposes.`} />

      <Modal open={!!logsFor} onClose={() => setLogsFor(null)} title={`Delivery log: ${logsFor?.name || ''}`} wide>
        {logs.length === 0 ? <EmptyState title="No deliveries yet" /> : (
          <div className="space-y-2">
            {logs.map((l) => (
              <Panel key={l.id}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.status} />
                    <span style={{ color: '#93AAB2' }}>attempt {l.attempt_number}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: '#5E7681' }}>{l.http_status || '—'} · {l.duration_ms ?? '—'}ms</span>
                </div>
                {l.error_message && <p className="mt-1.5 text-xs" style={{ color: '#E5534B' }}>{l.error_message}</p>}
              </Panel>
            ))}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
