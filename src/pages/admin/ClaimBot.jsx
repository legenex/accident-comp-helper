import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PageHeader, Panel, Button, TextInput, TextArea, SelectInput, DataTable, StatusBadge,
  Modal, EmptyState, Tabs, Toggle, NotConfigured, StatCard, FieldRow, Pill, SectionTitle,
} from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Bot, Send, MessageSquare, ArrowRightLeft, Save, RefreshCw, BookMarked } from 'lucide-react';

const QUIZ_URL = 'https://quiz.accidentcompensationhelper.com/s/eval';
const blankConfig = {
  enabled: false, display_name: 'Claim Assistant',
  greeting_message: 'Hi — I can help you understand whether your accident may be worth checking. What happened?',
  placement: 'bottom_right', model: 'default', knowledge_base_ids: [], handoff_url: QUIZ_URL,
};

// The bot must never give legal advice or predict outcomes. This is prepended
// to every request, including the test console, so the console exercises the
// same behaviour visitors get rather than a friendlier stand-in.
function buildSystemPrompt(config, knowledge) {
  const kb = knowledge.map((k) => `### ${k.title}\n${k.content}`).join('\n\n');
  return [
    `You are "${config.display_name || 'Claim Assistant'}", an assistant on Accident Compensation Helper, a free service that helps US accident victims understand whether their situation may be worth discussing with a participating personal injury attorney.`,
    '',
    'Hard rules, no exceptions:',
    '- You are NOT a lawyer and this is NOT a law firm. Never give legal advice.',
    '- Never predict, guarantee, or estimate the outcome or value of a claim.',
    '- Never state or imply the person is entitled to money, or that money is waiting for them.',
    '- Never quote settlement figures, averages, or ranges.',
    '- Never imply government or insurer affiliation.',
    '- Do not collect medical detail beyond what is needed to route them.',
    '- If asked something you cannot answer, say so plainly and offer the claim check.',
    '',
    `When someone seems ready to proceed, point them to the free claim check: ${config.handoff_url || QUIZ_URL}`,
    'Keep replies short, plain, and calm. No hype, no urgency.',
    kb ? `\nGrounding knowledge (use only this for factual claims):\n${kb}` : '\nNo knowledge base entries are assigned, so stick to general, non-specific guidance.',
  ].join('\n');
}

export default function BotAdmin() {
  const [tab, setTab] = useState('config');
  const [config, setConfig] = useState(null);
  const [knowledge, setKnowledge] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [viewing, setViewing] = useState(null);

  // Test console
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [testError, setTestError] = useState(null);
  const scrollRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, k, conv] = await Promise.all([
        base44.entities.BotConfig.list().catch(() => []),
        base44.entities.KnowledgeBaseItem.list().catch(() => []),
        base44.entities.BotConversation.list('-created_date', 100).catch(() => []),
      ]);
      setConfig((c && c[0]) || { ...blankConfig });
      setKnowledge(k || []);
      setConversations(conv || []);
    } catch { setConfig({ ...blankConfig }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const save = async () => {
    if (config.id) await base44.entities.BotConfig.update(config.id, config);
    else { const created = await base44.entities.BotConfig.create(config); setConfig(created); }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const assignedKnowledge = knowledge.filter(
    (k) => k.enabled !== false && (config?.knowledge_base_ids || []).includes(k.id)
  );

  const toggleKnowledge = (id) => {
    const ids = config.knowledge_base_ids || [];
    setConfig({ ...config, knowledge_base_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMessage = { role: 'user', content: input.trim() };
    const history = [...messages, userMessage];
    setMessages(history); setInput(''); setSending(true); setTestError(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: buildSystemPrompt(config, assignedKnowledge),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      if (!text) throw new Error(data?.error?.message || 'The model returned no text.');
      setMessages([...history, { role: 'assistant', content: text }]);
    } catch (e) {
      setTestError(e?.message || String(e));
    }
    setSending(false);
  };

  const handedOff = conversations.filter((c) => c.outcome === 'handed_off').length;

  if (loading || !config) return <AdminLayout><PageHeader title="Bot" /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader title="Bot" description="The on-site claim assistant: how it behaves, what it knows, and what it actually said."
        actions={tab === 'config' ? <Button variant="gold" icon={Save} onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button> : null} />

      {!config.enabled && (
        <div className="mb-4">
          <NotConfigured title="The bot is switched off"
            description="It won't appear on the public site until you enable it below. The test console still works so you can rehearse its behaviour first." />
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Conversations" value={conversations.length} icon={MessageSquare} tone="brand" />
        <StatCard label="Handed off to claim check" value={handedOff} icon={ArrowRightLeft} tone="success" />
        <StatCard label="Knowledge assigned" value={assignedKnowledge.length} icon={BookMarked} tone="neutral" />
        <StatCard label="Status" value={config.enabled ? 'Live' : 'Off'} icon={Bot} tone={config.enabled ? 'success' : 'neutral'} />
      </div>

      <Tabs tabs={[
        { label: 'Configuration', value: 'config' },
        { label: 'Knowledge', value: 'knowledge', count: assignedKnowledge.length },
        { label: 'Test console', value: 'test' },
        { label: 'Conversations', value: 'conversations', count: conversations.length },
      ]} value={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'config' && (
          <div className="max-w-2xl">
            <Panel>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: '1px solid rgba(148,180,190,0.14)' }}>
                  <span className="text-sm" style={{ color: '#E8F1EF' }}>Show the bot on the public site</span>
                  <Toggle checked={!!config.enabled} onChange={(v) => setConfig({ ...config, enabled: v })} />
                </label>
                <TextInput label="Display name" value={config.display_name} onChange={(e) => setConfig({ ...config, display_name: e.target.value })} />
                <TextArea label="Greeting message" rows={3} value={config.greeting_message} onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectInput label="Placement" value={config.placement} options={['bottom_right', 'bottom_left', 'inline']} onChange={(e) => setConfig({ ...config, placement: e.target.value })} />
                  <SelectInput label="Model" value={config.model} options={['default', 'claude-sonnet-4-6', 'claude-haiku-4-5']} onChange={(e) => setConfig({ ...config, model: e.target.value })} />
                </div>
                <TextInput label="Hand-off URL" hint="Where the bot sends someone ready to start a real claim check" value={config.handoff_url} onChange={(e) => setConfig({ ...config, handoff_url: e.target.value })} />
              </div>
            </Panel>
            <div className="mt-4">
              <SectionTitle>Behaviour rules</SectionTitle>
              <Panel>
                <p className="text-sm" style={{ color: '#93AAB2' }}>
                  These are enforced in the system prompt on every request and are not editable here, because they are advertising-compliance
                  requirements rather than preferences. The bot will not give legal advice, predict or value an outcome, claim entitlement to
                  money, quote settlement figures, or imply government affiliation.
                </p>
              </Panel>
            </div>
          </div>
        )}

        {tab === 'knowledge' && (
          <Panel padded={false}>
            {knowledge.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={BookMarked} title="No knowledge base items yet"
                  description="The bot answers from assigned knowledge. Without any, it stays on general guidance only."
                  action={<a href="/admin/settings/knowledge-base"><Button variant="gold">Go to Knowledge Base</Button></a>} />
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 text-sm" style={{ color: '#93AAB2' }}>Tick the entries this bot may use for factual claims.</div>
                <DataTable
                  rows={knowledge}
                  columns={[
                    {
                      key: 'assigned', header: 'Assigned',
                      render: (k) => <div onClick={(e) => e.stopPropagation()}><Toggle checked={(config.knowledge_base_ids || []).includes(k.id)} onChange={() => toggleKnowledge(k.id)} /></div>,
                    },
                    { key: 'title', header: 'Title' },
                    { key: 'category', header: 'Category' },
                    { key: 'enabled', header: 'Active', render: (k) => k.enabled !== false ? <StatusBadge label="enabled" tone="success" /> : <StatusBadge label="disabled" tone="neutral" /> },
                  ]}
                />
                <div className="p-4"><Button variant="gold" icon={Save} onClick={save}>{saved ? 'Saved' : 'Save assignment'}</Button></div>
              </>
            )}
          </Panel>
        )}

        {tab === 'test' && (
          <div className="max-w-3xl">
            <Panel padded={false}>
              <div ref={scrollRef} className="admin-scroll max-h-[420px] min-h-[240px] space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#122430', color: '#93AAB2' }}>
                    {config.greeting_message}
                  </div>
                ) : messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm"
                      style={m.role === 'user'
                        ? { background: '#028CC9', color: '#fff' }
                        : { background: '#122430', color: '#E8F1EF', border: '1px solid rgba(148,180,190,0.14)' }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && <div className="text-xs" style={{ color: '#5E7681' }}>Thinking…</div>}
                {testError && <div className="text-sm" style={{ color: '#E5534B' }}>{testError}</div>}
              </div>
              <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'rgba(148,180,190,0.14)' }}>
                <TextInput placeholder="Ask what a visitor might ask..." value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }} className="flex-1" />
                <Button variant="primary" icon={Send} loading={sending} onClick={send}>Send</Button>
                <Button variant="ghost" icon={RefreshCw} title="Clear conversation" onClick={() => { setMessages([]); setTestError(null); }} />
              </div>
            </Panel>
            <p className="mt-2 text-xs" style={{ color: '#5E7681' }}>
              The console uses the same system prompt and assigned knowledge as the live bot, so what you see here is what visitors get.
              Test conversations are not saved.
            </p>
          </div>
        )}

        {tab === 'conversations' && (
          <Panel padded={false}>
            <DataTable
              rows={conversations} onRowClick={setViewing}
              empty={<div className="p-4"><EmptyState icon={MessageSquare} title="No conversations yet"
                description="Real visitor conversations appear here once the bot is live on the site." /></div>}
              columns={[
                { key: 'created_date', header: 'When', render: (c) => c.created_date ? new Date(c.created_date).toLocaleString() : null },
                { key: 'session_id', header: 'Session', render: (c) => <Pill>{String(c.session_id || '').slice(0, 12)}</Pill> },
                { key: 'turns', header: 'Turns', render: (c) => (c.transcript || []).length },
                { key: 'outcome', header: 'Outcome', render: (c) => <StatusBadge status={c.outcome} /> },
                { key: 'lead_id', header: 'Lead', render: (c) => c.lead_id ? <Pill>{String(c.lead_id).slice(0, 8)}</Pill> : null },
              ]}
            />
          </Panel>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Conversation" wide>
        {viewing && (
          <div className="space-y-4">
            <div>
              <FieldRow label="Session" value={viewing.session_id} />
              <FieldRow label="Outcome" value={<StatusBadge status={viewing.outcome} />} />
              <FieldRow label="Lead" value={viewing.lead_id} />
            </div>
            <div className="space-y-2">
              {(viewing.transcript || []).map((t, i) => (
                <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm"
                    style={t.role === 'user' ? { background: '#028CC9', color: '#fff' } : { background: '#122430', color: '#E8F1EF' }}>
                    {t.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
