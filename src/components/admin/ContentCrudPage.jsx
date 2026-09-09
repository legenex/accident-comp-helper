// Shared CRUD scaffold for the content list pages (Pages, Landing Pages,
// Advertorials, Surveys, Blog). These pages are structurally identical:
// a filterable list of slug-addressable records with a status, plus an
// edit modal. Building this once keeps them from each inventing their own
// table, modal and filter row.
import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, SearchInput, SelectInput, DataTable, StatusBadge, Modal, ConfirmDialog, EmptyState, Pagination } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 25;

export default function ContentCrudPage({
  entityName,
  title,
  description,
  blank,
  icon,
  emptyDescription,
  searchFields = ['title', 'slug'],
  columns,
  renderForm,
  publicUrlFor,
  deleteConsequence,
  extraActions,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities[entityName].list('-created_date', 500)) || []); }
    catch (e) { setError(e?.message || `Failed to load ${title.toLowerCase()}`); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [entityName]);

  const statuses = useMemo(() => ['All', ...new Set(rows.map((r) => r.status).filter(Boolean))], [rows]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || searchFields.some((f) => r[f]?.toLowerCase?.().includes(q));
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await base44.entities[entityName].update(editing.id, editing);
      else await base44.entities[entityName].create(editing);
      setEditing(null); load();
    } finally { setSaving(false); }
  };
  const confirmDelete = async () => {
    await base44.entities[entityName].delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const actionColumn = {
    key: '_actions', header: '', className: 'text-right',
    render: (r) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        {publicUrlFor && r.status === 'published' && (
          <a href={publicUrlFor(r)} target="_blank" rel="noopener noreferrer" title="View live">
            <Button variant="ghost" size="sm" icon={ExternalLink} />
          </a>
        )}
        <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => setEditing(r)} />
        <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
      </div>
    ),
  };

  const allColumns = [
    ...columns,
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    actionColumn,
  ];

  return (
    <AdminLayout>
      <PageHeader title={title} description={description || `${rows.length} ${title.toLowerCase()}`}
        actions={<>
          {extraActions}
          <Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>New</Button>
        </>} />
      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search..." className="min-w-[220px] flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={statuses} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={paged} columns={allColumns}
          onRowClick={setEditing}
          empty={<div className="p-4"><EmptyState icon={icon} title={`No ${title.toLowerCase()} yet`} description={emptyDescription}
            action={<Button variant="gold" icon={Plus} onClick={() => setEditing({ ...blank })}>Create the first one</Button>} /></div>}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${title.replace(/s$/, '').toLowerCase()}` : `New ${title.replace(/s$/, '').toLowerCase()}`} wide
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button variant="gold" loading={saving} onClick={save}>Save</Button></>}>
        {editing && renderForm(editing, setEditing)}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={deleteConsequence ? deleteConsequence(deleteTarget) : `"${deleteTarget?.title || deleteTarget?.name}" will be permanently deleted. Any link pointing to it will start returning a 404.`} />
    </AdminLayout>
  );
}
