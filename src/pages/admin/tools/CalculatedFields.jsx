import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, TextArea, DataTable, Pill, Modal, ConfirmDialog, Toggle, StatusBadge, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Copy, PlayCircle, Sparkles, Upload, Download, DownloadCloud } from 'lucide-react';
import { CALCULATED_FIELDS_SEED } from '@/lib/seed/registrySeed';

const TRANSFORM_TYPES = ['value_map', 'date_age_bucket', 'clone', 'conditional', 'script'];
const blank = { output_token: '', output_label: '', vertical: '', input_field: '', depends_on: [], transform_type: 'value_map', config: '{}', enabled: true, sort_order: 0 };

function parseCfg(config) {
  if (!config) return {};
  if (typeof config === 'object') return config;
  try { return JSON.parse(config); } catch { return {}; }
}

function ValueMapEditor({ cfg, setCfg }) {
  const entries = Object.entries(cfg.map || {});
  const update = (i, k, v) => {
    const next = [...entries]; next[i] = [k, v];
    setCfg({ ...cfg, map: Object.fromEntries(next) });
  };
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium" style={{ color: '#93AAB2' }}>Value map</div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput placeholder="from" value={k} onChange={(e) => update(i, e.target.value, v)} className="flex-1" />
            <span style={{ color: '#5E7681' }}>→</span>
            <TextInput placeholder="to" value={v} onChange={(e) => update(i, k, e.target.value)} className="flex-1" />
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setCfg({ ...cfg, map: Object.fromEntries(entries.filter((_, x) => x !== i)) })} />
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => setCfg({ ...cfg, map: { ...(cfg.map || {}), '': '' } })}>Add mapping</Button>
      <TextInput label="Default (no match)" value={cfg.default || ''} onChange={(e) => setCfg({ ...cfg, default: e.target.value })} />
    </div>
  );
}

function BucketEditor({ cfg, setCfg }) {
  const buckets = cfg.buckets || [];
  const update = (i, key, val) => { const next = [...buckets]; next[i] = { ...next[i], [key]: val }; setCfg({ ...cfg, buckets: next }); };
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium" style={{ color: '#93AAB2' }}>Buckets (ascending by max days, first fit wins)</div>
      {buckets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput type="number" placeholder="max days" value={b.max_days ?? ''} onChange={(e) => update(i, 'max_days', Number(e.target.value))} className="w-32" />
          <span style={{ color: '#5E7681' }}>→</span>
          <TextInput placeholder="label" value={b.label || ''} onChange={(e) => update(i, 'label', e.target.value)} className="flex-1" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setCfg({ ...cfg, buckets: buckets.filter((_, x) => x !== i) })} />
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => setCfg({ ...cfg, buckets: [...buckets, { max_days: 0, label: '' }] })}>Add bucket</Button>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Fallback" value={cfg.fallback || ''} onChange={(e) => setCfg({ ...cfg, fallback: e.target.value })} />
        <TextInput label="Date format" hint="e.g. MM/DD/YYYY" value={cfg.date_format || ''} onChange={(e) => setCfg({ ...cfg, date_format: e.target.value })} />
      </div>
    </div>
  );
}

function RawJsonEditor({ cfg, setCfg, hint }) {
  const [text, setText] = useState(JSON.stringify(cfg || {}, null, 2));
  const [err, setErr] = useState(null);
  useEffect(() => { setText(JSON.stringify(cfg || {}, null, 2)); /* eslint-disable-next-line */ }, []);
  return (
    <TextArea label="Config (JSON)" hint={hint} error={err} rows={12} value={text}
      onChange={(e) => {
        setText(e.target.value);
        try { setCfg(JSON.parse(e.target.value)); setErr(null); }
        catch { setErr('Invalid JSON — not saved until this parses'); }
      }} />
  );
}

const SCRIPT_TRANSFORMS = ['', 'mdy_to_iso', 'iso_to_mdy', 'uppercase', 'lowercase', 'trim', 'title_case', 'digits_only'];

export default function CalculatedFields() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editCfg, setEditCfg] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tester, setTester] = useState(null);
  const [sampleJson, setSampleJson] = useState('{\n  "injury_type": "Broken Bones",\n  "incident_date": "08/30/2026",\n  "accident_state": "TX",\n  "attorney": "no"\n}');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const importInputRef = useRef(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.CalculatedField.list('sort_order', 200)) || []); }
    catch (e) { setError(e?.message || 'Failed to load calculated fields'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (row) => { setEditing(row); setEditCfg(parseCfg(row.config)); };

  const save = async () => {
    const payload = { ...editing, config: JSON.stringify(editCfg) };
    if (editing.id) await base44.entities.CalculatedField.update(editing.id, payload);
    else await base44.entities.CalculatedField.create(payload);
    setEditing(null); load();
  };

  const importRecords = async (incoming) => {
    setBusy(true); setNotice(null);
    try {
      const existing = new Set(rows.map((r) => r.output_token));
      const toCreate = incoming.filter((f) => f.output_token && !existing.has(f.output_token));
      for (const item of toCreate) {
        const { id: _id, ...rest } = item;
        await base44.entities.CalculatedField.create({
          ...rest,
          config: typeof rest.config === 'string' ? rest.config : JSON.stringify(rest.config || {}),
        });
      }
      setNotice(`Imported ${toCreate.length} rule(s), skipped ${incoming.length - toCreate.length} duplicate token(s).`);
      await load();
    } catch (e) { setNotice(`Import failed: ${e?.message || String(e)}`); }
    setBusy(false);
  };

  const loadDefaults = () => importRecords(CALCULATED_FIELDS_SEED);

  const importJson = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    let incoming = [];
    try { incoming = JSON.parse(await file.text()); } catch { setNotice('Invalid JSON file'); return; }
    if (!Array.isArray(incoming)) { setNotice('Expected a JSON array of rules'); return; }
    importRecords(incoming);
    e.target.value = '';
  };

  const exportJson = () => {
    const clean = rows.map(({ id: _id, created_date: _c, updated_date: _u, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'calculated-fields.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const duplicate = async (row) => {
    const { id: _id, created_date: _c, updated_date: _u, ...rest } = row;
    await base44.entities.CalculatedField.create({ ...rest, output_token: `${row.output_token}_copy`, output_label: `${row.output_label || row.output_token} (copy)`, enabled: false });
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
    } catch (e) { setTestResult({ ok: false, error: e?.message || String(e) }); }
    setTesting(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Calculated Fields"
        description="Derives values from captured data on ingest, on change, and before every outbound webhook payload is built."
        actions={<>
          <Button variant="secondary" icon={DownloadCloud} loading={busy} onClick={loadDefaults}>Load default rules</Button>
          <Button variant="secondary" icon={Upload} onClick={() => importInputRef.current?.click()}>Import</Button>
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
          <Button variant="secondary" icon={Download} onClick={exportJson}>Export</Button>
          <Button variant="gold" icon={Plus} onClick={() => openEdit({ ...blank })}>New Calculated Field</Button>
        </>}
      />

      {notice && (
        <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>{notice}</div>
      )}

      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<div className="p-4"><EmptyState icon={Sparkles} title="No calculated fields yet"
            description="Load the default Legenex rule set (14 rules) or import your own export."
            action={<Button variant="gold" icon={DownloadCloud} loading={busy} onClick={loadDefaults}>Load default rules</Button>} /></div>}
          rows={rows}
          columns={[
            { key: 'output_token', header: 'Token', render: (r) => <Pill>{r.output_token}</Pill> },
            { key: 'output_label', header: 'Label' },
            { key: 'vertical', header: 'Vertical' },
            { key: 'transform_type', header: 'Type', render: (r) => <StatusBadge label={r.transform_type} tone="neutral" /> },
            { key: 'input_field', header: 'Input field', render: (r) => r.input_field ? <Pill>{r.input_field}</Pill> : null },
            { key: 'enabled', header: 'Enabled', render: (r) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={!!r.enabled} onChange={() => toggleEnabled(r)} /></div> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={PlayCircle} title="Test" onClick={() => { setTester(r); setTestResult(null); }} />
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => openEdit(r)} />
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
              <TextInput label="Output token" hint="Written to calculated_fields.<token>" value={editing.output_token} onChange={(e) => setEditing({ ...editing, output_token: e.target.value })} />
              <TextInput label="Output label" value={editing.output_label} onChange={(e) => setEditing({ ...editing, output_label: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Input field" hint="Lead field, custom_fields key, or another token. Leave blank for conditional rules." value={editing.input_field} onChange={(e) => setEditing({ ...editing, input_field: e.target.value })} />
              <SelectInput label="Transform type" value={editing.transform_type} options={TRANSFORM_TYPES} onChange={(e) => { setEditing({ ...editing, transform_type: e.target.value }); setEditCfg({}); }} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Vertical" value={editing.vertical} onChange={(e) => setEditing({ ...editing, vertical: e.target.value })} />
              <TextInput label="Sort order" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </div>
            <TextInput label="Depends on (comma-separated tokens)" hint="Used for dependency ordering and cycle detection" value={(editing.depends_on || []).join(', ')}
              onChange={(e) => setEditing({ ...editing, depends_on: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />

            {editing.transform_type === 'value_map' && <ValueMapEditor cfg={editCfg} setCfg={setEditCfg} />}
            {editing.transform_type === 'date_age_bucket' && <BucketEditor cfg={editCfg} setCfg={setEditCfg} />}
            {editing.transform_type === 'clone' && <p className="text-sm" style={{ color: '#93AAB2' }}>Clone has no configuration — the input field's value is copied straight to the output.</p>}
            {editing.transform_type === 'conditional' && <RawJsonEditor cfg={editCfg} setCfg={setEditCfg} hint='{"rules":[{"conditions":{"type":"group","match":"all","children":[{"type":"condition","field":"..","operator":"equals","value":".."}]},"output":".."}],"fallback":"{{token}}"}' />}
            {editing.transform_type === 'script' && (
              <div className="space-y-3">
                <SelectInput label="Whitelisted transform" hint="Dynamic evaluation is blocked at runtime, so scripts are matched to a supported transform. An unrecognised script passes the original value through and records an explicit error in the trace."
                  value={editCfg.whitelisted_transform || ''} options={SCRIPT_TRANSFORMS}
                  onChange={(e) => setEditCfg({ ...editCfg, whitelisted_transform: e.target.value })} />
                <RawJsonEditor cfg={editCfg} setCfg={setEditCfg} hint='Imported rules keep their original {"script": "..."} body; the engine matches it to a supported transform.' />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} /> Enabled
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.output_token}" will stop being calculated. Any webhook mapping that references {{${deleteTarget?.output_token}}} will stop receiving a value.`} />

      <Modal open={!!tester} onClose={() => setTester(null)} title={`Test: ${tester?.output_label || tester?.output_token || ''}`} wide>
        {tester && (
          <div className="space-y-4">
            <TextArea label="Sample record (JSON)" rows={7} value={sampleJson} onChange={(e) => setSampleJson(e.target.value)} />
            <Button variant="gold" onClick={runTest} loading={testing}>Run test (dry-run — nothing is persisted)</Button>
            {testResult && (
              <div className="space-y-2">
                {testResult.ok === false && <p className="text-sm" style={{ color: '#E5534B' }}>{testResult.error}</p>}
                {(testResult.trace || []).map((t, i) => (
                  <Panel key={i}>
                    <div className="grid gap-1 text-sm">
                      <div><span style={{ color: '#93AAB2' }}>Input ({t.input_field || 'n/a'}):</span> <span style={{ color: '#E8F1EF' }}>{JSON.stringify(t.input_value)}</span></div>
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
