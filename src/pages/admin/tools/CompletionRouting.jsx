import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, DataTable, Modal, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Edit, Route } from 'lucide-react';

export default function CompletionRouting() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Survey.list()) || []); }
    catch (e) { setError(e?.message || 'Failed to load surveys'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (survey) => setEditing({
    ...survey,
    completion_routing: survey.completion_routing || { qualified_url: '/submitted', disqualified_url: '/thanks', fallback_url: '/thanks' },
  });

  const save = async () => {
    await base44.entities.Survey.update(editing.id, { completion_routing: editing.completion_routing });
    setEditing(null); load();
  };

  return (
    <AdminLayout>
      <PageHeader title="Completion Routing" description="Where a respondent lands is configured per flow, with fallbacks — never hardcoded in the component. Disqualification is always resolved at the end of the flow, never mid-way." />
      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load}
          empty={<EmptyState icon={Route} title="No surveys yet" description="Build a survey first, then configure where it routes on completion." />}
          rows={rows}
          columns={[
            { key: 'title', header: 'Survey' },
            { key: 'qualified_url', header: 'Qualified →', render: (r) => r.completion_routing?.qualified_url },
            { key: 'disqualified_url', header: 'Disqualified →', render: (r) => r.completion_routing?.disqualified_url },
            { key: 'fallback_url', header: 'Fallback →', render: (r) => r.completion_routing?.fallback_url },
            { key: 'actions', header: '', className: 'text-right', render: (r) => (
              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => openEdit(r)} />
              </div>
            ) },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Routing: ${editing?.title || ''}`}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" onClick={save}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Qualified URL" value={editing.completion_routing.qualified_url} onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, qualified_url: e.target.value } })} />
            <TextInput label="Disqualified URL" value={editing.completion_routing.disqualified_url} onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, disqualified_url: e.target.value } })} />
            <TextInput label="Fallback URL" hint="Used if neither condition resolves cleanly" value={editing.completion_routing.fallback_url} onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, fallback_url: e.target.value } })} />
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
