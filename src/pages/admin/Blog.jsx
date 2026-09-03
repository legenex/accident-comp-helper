import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, Select, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, BookOpen, ExternalLink } from "lucide-react";

const blank = { title: "", slug: "", status: "draft", excerpt: "", body: "", author: "", category: "", featured_image: "", views: 0 };

export default function Blog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try { setRows((await base44.entities.BlogPost.list("-created_date", 200)) ?? []); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = rows.filter((p) => {
    const ms = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || p.status === statusFilter.toLowerCase();
    return ms && mst;
  });

  const save = async () => {
    if (editing.id) await base44.entities.BlogPost.update(editing.id, editing);
    else await base44.entities.BlogPost.create(editing);
    setEditing(null); fetchList();
  };
  const remove = async (id) => { await base44.entities.BlogPost.delete(id); setRows((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null); };

  return (
    <AdminLayout title="Blog Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Blog Manager" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Blog Manager</h2><p className="mt-1 text-sm text-admuted">{rows.length} posts</p></div>
        <AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Post</AdminButton>
      </div>
      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or slug..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", "published", "draft", "archived"]} />
      </Card>
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={BookOpen} title="No posts yet" body="Write your first blog post." action={<AdminButton onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New Post</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-admuted">
              <th className="p-3 text-left font-medium">Title</th>
              <th className="hidden p-3 text-left font-medium sm:table-cell">Author</th>
              <th className="hidden p-3 text-left font-medium lg:table-cell">Category</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-right font-medium">Views</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3"><button onClick={() => setEditing(p)} className="font-semibold text-white hover:text-brand">{p.title}</button></td>
                  <td className="hidden p-3 text-slate-300 sm:table-cell">{p.author || "-"}</td>
                  <td className="hidden p-3 text-slate-300 lg:table-cell">{p.category || "-"}</td>
                  <td className="p-3"><Pill tone={p.status === "published" ? "success" : "neutral"}>{p.status}</Pill></td>
                  <td className="p-3 text-right text-white">{p.views || 0}</td>
                  <td className="p-3"><div className="flex items-center justify-end gap-1.5">
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => setEditing(p)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteConfirm(p)} className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Post" : "New Post"} wide>
        {editing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <Field label="Title"><AdminInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug"><AdminInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Status"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author"><AdminInput value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></Field>
              <Field label="Category"><AdminInput value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
            </div>
            <Field label="Excerpt"><textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <Field label="Body"><textarea rows={10} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand" /></Field>
            <div className="flex justify-end gap-3 pt-2"><AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton><AdminButton onClick={save}>Save</AdminButton></div>
          </div>
        )}
      </Modal>
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete post?">
        <p className="text-sm text-slate-300">Delete "{deleteConfirm?.title}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton><AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton></div>
      </Modal>
    </AdminLayout>
  );
}