import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, Tabs,
  SectionTitle, FieldRow, StatusBadge, ConfirmDialog,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Save, ArrowLeft, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { checkFields, slugify } from '@/lib/compliance';

const QUIZ_URL = 'https://quiz.accidentcompensationhelper.com/s/eval';
const blank = {
  title: '', slug: '', path: '', experiment_type: 'tool', category: '', status: 'draft',
  build_status: 'planned', hero_headline: '', hero_subheadline: '', short_description: '',
  primary_cta_url: QUIZ_URL, primary_cta_text: 'Check my claim', disclaimer_short: '',
  utm_medium_label: '', view_count: 0, clicks: 0, leads: 0,
};

const rate = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : null);

export default function ExperimentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(id ? null : { ...blank });
  const [tab, setTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    base44.entities.Experiment.list('-created_date', 300)
      .then((rows) => setItem((rows || []).find((r) => r.id === id) || { ...blank }))
      .catch(() => setItem({ ...blank }));
  }, [id]);

  const flags = item ? checkFields({
    Headline: item.hero_headline, Subheadline: item.hero_subheadline,
    Description: item.short_description, 'CTA text': item.primary_cta_text,
  }) : [];
  const publishBlocked = flags.length > 0;

  const save = async (overrideStatus) => {
    const nextStatus = overrideStatus || item.status;
    if (nextStatus === 'published' && publishBlocked) {
      setNotice('Publishing is blocked while compliance flags remain.');
      setTab('compliance');
      return;
    }
    setSaving(true);
    try {
      const slug = item.slug || slugify(item.title);
      const payload = { ...item, status: nextStatus, slug, path: item.path || `/tools/${slug}` };
      if (item.id) await base44.entities.Experiment.update(item.id, payload);
      else {
        const created = await base44.entities.Experiment.create(payload);
        navigate(`/admin/experiments/${created.id}/edit`, { replace: true });
      }
      setNotice('Saved.');
      setTimeout(() => setNotice(null), 2000);
    } catch (e) { setNotice(`Save failed: ${e?.message || String(e)}`); }
    setSaving(false);
  };

  const doDelete = async () => {
    await base44.entities.Experiment.delete(item.id);
    navigate('/admin/experiments');
  };

  if (!item) return <AdminLayout><PageHeader title="Experiment" /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader title={item.id ? item.title || 'Edit experiment' : 'New experiment'}
        description={item.path || 'Not yet routed'}
        actions={<>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/experiments')}>Back</Button>
          {item.id && <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete</Button>}
          <Button variant="secondary" loading={saving} onClick={() => save('draft')}>Save draft</Button>
          <Button variant="gold" icon={Save} loading={saving} disabled={publishBlocked}
            disabledReason={publishBlocked ? `${flags.length} compliance flag(s) must be cleared before publishing` : undefined}
            onClick={() => save('published')}>Publish</Button>
        </>} />

      {notice && (
        <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>{notice}</div>
      )}

      <Tabs tabs={[
        { label: 'Content', value: 'content' },
        { label: 'Routing & CTA', value: 'routing' },
        { label: 'Performance', value: 'performance' },
        { label: 'Compliance', value: 'compliance', count: flags.length },
      ]} value={tab} onChange={setTab} />

      <div className="mt-4 max-w-3xl">
        {tab === 'content' && (
          <Panel>
            <div className="space-y-4">
              <TextInput label="Title" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Category" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })} />
                <SelectInput label="Type" value={item.experiment_type} options={['tool', 'calculator', 'checker', 'quiz', 'community']}
                  onChange={(e) => setItem({ ...item, experiment_type: e.target.value })} />
              </div>
              <TextInput label="Hero headline" value={item.hero_headline} onChange={(e) => setItem({ ...item, hero_headline: e.target.value })} />
              <TextInput label="Hero subheadline" value={item.hero_subheadline} onChange={(e) => setItem({ ...item, hero_subheadline: e.target.value })} />
              <TextArea label="Short description" rows={3} value={item.short_description} onChange={(e) => setItem({ ...item, short_description: e.target.value })} />
              <TextArea label="Short disclaimer" rows={2} hint="Shown near the CTA. Use this to make clear the tool is informational only."
                value={item.disclaimer_short} onChange={(e) => setItem({ ...item, disclaimer_short: e.target.value })} />
            </div>
          </Panel>
        )}

        {tab === 'routing' && (
          <Panel>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Slug" hint="Generated from the title if left blank" value={item.slug} onChange={(e) => setItem({ ...item, slug: e.target.value })} />
                <TextInput label="Path" hint="e.g. /tools/claim-estimator" value={item.path} onChange={(e) => setItem({ ...item, path: e.target.value })} />
              </div>
              <SelectInput label="Build status" value={item.build_status} options={['planned', 'in_progress', 'beta', 'live']}
                onChange={(e) => setItem({ ...item, build_status: e.target.value })} />
              <TextInput label="Primary CTA text" value={item.primary_cta_text} onChange={(e) => setItem({ ...item, primary_cta_text: e.target.value })} />
              <TextInput label="Primary CTA URL" value={item.primary_cta_url} onChange={(e) => setItem({ ...item, primary_cta_url: e.target.value })} />
              <TextInput label="UTM medium label" hint="Distinguishes this tool's traffic in reporting"
                value={item.utm_medium_label} onChange={(e) => setItem({ ...item, utm_medium_label: e.target.value })} />
            </div>
          </Panel>
        )}

        {tab === 'performance' && (
          <Panel>
            <FieldRow label="Status" value={<StatusBadge status={item.status} />} />
            <FieldRow label="Build status" value={<StatusBadge status={item.build_status} />} />
            <FieldRow label="Views" value={item.view_count ?? 0} />
            <FieldRow label="CTA clicks" value={item.clicks ?? 0} />
            <FieldRow label="Click-through rate" value={rate(item.clicks, item.view_count) || 'not tracked'} />
            <FieldRow label="Leads" value={item.leads ?? 0} />
            <FieldRow label="Click → lead" value={rate(item.leads, item.clicks) || 'not tracked'} />
          </Panel>
        )}

        {tab === 'compliance' && (
          <div className="space-y-3">
            {flags.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.3)' }}>
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#3FB950' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#3FB950' }}>No compliance issues found</p>
                  <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>Checked headline, subheadline, description and CTA text.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(229,83,75,0.12)', border: '1px solid rgba(229,83,75,0.3)' }}>
                  <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#E5534B' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#E5534B' }}>Publishing is blocked</p>
                    <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>A tool that estimates or implies a claim's value is the highest-risk copy on the site.</p>
                  </div>
                </div>
                {flags.map((f, i) => (
                  <Panel key={i}>
                    <div className="text-sm font-semibold" style={{ color: '#E5534B' }}>{f.field}: “{f.phrase}”</div>
                    <p className="mt-2 text-sm" style={{ color: '#93AAB2' }}>{f.reason}</p>
                  </Panel>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={doDelete}
        consequence={`"${item.title}" will be permanently deleted. Any traffic pointed at ${item.path} will start hitting a 404.`} />
    </AdminLayout>
  );
}
