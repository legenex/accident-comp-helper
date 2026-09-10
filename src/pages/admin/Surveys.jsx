import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, DataTable, StatusBadge,
  Modal, ConfirmDialog, EmptyState, Tabs, Pill, Toggle, SectionTitle, NotConfigured, FieldRow,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import {
  Plus, Edit, Trash2, ListChecks, ExternalLink, ChevronUp, ChevronDown,
  Copy, AlertTriangle,
} from 'lucide-react';
import { slugify } from '@/lib/compliance';

const QUESTION_TYPES = [
  { value: 'single', label: 'Single choice' },
  { value: 'multi', label: 'Multiple choice' },
  { value: 'state', label: 'US state' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
];

const blankSurvey = {
  title: '', slug: '', status: 'draft', description: '', questions: [],
  completion_routing: { qualified_url: '/submitted', disqualified_url: '/thanks', fallback_url: '/thanks' },
  consent_text: '', consent_version: '1', submit_button_text: 'See my result',
};

const newQuestion = () => ({
  id: `q_${Math.random().toString(36).slice(2, 9)}`,
  prompt: '', help_text: '', type: 'single', field_name: '', required: true,
  options: [{ value: '', label: '', dq: false, dq_reason: '' }],
  show_if: null,
});

/* ------------------------------ Option editor ------------------------------ */
function OptionRows({ question, onChange }) {
  const options = question.options || [];
  const update = (i, patch) => {
    const next = [...options]; next[i] = { ...next[i], ...patch };
    onChange({ ...question, options: next });
  };
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium" style={{ color: '#93AAB2' }}>Options</div>
      {options.map((o, i) => (
        <div key={i} className="rounded-lg p-3" style={{ background: '#0D1A20', border: '1px solid rgba(148,180,190,0.14)' }}>
          <div className="flex items-center gap-2">
            <TextInput placeholder="Label shown to the visitor" value={o.label}
              onChange={(e) => update(i, { label: e.target.value, value: o.value || slugify(e.target.value) })} className="flex-1" />
            <TextInput placeholder="stored value" value={o.value} onChange={(e) => update(i, { value: e.target.value })} className="flex-1" />
            <Button variant="ghost" size="sm" icon={Trash2} title="Remove option"
              onClick={() => onChange({ ...question, options: options.filter((_, x) => x !== i) })} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!o.dq} onChange={(v) => update(i, { dq: v })} />
              Disqualifying answer
            </label>
            {o.dq && (
              <TextInput placeholder="Reason recorded on the lead" value={o.dq_reason}
                onChange={(e) => update(i, { dq_reason: e.target.value })} className="flex-1 min-w-[200px]" />
            )}
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus}
        onClick={() => onChange({ ...question, options: [...options, { value: '', label: '', dq: false, dq_reason: '' }] })}>
        Add option
      </Button>
    </div>
  );
}

/* ----------------------------- Question editor ----------------------------- */
function QuestionCard({ question, index, total, registry, allQuestions, onChange, onMove, onDelete, onDuplicate }) {
  const [open, setOpen] = useState(false);
  const dqCount = (question.options || []).filter((o) => o.dq).length;
  const needsOptions = question.type === 'single' || question.type === 'multi';

  return (
    <Panel padded={false}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: '#122430', color: '#93AAB2' }}>{index + 1}</span>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-medium" style={{ color: '#E8F1EF' }}>{question.prompt || 'Untitled question'}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Pill>{question.type}</Pill>
            {question.field_name ? <Pill>{question.field_name}</Pill> : <span className="text-[11px]" style={{ color: '#D6A234' }}>no field mapped</span>}
            {dqCount > 0 && <StatusBadge label={`${dqCount} DQ`} tone="warning" />}
            {question.show_if?.field && <StatusBadge label="conditional" tone="info" />}
          </div>
        </button>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" icon={ChevronUp} title="Move up" disabled={index === 0} disabledReason="Already first" onClick={() => onMove(index, -1)} />
          <Button variant="ghost" size="sm" icon={ChevronDown} title="Move down" disabled={index === total - 1} disabledReason="Already last" onClick={() => onMove(index, 1)} />
          <Button variant="ghost" size="sm" icon={Copy} title="Duplicate" onClick={() => onDuplicate(index)} />
          <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => onDelete(index)} />
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t px-4 py-4" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
          <TextInput label="Prompt" value={question.prompt} onChange={(e) => onChange({ ...question, prompt: e.target.value })} />
          <TextInput label="Help text" value={question.help_text} onChange={(e) => onChange({ ...question, help_text: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput label="Type" value={question.type} options={QUESTION_TYPES} onChange={(e) => onChange({ ...question, type: e.target.value })} />
            <SelectInput label="Writes to field" hint="From the Custom Fields registry"
              value={question.field_name}
              options={[{ value: '', label: '— not mapped —' }, ...registry.map((f) => ({ value: f.field_name, label: `${f.label} (${f.field_name})` }))]}
              onChange={(e) => onChange({ ...question, field_name: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
            <Toggle checked={!!question.required} onChange={(v) => onChange({ ...question, required: v })} /> Required
          </label>

          {needsOptions && <OptionRows question={question} onChange={onChange} />}

          <div>
            <div className="mb-1.5 text-xs font-medium" style={{ color: '#93AAB2' }}>Show only if (optional)</div>
            <div className="flex flex-wrap items-center gap-2">
              <SelectInput value={question.show_if?.field || ''}
                options={[{ value: '', label: '— always show —' }, ...allQuestions.filter((q) => q.id !== question.id && q.field_name).map((q) => ({ value: q.field_name, label: q.prompt || q.field_name }))]}
                onChange={(e) => onChange({ ...question, show_if: e.target.value ? { ...(question.show_if || {}), field: e.target.value, operator: question.show_if?.operator || 'equals' } : null })}
                className="min-w-[160px] flex-1" />
              {question.show_if?.field && (
                <>
                  <SelectInput value={question.show_if?.operator || 'equals'} options={['equals', 'not_equals', 'contains', 'is_in']}
                    onChange={(e) => onChange({ ...question, show_if: { ...question.show_if, operator: e.target.value } })} />
                  <TextInput placeholder="value" value={question.show_if?.value || ''}
                    onChange={(e) => onChange({ ...question, show_if: { ...question.show_if, value: e.target.value } })} className="min-w-[120px] flex-1" />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* --------------------------------- Preview -------------------------------- */
function SurveyPreview({ survey }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const questions = survey.questions || [];

  const visible = questions.filter((q) => {
    if (!q.show_if?.field) return true;
    const v = answers[q.show_if.field];
    const target = q.show_if.value;
    switch (q.show_if.operator) {
      case 'not_equals': return String(v ?? '') !== String(target ?? '');
      case 'contains': return String(v ?? '').toLowerCase().includes(String(target ?? '').toLowerCase());
      case 'is_in': return String(target ?? '').split(',').map((s) => s.trim()).includes(String(v ?? ''));
      default: return String(v ?? '') === String(target ?? '');
    }
  });

  const done = step >= visible.length;
  // DQ is evaluated only here, at the end — never mid-flow.
  const dqHits = visible.flatMap((q) =>
    (q.options || []).filter((o) => o.dq && String(answers[q.field_name] ?? '') === String(o.value)).map((o) => ({ q, o }))
  );
  const routing = survey.completion_routing || {};
  const destination = done ? (dqHits.length > 0 ? routing.disqualified_url : routing.qualified_url) || routing.fallback_url : null;

  if (questions.length === 0) return <EmptyState icon={ListChecks} title="Add a question to preview the flow" />;

  return (
    <div className="space-y-4">
      {!done ? (
        <Panel>
          <div className="mb-3 text-xs" style={{ color: '#5E7681' }}>Step {step + 1} of {visible.length}</div>
          <h3 className="text-base font-semibold" style={{ color: '#E8F1EF' }}>{visible[step]?.prompt || 'Untitled question'}</h3>
          {visible[step]?.help_text && <p className="mt-1 text-sm" style={{ color: '#93AAB2' }}>{visible[step].help_text}</p>}
          <div className="mt-4 space-y-2">
            {(visible[step]?.type === 'single' || visible[step]?.type === 'multi') ? (
              (visible[step].options || []).map((o, i) => (
                <button key={i} onClick={() => { setAnswers({ ...answers, [visible[step].field_name]: o.value }); setStep(step + 1); }}
                  className="w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.04]"
                  style={{ background: '#122430', border: '1px solid rgba(148,180,190,0.26)', color: '#E8F1EF' }}>
                  {o.label || o.value || `Option ${i + 1}`}
                </button>
              ))
            ) : (
              <div className="flex gap-2">
                <TextInput placeholder="Type an answer" value={answers[visible[step]?.field_name] || ''}
                  onChange={(e) => setAnswers({ ...answers, [visible[step].field_name]: e.target.value })} className="flex-1" />
                <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>
              </div>
            )}
          </div>
        </Panel>
      ) : (
        <Panel>
          <h3 className="text-base font-semibold" style={{ color: '#E8F1EF' }}>Flow complete</h3>
          <div className="mt-3">
            <FieldRow label="Outcome" value={dqHits.length > 0 ? <StatusBadge label="disqualified" tone="danger" /> : <StatusBadge label="qualified" tone="success" />} />
            <FieldRow label="Routes to" value={destination || <span style={{ color: '#D6A234' }}>no route configured</span>} />
            {dqHits.length > 0 && <FieldRow label="DQ reason" value={dqHits.map((h) => h.o.dq_reason || h.o.label).join('; ')} />}
          </div>
          <p className="mt-3 text-xs" style={{ color: '#5E7681' }}>
            The respondent answered every question before this was decided. Disqualification is resolved here, at the end, never mid-flow.
          </p>
          <div className="mt-4"><Button variant="secondary" onClick={() => { setStep(0); setAnswers({}); }}>Restart preview</Button></div>
        </Panel>
      )}
      <Panel title="Answers so far">
        <pre className="overflow-x-auto text-xs" style={{ color: '#93AAB2' }}>{JSON.stringify(answers, null, 2)}</pre>
      </Panel>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function Surveys() {
  const [rows, setRows] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editorTab, setEditorTab] = useState('questions');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [s, f] = await Promise.all([
        base44.entities.Survey.list('-created_date', 200),
        base44.entities.CustomField.list('sort_order', 500).catch(() => []),
      ]);
      setRows(s || []); setRegistry(f || []);
    } catch (e) { setError(e?.message || 'Failed to load surveys'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...blankSurvey, questions: [] }); setEditorTab('questions'); };
  const openEdit = (s) => { setEditing({ ...blankSurvey, ...s, questions: s.questions || [] }); setEditorTab('questions'); };

  const setQuestions = (questions) => setEditing({ ...editing, questions });
  const updateQuestion = (i, q) => { const next = [...editing.questions]; next[i] = q; setQuestions(next); };
  const moveQuestion = (i, dir) => {
    const next = [...editing.questions];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next);
  };
  const duplicateQuestion = (i) => {
    const copy = { ...editing.questions[i], id: `q_${Math.random().toString(36).slice(2, 9)}` };
    const next = [...editing.questions]; next.splice(i + 1, 0, copy); setQuestions(next);
  };

  // Real problems only — surfaced before save, never invented.
  const problems = editing ? [
    ...(!editing.title ? ['The survey has no title.'] : []),
    ...((editing.questions || []).length === 0 ? ['No questions have been added.'] : []),
    ...((editing.questions || []).some((q) => !q.field_name) ? ['One or more questions are not mapped to a registry field, so their answers will not be saved to the lead.'] : []),
    ...((editing.questions || []).some((q) => (q.type === 'single' || q.type === 'multi') && (q.options || []).filter((o) => o.value).length === 0) ? ['A choice question has no options.'] : []),
    ...(!editing.completion_routing?.qualified_url ? ['No qualified destination is configured.'] : []),
  ] : [];

  const save = async (overrideStatus) => {
    setSaving(true);
    try {
      const payload = { ...editing, status: overrideStatus || editing.status, slug: editing.slug || slugify(editing.title) };
      if (editing.id) await base44.entities.Survey.update(editing.id, payload);
      else await base44.entities.Survey.create(payload);
      setEditing(null); load();
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => { await base44.entities.Survey.delete(deleteTarget.id); setDeleteTarget(null); load(); };

  return (
    <AdminLayout>
      <PageHeader title="Surveys" description="Build the on-site claim-check flows. Disqualification is resolved at the end, so every respondent completes the survey."
        actions={<Button variant="gold" icon={Plus} onClick={openNew}>New Survey</Button>} />

      <Panel padded={false}>
        <DataTable
          loading={loading} error={error} onRetry={load} rows={rows} onRowClick={openEdit}
          empty={<div className="p-4"><EmptyState icon={ListChecks} title="No surveys yet"
            description="Build a multi-step claim check that writes answers straight into the lead registry."
            action={<Button variant="gold" icon={Plus} onClick={openNew}>New Survey</Button>} /></div>}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'slug', header: 'Slug', render: (s) => <Pill>/s/{s.slug}</Pill> },
            { key: 'questions', header: 'Questions', render: (s) => (s.questions || []).length },
            { key: 'dq', header: 'DQ rules', render: (s) => (s.questions || []).reduce((n, q) => n + (q.options || []).filter((o) => o.dq).length, 0) || null },
            { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
            { key: 'responses', header: 'Responses' },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (s) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {s.status === 'published' && <a href={`/s/${s.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" icon={ExternalLink} title="Open live" /></a>}
                  <Button variant="ghost" size="sm" icon={Edit} title="Edit" onClick={() => openEdit(s)} />
                  <Button variant="ghost" size="sm" icon={Trash2} title="Delete" onClick={() => setDeleteTarget(s)} />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit: ${editing.title || 'survey'}` : 'New survey'} wide
        footer={<>
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="secondary" loading={saving} onClick={() => save('draft')}>Save draft</Button>
          <Button variant="gold" loading={saving} disabled={problems.length > 0}
            disabledReason={problems.length > 0 ? problems[0] : undefined}
            onClick={() => save('published')}>Publish</Button>
        </>}>
        {editing && (
          <div className="space-y-4">
            <Tabs tabs={[
              { label: 'Questions', value: 'questions', count: (editing.questions || []).length },
              { label: 'Preview', value: 'preview' },
              { label: 'Routing', value: 'routing' },
              { label: 'Settings', value: 'settings' },
            ]} value={editorTab} onChange={setEditorTab} />

            {problems.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(214,162,52,0.12)', border: '1px solid rgba(214,162,52,0.4)' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: '#D6A234' }} />
                  <span className="text-sm font-semibold" style={{ color: '#D6A234' }}>Not ready to publish</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm" style={{ color: '#93AAB2' }}>
                  {problems.map((p, i) => <li key={i}>• {p}</li>)}
                </ul>
              </div>
            )}

            {editorTab === 'questions' && (
              <div className="space-y-3 pt-2">
                {registry.length === 0 && (
                  <NotConfigured title="Field registry is empty"
                    description="Questions map their answers to registry fields. Load the registry first or answers won't be saved to the lead."
                    settingsHref="/admin/tools/custom-fields" settingsLabel="Go to Custom Fields" />
                )}
                {(editing.questions || []).length === 0 ? (
                  <EmptyState icon={ListChecks} title="No questions yet" description="Each question becomes one step in the flow."
                    action={<Button variant="gold" icon={Plus} onClick={() => setQuestions([newQuestion()])}>Add the first question</Button>} />
                ) : (
                  editing.questions.map((q, i) => (
                    <QuestionCard key={q.id} question={q} index={i} total={editing.questions.length}
                      registry={registry} allQuestions={editing.questions}
                      onChange={(next) => updateQuestion(i, next)}
                      onMove={moveQuestion}
                      onDuplicate={duplicateQuestion}
                      onDelete={(idx) => setQuestions(editing.questions.filter((_, x) => x !== idx))} />
                  ))
                )}
                {(editing.questions || []).length > 0 && (
                  <Button variant="secondary" icon={Plus} onClick={() => setQuestions([...editing.questions, newQuestion()])}>Add question</Button>
                )}
              </div>
            )}

            {editorTab === 'preview' && (
              <div className="pt-2">
                <SectionTitle hint="Nothing is saved from the preview">Walk the flow</SectionTitle>
                <SurveyPreview survey={editing} />
              </div>
            )}

            {editorTab === 'routing' && (
              <div className="space-y-4 pt-2">
                <TextInput label="Qualified destination" value={editing.completion_routing?.qualified_url || ''}
                  onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, qualified_url: e.target.value } })} />
                <TextInput label="Disqualified destination" hint="Disqualified respondents go to the thanks page, never a separate sorry page."
                  value={editing.completion_routing?.disqualified_url || ''}
                  onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, disqualified_url: e.target.value } })} />
                <TextInput label="Fallback destination" hint="Used when neither branch resolves cleanly"
                  value={editing.completion_routing?.fallback_url || ''}
                  onChange={(e) => setEditing({ ...editing, completion_routing: { ...editing.completion_routing, fallback_url: e.target.value } })} />
              </div>
            )}

            {editorTab === 'settings' && (
              <div className="space-y-4 pt-2">
                <TextInput label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                <TextInput label="Slug" hint="Public URL is /s/<slug>" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                <TextArea label="Description" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                <TextInput label="Submit button text" value={editing.submit_button_text} onChange={(e) => setEditing({ ...editing, submit_button_text: e.target.value })} />
                <TextArea label="Consent text" rows={4} hint="Shown at the contact-capture step" value={editing.consent_text} onChange={(e) => setEditing({ ...editing, consent_text: e.target.value })} />
                <TextInput label="Consent version" value={editing.consent_version} onChange={(e) => setEditing({ ...editing, consent_version: e.target.value })} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        consequence={`"${deleteTarget?.title}" will be permanently deleted. Any ad or link pointing at /s/${deleteTarget?.slug} will stop working.`} />
    </AdminLayout>
  );
}
