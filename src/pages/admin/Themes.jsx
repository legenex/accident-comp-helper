import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Palette, Copy } from "lucide-react";

const blank = { name: "", slug: "", status: "draft", description: "", config: {} };

export default function Themes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.Theme.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((t) => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (editing.id) await base44.entities.Theme.update(editing.id, editing);
    else await base44.entities.Theme.create(editing);
    setEditing(null); fetchList();
  };
  const duplicate = async (t) => {
    const copy = { ...t, name: `${t.name} (Copy)`, slug: `${t.slug}-copy-${Date.now()}`, status: "draft" };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Theme.create(copy); fetchList();
  };
  const remove = async (id) => { await base44.entities.Theme.delete(id); setRows((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null); };
  const activate = async (t) => {
    await base44.entities.Theme.updateMany({ status: "active" }, { $set: { status: "draft" } });
    await base44.entities.Theme.update(t.id, { status: "active" });
    fetchList();
  };

  return (
    <AdminLayout title="Themes" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Themes" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Themes</h2><p className="mt-1 text-sm text-admuted">{rows.length} themes</p></div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Theme</AdminButton>
      </div>
      <Card className="mb-6"><SearchBar value={search} onChange={setSearch} placeholder="Search themes..." /></Card>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-white/5" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Palette} title="No themes yet" body="Create a theme to style your public pages." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Theme</AdminButton>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-white">{t.name}</h3>
                <Pill tone={t.status === "active" ? "success" : "neutral"}>{t.status}</Pill>
              </div>
              <p className="flex-1 text-sm text-admuted">{t.description || "No description."}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-5 w-5 rounded bg-brand" title="Brand" />
                  <span className="h-5 w-5 rounded bg-navy" title="Navy" />
                  <span className="h-5 w-5 rounded bg-white border border-navyline" title="Light" />
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {t.status !== "active" && <button onClick={() => activate(t)} className="rounded px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10">Activate</button>}
                  <button onClick={() => setEditing(t)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => duplicate(t)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteConfirm(t)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Theme" : "New Theme"} wide>
        {editing && (
          <div className="space-y-4">
            <Field label="Name"><AdminInput value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug"><AdminInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Status"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand"><option value="draft">draft</option><option value="active">active</option><option value="archived">archived</option></select></Field>
            </div>
            <Field label="Description"><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <div className="flex justify-end gap-3 pt-2"><AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton><AdminButton onClick={save}>Save</AdminButton></div>
          </div>
        )}
      </Modal>
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete theme?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.name}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton><AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton></div>
      </Modal>
    </AdminLayout>
  );
}