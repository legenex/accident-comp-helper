import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, TextArea, DataTable, Toggle, Modal, ConfirmDialog, EmptyState, Pill } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, BookMarked, Search } from 'lucide-react';

const blank = { title: '', content: '', category: '', assigned_to: [], enabled: true };
const CONSUMERS = ['bot', 'blog'];

export default function KnowledgeBase() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState(null);

  const load = async () => { setLoading(true); setRows((await base44.entities.KnowledgeBaseItem.list().catch(() => [])) || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) await base44.entities.KnowledgeBaseItem.update(editing.id, editing);
    else await base44.entities.KnowledgeBaseItem.create(editing);
    setEditing(null); load();
  };
  const confirmDelete = async () => { await base44.entities.KnowledgeBaseItem.delete(deleteTarget.id); setDeleteTarget(null); load(); };
  const toggleConsumer = (key) => {
    const has = (editing.assigned_to || []).includes(key);
    setEditing({ ...editing, assigned_to: has ? editing.assigned_to.filter((k) => k !== key) : [...(editing.assigned_to || []), key] });
  };

  // Simple retrieval test — same substring match a real retrieval layer
  // would use as a first pass, run against enabled items only.
  const runTest = () => {
    const q = testQuery.toLowerCase();
    setTestResults(rows.filter((r) => r.enabled !== false && (r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q))));
  };

  return (
    <AdminLayout>
      <PageHeader title="Knowledge Base" description="One shared grounding library, assignable to the Bot and Blog Manager's AI generation, with a retrieval test."
        actions={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Item</Button>} />

      <Panel className="mb-6">
        <div className="flex items-center gap-2">
          <TextInput placeholder="Test a retrieval query..." value={testQuery} onChange={(e) => setTestQuery(e.target.value)} className="flex-1" />
          <Button variant="secondary" icon={Search} onClick={runTest}>Test</Button>
        </div>
        {testResults && (
          <div className="mt-3 space-y-1.5">
            {testResults.length === 0 ? <p className="text-sm" style={{ color: '#5E7681' }}>No matching items.</p> :
              testResults.map((r) => <div key={r.id} className="text-sm" style={{ color: '#E8F1EF' }}>{r.title}</div>)}
          </div>
        )}
      </Panel>

      <Panel padded={false}>
        <DataTable
          loading={loading} rows={rows}
          empty={<EmptyState icon={BookMarked} title="No knowledge base items yet" action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New Item</Button>} />}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'category', header: 'Category' },
            { key: 'assigned_to', header: 'Assigned to', render: (r) => (r.assigned_to || []).map((a) => <Pill key={a} className="mr-1">{a}</Pill>) },
            { key: 'enabled', header: 'Enabled', render: (r) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={!!r.enabled} onChange={async () => { await base44.entities.KnowledgeBaseItem.update(r.id, { enabled: !r.enabled }); load(); }} /></div> },
            { key: 'actions', header: '', className: 'text-right', render: (r) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => setEditing(r)} />
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(r)} />
              </div>
            ) },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit item' : 'New item'} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <TextInput label="Category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <TextArea label="Content" rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <div className="flex gap-4">
              {CONSUMERS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
                  <input type="checkbox" checked={(editing.assigned_to || []).includes(c)} onChange={() => toggleConsumer(c)} /> {c}
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will no longer be available to the Bot or Blog Manager's AI generation.`} />
    </AdminLayout>
  );
}
