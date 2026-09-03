import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, Select, EmptyState, Modal } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Edit, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight, Sparkles, Beaker } from "lucide-react";

const STATUS_TONE = { published: "success", draft: "neutral", archived: "danger" };
const BUILD_TONE = { planned: "neutral", in_progress: "warning", beta: "purple", live: "success" };

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [buildFilter, setBuildFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [aiModal, setAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await base44.entities.Experiment.list("-created_date", 200);
      setExperiments(r ?? []);
    } catch { setExperiments([]); }
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const filtered = experiments.filter((e) => {
    const ms = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.slug?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || e.status === statusFilter.toLowerCase();
    const mb = buildFilter === "All" || e.build_status === buildFilter.toLowerCase();
    const mc = categoryFilter === "All" || e.category === categoryFilter;
    return ms && mst && mb && mc;
  });

  const toggleLive = async (e) => {
    const next = e.status === "published" ? "draft" : "published";
    await base44.entities.Experiment.update(e.id, { status: next });
    setExperiments((p) => p.map((x) => (x.id === e.id ? { ...x, status: next } : x)));
  };

  const duplicate = async (e) => {
    const copy = { ...e, title: `${e.title} (Copy)`, slug: `${e.slug}-copy-${Date.now()}`, path: `${e.path}-copy`, status: "draft", view_count: 0, clicks: 0, leads: 0 };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Experiment.create(copy);
    fetchList();
  };

  const remove = async (id) => {
    await base44.entities.Experiment.delete(id);
    setExperiments((p) => p.filter((x) => x.id !== id));
    setDeleteConfirm(null);
  };

  const ctr = (e) => (!e.view_count ? "-" : (((e.clicks || 0) / e.view_count) * 100).toFixed(2) + "%");

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an Experiment record for the Accident Compensation Helper legal marketing platform. The experiment idea is: "${aiPrompt}". Return JSON with: title, slug (kebab-case), path (starts with /tools/ or /community/), experiment_type, category, hero_headline, hero_subheadline (1-2 sentences), short_description (1 sentence), utm_medium_label (short lowercase), disclaimer_short (1 sentence, educational tool only, not legal advice).`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, slug: { type: "string" }, path: { type: "string" },
            experiment_type: { type: "string" }, category: { type: "string" },
            hero_headline: { type: "string" }, hero_subheadline: { type: "string" },
            short_description: { type: "string" }, utm_medium_label: { type: "string" }, disclaimer_short: { type: "string" },
          },
        },
        model: "claude_sonnet_4_6",
      });
      const created = await base44.entities.Experiment.create({
        ...res, status: "draft", build_status: "planned",
        primary_cta_url: "https://quiz.accidentcompensationhelper.com/s/eval",
        primary_cta_text: "Start My Free Claim Check", view_count: 0, clicks: 0, leads: 0,
      });
      window.location.href = `/admin/experiments/${created.id}/edit`;
    } catch { setAiGenerating(false); }
  };

  const liveCount = experiments.filter((e) => e.status === "published").length;

  return (
    <AdminLayout title="Experiments" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Experiments" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Experiments</h2>
          <p className="mt-1 text-sm text-admuted">{liveCount} live · {experiments.length} total</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="purple" onClick={() => setAiModal(true)}><Sparkles className="h-4 w-4" /> Generate with AI</AdminButton>
          <Link to="/admin/experiments/new"><AdminButton><Plus className="h-4 w-4" /> New Experiment</AdminButton></Link>
        </div>
      </div>

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or slug..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", "published", "draft", "archived"]} />
        <Select value={buildFilter} onChange={setBuildFilter} options={["All", "planned", "in_progress", "beta", "live"]} />
        <Select value={categoryFilter} onChange={setCategoryFilter} options={["All", "Estimator", "Ticker", "Analyzer", "Map", "Generator", "Countdown", "Predictor", "Simulator", "Community", "Calculator", "Other"]} />
      </Card>

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={Beaker} title="No experiments yet" body="Create your first experiment or generate one with AI." action={<Link to="/admin/experiments/new"><AdminButton><Plus className="h-4 w-4" /> New Experiment</AdminButton></Link>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-admuted">
                <th className="p-3 text-left"><input type="checkbox" className="accent-brand" onChange={(e) => setSelected(e.target.checked ? filtered.map((x) => x.id) : [])} checked={selected.length === filtered.length && filtered.length > 0} /></th>
                <th className="p-3 text-left font-medium">Title / Headline</th>
                <th className="hidden p-3 text-left font-medium md:table-cell">Path</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="hidden p-3 text-left font-medium lg:table-cell">Build</th>
                <th className="p-3 text-right font-medium">Views</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">Clicks</th>
                <th className="hidden p-3 text-right font-medium sm:table-cell">CTR</th>
                <th className="hidden p-3 text-right font-medium lg:table-cell">Leads</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3"><input type="checkbox" className="accent-brand" checked={selected.includes(e.id)} onChange={(ev) => setSelected((p) => ev.target.checked ? [...p, e.id] : p.filter((x) => x !== e.id))} /></td>
                  <td className="p-3">
                    <Link to={`/admin/experiments/${e.id}/edit`} className="font-semibold text-white hover:text-brand">{e.title}</Link>
                    {e.hero_headline && <div className="text-xs text-admuted">{e.hero_headline}</div>}
                  </td>
                  <td className="hidden p-3 font-mono text-xs text-brand md:table-cell">{e.path}</td>
                  <td className="p-3"><Pill tone={STATUS_TONE[e.status]}>{e.status}</Pill></td>
                  <td className="hidden p-3 lg:table-cell"><Pill tone={BUILD_TONE[e.build_status]}>{e.build_status}</Pill></td>
                  <td className="p-3 text-right text-white">{e.view_count || 0}</td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{e.clicks || 0}</td>
                  <td className="hidden p-3 text-right text-slate-300 sm:table-cell">{ctr(e)}</td>
                  <td className="hidden p-3 text-right text-slate-300 lg:table-cell">{e.leads || 0}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={e.path} target="_blank" rel="noopener noreferrer" title="Open" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><ExternalLink className="h-4 w-4" /></a>
                      <Link to={`/admin/experiments/${e.id}/edit`} title="Edit" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => duplicate(e)} title="Duplicate" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => toggleLive(e)} title="Toggle live" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-white">{e.status === "published" ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4" />}</button>
                      <button onClick={() => setDeleteConfirm(e)} title="Delete" className="rounded p-1.5 text-admuted hover:bg-white/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete experiment?">
        <p className="text-sm text-slate-300">Are you sure you want to delete "{deleteConfirm?.title}"? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <AdminButton variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
          <AdminButton variant="danger" onClick={() => remove(deleteConfirm.id)}><Trash2 className="h-4 w-4" /> Delete</AdminButton>
        </div>
      </Modal>

      <Modal open={aiModal} onClose={() => setAiModal(false)} title="Generate with AI" wide>
        <p className="text-sm text-slate-300">Describe the experiment you want to create. AI will draft the headline, path, and copy for you.</p>
        <textarea rows={4} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. A tool that estimates what a rear-end collision claim might be worth" className="mt-4 w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white placeholder-admuted/60 outline-none focus:border-brand" />
        <div className="mt-6 flex justify-end gap-3">
          <AdminButton variant="secondary" onClick={() => setAiModal(false)}>Cancel</AdminButton>
          <AdminButton variant="purple" onClick={generateAI} disabled={aiGenerating}>{aiGenerating ? "Generating..." : <><Sparkles className="h-4 w-4" /> Generate</>}</AdminButton>
        </div>
      </Modal>
    </AdminLayout>
  );
}