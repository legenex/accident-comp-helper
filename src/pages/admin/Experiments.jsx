import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, SearchInput, SelectInput, DataTable, StatusBadge,
  ConfirmDialog, EmptyState, Pill, StatCard,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Beaker, ExternalLink, Copy, Eye, MousePointerClick, Users2 } from 'lucide-react';

const rate = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : null);

export default function Experiments() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [buildFilter, setBuildFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setRows((await base44.entities.Experiment.list('-created_date', 300)) || []); }
    catch (e) { setError(e?.message || 'Failed to load experiments'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.title?.toLowerCase().includes(q) || r.slug?.toLowerCase().includes(q) || r.path?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesBuild = buildFilter === 'All' || r.build_status === buildFilter;
    return matchesSearch && matchesStatus && matchesBuild;
  });

  const totals = rows.reduce((a, r) => ({
    views: a.views + (r.view_count || 0), clicks: a.clicks + (r.clicks || 0), leads: a.leads + (r.leads || 0),
  }), { views: 0, clicks: 0, leads: 0 });

  const duplicate = async (r) => {
    const { id: _id, created_date: _c, updated_date: _u, ...rest } = r;
    await base44.entities.Experiment.create({
      ...rest, title: `${r.title} (copy)`, slug: `${r.slug}-copy`, path: `${r.path}-copy`,
      status: 'draft', build_status: 'planned', view_count: 0, clicks: 0, leads: 0,
    });
    load();
  };

  const confirmDelete = async () => { await base44.entities.Experiment.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Experiments" description="Standalone tools and interactive pages used to test new acquisition angles."
        actions={<Button variant="gold" icon={Plus} onClick={() => navigate('/admin/experiments/new')}>New Experiment</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Experiments" value={loading ? '—' : rows.length} icon={Beaker} tone="brand" />
        <StatCard label="Total views" value={loading ? '—' : totals.views} icon={Eye} tone="neutral" />
        <StatCard label="CTA clicks" value={loading ? '—' : totals.clicks} icon={MousePointerClick} tone="neutral" />
        <StatCard label="Leads" value={loading ? '—' : totals.leads} icon={Users2} tone="success" />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by title, slug or path..." className="min-w-[220px] flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={['All', 'draft', 'published', 'archived']} />
          <SelectInput value={buildFilter} onChange={(e) => setBuildFilter(e.target.value)} options={['All', 'planned', 'in_progress', 'beta', 'live']} />
        </div>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={filtered}
          onRowClick={(r) => navigate(`/admin/experiments/${r.id}/edit`)}
          empty={<div className="p-4"><EmptyState icon={Beaker} title="No experiments yet"
            description="Build a calculator, checker or interactive tool and measure whether it converts."
            action={<Button variant="gold" icon={Plus} onClick={() => navigate('/admin/experiments/new')}>New Experiment</Button>} /></div>}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'path', header: 'Path', render: (r) => <Pill>{r.path}</Pill> },
            { key: 'category', header: 'Category' },
            { key: 'build_status', header: 'Build', render: (r) => <StatusBadge status={r.build_status} /> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'view_count', header: 'Views' },
            { key: 'ctr', header: 'CTR', render: (r) => rate(r.clicks, r.view_count) },
            { key: 'leads', header: 'Leads' },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {r.status === 'published' && r.path && (
                    <a href={r.path} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="View live" /></a>
                  )}
                  <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => duplicate(r)} />
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => navigate(`/admin/experiments/${r.id}/edit`)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Any traffic pointed at ${deleteTarget?.path} will start hitting a 404.`} />
    </AdminLayout>
  );
}
