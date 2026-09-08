import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const blank = { page_path: "", title: "", meta_description: "", og_title: "", og_description: "", keywords: "", canonical: "", indexable: true };

export default function SEO() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.SeoEntry.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((r) => !search || r.page_path?.toLowerCase().includes(search.toLowerCase()) || r.title?.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (editing.id) await base44.entities.SeoEntry.update(editing.id, editing);
    else await base44.entities.SeoEntry.create(editing);
    setEditing(null); fetchList();
  };
  const remove = async (id) => { await base44.entities.SeoEntry.delete(id); setRows((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null); };

  return (
    <AdminLayout title="SEO Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "SEO Manager" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">SEO Manager</h2><p className="mt-1 text-sm text-admuted">{rows.length} entries</p></div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Entry</AdminButton>
      </div>
      <Card className="mb-6"><SearchBar value={search} onChange={setSearch} placeholder="Search by path or title..." /></Card>
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={Search} title="No SEO entries yet" body="Add meta data for your pages." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Entry</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-admuted">
              <th className="p-3 text-left font-medium">Page path</th>
              <th className="p-3 text-left font-medium">Meta title</th>
              <th className="hidden p-3 text-left font-medium lg:table-cell">Keywords</th>
              <th className="p-3 text-left font-medium">Index</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-mono text-xs text-brand">{r.page_path}</td>
                  <td className="p-3"><button onClick={() => setEditing(r)} className="font-semibold text-white hover:text-brand">{r.title || "-"}</button></td>
                  <td className="hidden p-3 text-slate-300 lg:table-cell">{r.keywords || "-"}</td>
                  <td className="p-3"><Pill tone={r.indexable ? "success" : "neutral"}>{r.indexable ? "index" : "noindex"}</Pill></td>
                  <td className="p-3"><div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setEditing(r)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteConfirm(r)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit SEO Entry" : "New SEO Entry"} wide>
        {editing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <Field label="Page path"><AdminInput value={editing.page_path} onChange={(e) => setEditing({ ...editing, page_path: e.target.value })} placeholder="/" /></Field>
            <Field label="Meta title"><AdminInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Meta description"><textarea rows={2} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="OG title"><AdminInput value={editing.og_title} onChange={(e) => setEditing({ ...editing, og_title: e.target.value })} /></Field>
              <Field label="OG description"><AdminInput value={editing.og_description} onChange={(e) => setEditing({ ...editing, og_description: e.target.value })} /></Field>
            </div>
            <Field label="Keywords"><AdminInput value={editing.keywords} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} /></Field>
            <Field label="Canonical"><AdminInput value={editing.canonical} onChange={(e) => setEditing({ ...editing, canonical: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={editing.indexable} onChange={(e) => setEditing({ ...editing, indexable: e.target.checked })} className="accent-brand" /> Indexable</label>
            <div className="flex justify-end gap-3 pt-2"><AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton><AdminButton onClick={save}>Save</AdminButton></div>
          </div>
        )}
      </Modal>
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete entry?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.page_path}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton><AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton></div>
      </Modal>
    </AdminLayout>
  );
}