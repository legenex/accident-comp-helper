import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, Select, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Radar } from "lucide-react";

const blank = { title: "", source: "", status: "new", score: 0, category: "", summary: "" };
const STATUS_TONE = { new: "blue", reviewing: "warning", promoted: "success", archived: "neutral" };

export default function Signals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.Signal.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((s) => {
    const ms = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.source?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || s.status === statusFilter.toLowerCase();
    return ms && mst;
  });

  const save = async () => {
    if (editing.id) await base44.entities.Signal.update(editing.id, editing);
    else await base44.entities.Signal.create(editing);
    setEditing(null); fetchList();
  };
  const remove = async (id) => { await base44.entities.Signal.delete(id); setRows((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null); };

  return (
    <AdminLayout title="Signal Engine" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Signal Engine" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Signal Engine</h2><p className="mt-1 text-sm text-admuted">{rows.length} signals</p></div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Signal</AdminButton>
      </div>
      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or source..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", "new", "reviewing", "promoted", "archived"]} />
      </Card>
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={Radar} title="No signals yet" body="Capture trending topics and search signals." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Signal</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-admuted">
              <th className="p-3 text-left font-medium">Title</th>
              <th className="hidden p-3 text-left font-medium sm:table-cell">Source</th>
              <th className="hidden p-3 text-left font-medium lg:table-cell">Category</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-right font-medium">Score</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3"><button onClick={() => setEditing(s)} className="font-semibold text-white hover:text-brand">{s.title}</button>{s.summary && <div className="text-xs text-admuted">{s.summary}</div>}</td>
                  <td className="hidden p-3 text-slate-300 sm:table-cell">{s.source || "-"}</td>
                  <td className="hidden p-3 text-slate-300 lg:table-cell">{s.category || "-"}</td>
                  <td className="p-3"><Pill tone={STATUS_TONE[s.status]}>{s.status}</Pill></td>
                  <td className="p-3 text-right text-white">{s.score || 0}</td>
                  <td className="p-3"><div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setEditing(s)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteConfirm(s)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Signal" : "New Signal"} wide>
        {editing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <Field label="Title"><AdminInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Source"><AdminInput value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} /></Field>
              <Field label="Category"><AdminInput value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand"><option value="new">new</option><option value="reviewing">reviewing</option><option value="promoted">promoted</option><option value="archived">archived</option></select></Field>
              <Field label="Score"><AdminInput type="number" value={editing.score} onChange={(e) => setEditing({ ...editing, score: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Summary"><textarea rows={3} value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <div className="flex justify-end gap-3 pt-2"><AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton><AdminButton onClick={save}>Save</AdminButton></div>
          </div>
        )}
      </Modal>
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete signal?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.title}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton><AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton></div>
      </Modal>
    </AdminLayout>
  );
}