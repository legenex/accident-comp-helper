import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, Select, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, ListChecks, Copy, ExternalLink } from "lucide-react";

const QUIZ = "https://quiz.accidentcompensationhelper.com/s/eval";
const blank = { title: "", slug: "", status: "draft", description: "", questions: [], responses: 0, completion_rate: 0 };

export default function Surveys() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.Survey.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((s) => {
    const ms = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.slug?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || s.status === statusFilter.toLowerCase();
    return ms && mst;
  });

  const save = async () => {
    if (editing.id) await base44.entities.Survey.update(editing.id, editing);
    else await base44.entities.Survey.create(editing);
    setEditing(null); fetchList();
  };

  const duplicate = async (s) => {
    const copy = { ...s, title: `${s.title} (Copy)`, slug: `${s.slug}-copy-${Date.now()}`, status: "draft", responses: 0 };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Survey.create(copy); fetchList();
  };

  const remove = async (id) => {
    await base44.entities.Survey.delete(id);
    setRows((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null);
  };

  return (
    <AdminLayout title="Surveys" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Surveys" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Surveys</h2>
          <p className="mt-1 text-sm text-admuted">{rows.filter((s) => s.status === "published").length} live · {rows.length} total</p>
        </div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Survey</AdminButton>
      </div>

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or slug..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", "published", "draft", "archived"]} />
      </Card>

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={ListChecks} title="No surveys yet" body="Create your first survey to start collecting responses." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Survey</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-admuted">
                <th className="p-3 text-left font-medium">Title</th>
                <th className="hidden p-3 text-left font-medium lg:table-cell">Slug</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">Questions</th>
                <th className="p-3 text-right font-medium">Responses</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">Completion</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <button onClick={() => setEditing(s)} className="font-semibold text-white hover:text-brand">{s.title}</button>
                    {s.description && <div className="text-xs text-admuted">{s.description}</div>}
                  </td>
                  <td className="hidden p-3 font-mono text-xs text-brand lg:table-cell">/s/{s.slug}</td>
                  <td className="p-3"><Pill tone={s.status === "published" ? "success" : "neutral"}>{s.status}</Pill></td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{(s.questions || []).length}</td>
                  <td className="p-3 text-right text-white">{s.responses || 0}</td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{s.completion_rate || 0}%</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`/s/${s.slug}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><ExternalLink className="h-4 w-4" /></a>
                      <button onClick={() => setEditing(s)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => duplicate(s)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteConfirm(s)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Survey" : "New Survey"} wide>
        {editing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <Field label="Title"><AdminInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug"><AdminInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand">
                  <option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option>
                </select>
              </Field>
            </div>
            <Field label="Description"><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <Field label="Destination URL" hint="Where completed surveys are sent.">
              <AdminInput value={QUIZ} disabled className="opacity-60" />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton>
              <AdminButton onClick={save}>Save</AdminButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete survey?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.title}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
          <AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton>
        </div>
      </Modal>
    </AdminLayout>
  );
}