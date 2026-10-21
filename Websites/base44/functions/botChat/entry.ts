// Bot chat backend. The browser must never hold a model credential, so all
// model calls go through here. The API key is read from the environment and
// never returned to the client.
//
// If ANTHROPIC_API_KEY is not set, this returns a structured
// `not_configured` response rather than a fake reply or a generic error, so
// the UI can show a configuration notice instead of pretending to work.
import { createClientFromRequest } from 'npm:@base44/sdk';

const QUIZ_URL = 'https://quiz.accidentcompensationhelper.com/s/eval';

// Compliance rules are enforced server-side so they cannot be edited away
// from the client. These are legal-advertising requirements, not preferences.
function buildSystemPrompt(config, knowledge) {
  const kb = (knowledge || []).map((k) => `### ${k.title}\n${k.content}`).join('\n\n');
  return [
    `You are "${config?.display_name || 'Claim Assistant'}", an assistant on Accident Compensation Helper, a free US service that helps accident victims understand whether their situation may be worth discussing with a participating personal injury attorney.`,
    '',
    'Hard rules, no exceptions:',
    '- You are NOT a lawyer and this is NOT a law firm. Never give legal advice.',
    '- Never predict, guarantee, or estimate the outcome or value of a claim.',
    '- Never state or imply the person is entitled to money, or that money is waiting for them.',
    '- Never quote settlement figures, averages, or ranges.',
    '- Never imply government or insurer affiliation.',
    '- Do not collect medical detail beyond what is needed to route them.',
    '- If asked something you cannot answer, say so plainly and offer the claim check.',
    '- If the person describes an emergency or active medical crisis, tell them to contact emergency services.',
    '',
    `When someone seems ready to proceed, point them to the free claim check: ${config?.handoff_url || QUIZ_URL}`,
    'Keep replies short, plain, and calm. No hype, no manufactured urgency.',
    kb
      ? `\nGrounding knowledge (use only this for factual claims):\n${kb}`
      : '\nNo knowledge base entries are assigned, so stick to general, non-specific guidance.',
  ].join('\n');
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, session_id, persist } = body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ ok: false, error: 'messages array is required' });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return Response.json({
        ok: false,
        not_configured: true,
        error: 'ANTHROPIC_API_KEY is not set for this app, so the bot cannot send messages. Add it in the Base44 environment settings.',
      });
    }

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    const configs = await db.entities.BotConfig.list().catch(() => []);
    const config = (configs && configs[0]) || {};

    let knowledge = [];
    const ids = config.knowledge_base_ids || [];
    if (ids.length > 0) {
      const all = await db.entities.KnowledgeBaseItem.list().catch(() => []);
      knowledge = (all || []).filter((k) => ids.includes(k.id) && k.enabled !== false);
    }

    const model = config.model && config.model !== 'default' ? config.model : 'claude-sonnet-4-6';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: buildSystemPrompt(config, knowledge),
        messages: messages.map((m) => ({ role: m.role, content: String(m.content || '') })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Surface the real error rather than a fabricated success.
      return Response.json({ ok: false, error: data?.error?.message || `Model request failed (HTTP ${res.status})` });
    }

    const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!reply) return Response.json({ ok: false, error: 'The model returned no text.' });

    // Persist only real visitor conversations, never admin test sessions.
    if (persist && session_id) {
      const transcript = [...messages, { role: 'assistant', content: reply }]
        .map((m) => ({ role: m.role === 'assistant' ? 'bot' : 'user', content: m.content, at: new Date().toISOString() }));
      const handedOff = reply.includes(config.handoff_url || QUIZ_URL);
      const existing = await db.entities.BotConversation.filter({ session_id }).catch(() => []);
      if (existing && existing[0]) {
        await db.entities.BotConversation.update(existing[0].id, {
          transcript,
          outcome: handedOff ? 'handed_off' : existing[0].outcome || 'ongoing',
        }).catch(() => {});
      } else {
        await db.entities.BotConversation.create({
          session_id, transcript, outcome: handedOff ? 'handed_off' : 'ongoing', is_test: false,
        }).catch(() => {});
      }
    }

    return Response.json({ ok: true, reply });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) });
  }
});
