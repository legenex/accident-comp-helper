import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, Select, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, ExternalLink, Newspaper, ToggleLeft, ToggleRight } from "lucide-react";

const QUIZ = "https://quiz.accidentcompensationhelper.com/s/eval";
const blank = { title: "", slug: "", status: "draft", headline: "", subheadline: "", body: "", cta_url: QUIZ, cta_text: "Check My Claim", views: 0, clicks: 0, leads: 0 };

export default function Advertorials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.Advertorial.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((a) => {
    const ms = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.slug?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || a.status === statusFilter.toLowerCase();
    return ms && mst;
  });

  const save = async () => {
    if (editing.id) {
      await base44.entities.Advertorial.update(editing.id, editing);
    } else {
      await base44.entities.Advertorial.create(editing);
    }
    setEditing(null);
    fetchList();
  };

  const toggle = async (a) => {
    const next = a.status === "published" ? "draft" : "published";
    await base44.entities.Advertorial.update(a.id, { status: next });
    setRows((p) => p.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
  };

  const remove = async (id) => {
    await base44.entities.Advertorial.delete(id);
    setRows((p) => p.filter((x) => x.id !== id));
    setDeleteConfirm(null);
  };

  const ctr = (a) => (!a.views ? "-" : (((a.clicks || 0) / a.views) * 100).toFixed(2) + "%");

  return (
    <AdminLayout title="Advertorials" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Advertorials" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Advertorials</h2>
          <p className="mt-1 text-sm text-admuted">{rows.filter((a) => a.status === "published").length} live · {rows.length} total</p>
        </div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Advertorial</AdminButton>
      </div>

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or slug..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", "published", "draft", "archived"]} />
      </Card>

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={Newspaper} title="No advertorials yet" body="Create your first advertorial to start driving leads." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Advertorial</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-admuted">
                <th className="p-3 text-left font-medium">Title / Headline</th>
                <th className="hidden p-3 text-left font-medium lg:table-cell">Slug</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Views</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">Clicks</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">CTR</th>
                <th className="hidden p-3 text-right font-medium lg:table-cell">Leads</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <button onClick={() => setEditing(a)} className="font-semibold text-white hover:text-brand">{a.title}</button>
                    {a.headline && <div className="text-xs text-admuted">{a.headline}</div>}
                  </td>
                  <td className="hidden p-3 font-mono text-xs text-brand lg:table-cell">/a/{a.slug}</td>
                  <td className="p-3"><Pill tone={a.status === "published" ? "success" : "neutral"}>{a.status}</Pill></td>
                  <td className="p-3 text-right text-white">{a.views || 0}</td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{a.clicks || 0}</td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{ctr(a)}</td>
                  <td className="hidden p-3 text-right text-slate-300 lg:table-cell">{a.leads || 0}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`/a/${a.slug}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><ExternalLink className="h-4 w-4" /></a>
                      <button onClick={() => setEditing(a)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => toggle(a)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white">{a.status === "published" ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4" />}</button>
                      <button onClick={() => setDeleteConfirm(a)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Advertorial" : "New Advertorial"} wide>
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
            <Field label="Headline"><AdminInput value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} /></Field>
            <Field label="Subheadline"><textarea rows={2} value={editing.subheadline} onChange={(e) => setEditing({ ...editing, subheadline: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <Field label="Body"><textarea rows={6} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA text"><AdminInput value={editing.cta_text} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} /></Field>
              <Field label="CTA URL"><AdminInput value={editing.cta_url} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton>
              <AdminButton onClick={save}>Save</AdminButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete advertorial?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.title}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
          <AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton>
        </div>
      </Modal>
    </AdminLayout>
  );
}