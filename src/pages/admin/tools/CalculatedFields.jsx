import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, TextArea, DataTable, Pill, Modal, ConfirmDialog, Toggle, StatusBadge, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Copy, PlayCircle, Sparkles } from 'lucide-react';

const TRANSFORM_TYPES = ['value_map', 'date_age_bucket', 'clone', 'conditional', 'script'];
const blank = { token: '', label: '', vertical: 'personal_injury', input_field: '', depends_on: [], transform_type: 'value_map', config: {}, enabled: true, sort_order: 0 };

function ValueMapEditor({ config, onChange }) {
  const mappings = config.mappings || [];
  const update = (i, key, val) => { const next = [...mappings]; next[i] = { ...next[i], [key]: val }; onChange({ ...config, mappings: next }); };
  return (
    <div className="space-y-2">
      {mappings.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput placeholder="from" value={m.from || ''} onChange={(e) => update(i, 'from', e.target.value)} className="flex-1" />
          <span style={{ color: '#5E7681' }}>→</span>
          <TextInput placeholder="to" value={m.to || ''} onChange={(e) => update(i, 'to', e.target.value)} className="flex-1" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onChange({ ...config, mappings: mappings.filter((_, x) => x !== i) })} />
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => onChange({ ...config, mappings: [...mappings, { from: '', to: '' }] })}>Add mapping</Button>
      <TextInput label="Default (no match)" value={config.default || ''} onChange={(e) => onChange({ ...config, default: e.target.value })} />
      <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
        <Toggle checked={!!config.case_insensitive_fallback} onChange={(v) => onChange({ ...config, case_insensitive_fallback: v })} /> Case-insensitive/trimmed fallback pass
      </label>
    </div>
  );
}

function DateAgeBucketEditor({ config, onChange }) {
  const buckets = config.buckets || [];
  const update = (i, key, val) => { const next = [...buckets]; next[i] = { ...next[i], [key]: val }; onChange({ ...config, buckets: next }); };
  return (
    <div className="space-y-2">
      {buckets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput type="number" placeholder="max days" value={b.max_days ?? ''} onChange={(e) => update(i, 'max_days', Number(e.target.value))} className="w-32" />
          <span style={{ color: '#5E7681' }}>→</span>
          <TextInput placeholder="value" value={b.value || ''} onChange={(e) => update(i, 'value', e.target.value)} className="flex-1" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onChange({ ...config, buckets: buckets.filter((_, x) => x !== i) })} />
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => onChange({ ...config, buckets: [...buckets, { max_days: 0, value: '' }] })}>Add bucket</Button>
      <TextInput label="Fallback (no bucket fits)" value={config.fallback || ''} onChange={(e) => onChange({ ...config, fallback: e.target.value })} />
    </div>
  );
}

function RawConfigEditor({ config, onChange, hint }) {
  const [text, setText] = useState(JSON.stringify(config || {}, null, 2));
  const [err, setErr] = useState(null);
  useEffect(() => { setText(JSON.stringify(config || {}, null, 2)); }, [config]);
  return (
    <TextArea label="Config (JSON)" hint={hint} error={err} rows={8} value={text}
      onChange={(e) => {
        setText(e.target.value);
        try { onChange(JSON.parse(e.target.value)); setErr(null); }
        catch { setErr('Invalid JSON — not saved until this parses'); }
      }} />
  );
}

export default function CalculatedFields() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tester, setTester] = useState(null); // the field being tested
  const [sampleJson, setSampleJson] = useState('{\n  "accident_state": "TX"\n}');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.CalculatedField.list('sort_order')) || []); }
    catch (e) { setError(e?.message || 'Failed to load calculated fields'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) await base44.entities.CalculatedField.update(editing.id, editing);
    else await base44.entities.CalculatedField.create(editing);
    setEditing(null); load();
  };
  const duplicate = async (row) => {
    const { id: _id, ...rest } = row;
    await base44.entities.CalculatedField.create({ ...rest, token: `${row.token}_copy`, label: `${row.label} (copy)`, enabled: false });
    load();
  };
  const confirmDelete = async () => { await base44.entities.CalculatedField.delete(deleteTarget.id); setDeleteTarget(null); load(); };
  const toggleEnabled = async (row) => { await base44.entities.CalculatedField.update(row.id, { enabled: !row.enabled }); load(); };

  const runTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const sample = JSON.parse(sampleJson);
      const res = await base44.functions.invoke('runCalculatedFields', { sample, field_id: tester.id });
      setTestResult(res?.data || res);
    } catch (e) {
      setTestResult({ ok: false, error: e?.message || String(e) });
    }
    setTesting(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Calculated Fields"
        description="Derives values from captured data on ingest, on change, and before every outbound webhook payload is built."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Calculated Field</Button>}
      />
      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<EmptyState icon={Sparkles} title="No calculated fields yet" description="Derive qualification, buyer mappings, or age buckets from captured data." action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Calculated Field</Button>} />}
          rows={rows}
          columns={[
            { key: 'token', header: 'Token', render: (r) => <Pill>{r.token}</Pill> },
            { key: 'label', header: 'Label' },
            { key: 'vertical', header: 'Vertical' },
            { key: 'transform_type', header: 'Type', render: (r) => <StatusBadge label={r.transform_type} tone="neutral" /> },
            { key: 'input_field', header: 'Input field', render: (r) => <Pill>{r.input_field || '—'}</Pill> },
            { key: 'enabled', header: 'Enabled', render: (r) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={!!r.enabled} onChange={() => toggleEnabled(r)} /></div> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={PlayCircle} title="Test" onClick={() => { setTester(r); setTestResult(null); }} />
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => setEditing(r)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit calculated field' : 'New calculated field'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Token" hint="Output key, written to calculated_fields.<token>" value={editing.token} onChange={(e) => setEditing({ ...editing, token: e.target.value })} />
              <TextInput label="Label" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Input field" hint="A Lead field, custom_fields key, or another token" value={editing.input_field} onChange={(e) => setEditing({ ...editing, input_field: e.target.value })} />
              <SelectInput label="Transform type" value={editing.transform_type} options={TRANSFORM_TYPES} onChange={(e) => setEditing({ ...editing, transform_type: e.target.value, config: {} })} />
            </div>
            <TextInput label="Depends on (comma-separated tokens)" value={(editing.depends_on || []).join(', ')}
              onChange={(e) => setEditing({ ...editing, depends_on: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />

            {editing.transform_type === 'value_map' && <ValueMapEditor config={editing.config || {}} onChange={(c) => setEditing({ ...editing, config: c })} />}
            {editing.transform_type === 'date_age_bucket' && <DateAgeBucketEditor config={editing.config || {}} onChange={(c) => setEditing({ ...editing, config: c })} />}
            {editing.transform_type === 'clone' && <p className="text-sm" style={{ color: '#93AAB2' }}>Clone has no configuration — the input field's value is copied straight to the output.</p>}
            {editing.transform_type === 'conditional' && <RawConfigEditor config={editing.config} onChange={(c) => setEditing({ ...editing, config: c })} hint='{ "rule_groups": [{ "logic": "ALL", "conditions": [{ "field": "...", "operator": "equals", "value": "..." }], "output": "..." }], "fallback_template": "{{token}}" }' />}
            {editing.transform_type === 'script' && <RawConfigEditor config={editing.config} onChange={(c) => setEditing({ ...editing, config: c })} hint='{ "whitelisted_transform": "uppercase" } — one of uppercase, lowercase, trim, title_case, digits_only. Anything else passes the original value through with an explicit trace error.' />}

            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} /> Enabled
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.token}" will stop being calculated. Any webhook mapping that references {{${deleteTarget?.token}}} will resolve to blank.`} />

      <Modal open={!!tester} onClose={() => setTester(null)} title={`Test: ${tester?.label || ''}`} wide>
        {tester && (
          <div className="space-y-4">
            <TextArea label="Sample record (JSON)" rows={6} value={sampleJson} onChange={(e) => setSampleJson(e.target.value)} />
            <Button variant="gold" onClick={runTest} loading={testing}>Run test (dry-run — nothing is persisted)</Button>
            {testResult && (
              <div className="space-y-2">
                {testResult.ok === false && <p className="text-sm" style={{ color: '#E5534B' }}>{testResult.error}</p>}
                {(testResult.trace || []).map((t, i) => (
                  <Panel key={i}>
                    <div className="grid gap-1 text-sm">
                      <div><span style={{ color: '#93AAB2' }}>Input ({t.input_field}):</span> <span style={{ color: '#E8F1EF' }}>{JSON.stringify(t.input_value)}</span></div>
                      <div><span style={{ color: '#93AAB2' }}>Matched:</span> <span style={{ color: '#E8F1EF' }}>{t.matched || '—'}</span></div>
                      <div><span style={{ color: '#93AAB2' }}>Output:</span> <span style={{ color: '#3FB950', fontWeight: 600 }}>{JSON.stringify(t.output)}</span></div>
                      <div><span style={{ color: '#93AAB2' }}>Duration:</span> <span style={{ color: '#E8F1EF' }}>{t.duration_ms}ms</span></div>
                      {t.error && <div style={{ color: '#E5534B' }}>Error: {t.error}</div>}
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
