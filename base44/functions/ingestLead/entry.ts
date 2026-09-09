// Lead capture pipeline: validate -> normalise -> create -> attribution ->
// calculate -> deliver. Every capture surface (the external quiz at
// quiz.accidentcompensationhelper.com posting completed submissions, and the
// on-site Contact form) must run this identical pipeline — that's what this
// function exists to guarantee.
//
// NOTE: this is meant to be called unauthenticated by an external system
// (the quiz platform's postback / Zapier / etc). Verify in this app's Base44
// function settings that ingestLead is configured for public invocation —
// that toggle lives outside what this sandbox can inspect from here.
//
// Never writes a placeholder record with fake values: if required fields are
// missing, this returns a 400-shaped error body instead of creating a
// half-empty Lead that would poison reporting.
import { createClientFromRequest } from 'npm:@base44/sdk';
import { runCalculatedFieldsInline } from './calcEngine.ts';

const CANONICAL_FIELDS = new Set([
  'first_name', 'last_name', 'email', 'mobile', 'zip_code',
  'accident_type', 'accident_state', 'incident_date', 'injured', 'injury_type',
  'treatment', 'medical_bills', 'lost_wages', 'fault', 'attorney',
  'qualification_status', 'disqualify_reason', 'source', 'source_ref',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'ad_label', 'gclid', 'fbclid', 'landing_url', 'referrer_url',
  'consent_text', 'consent_version', 'consent_timestamp', 'consent_cert_url', 'notes',
]);

function normalize(raw) {
  const lead = {};
  const custom = {};
  for (const [key, value] of Object.entries(raw || {})) {
    if (CANONICAL_FIELDS.has(key)) lead[key] = typeof value === 'string' ? value.trim() : value;
    else if (key !== 'raw_payload') custom[key] = value;
  }
  if (Object.keys(custom).length > 0) lead.custom_fields = custom;
  return lead;
}

function hasMinimumViableContact(lead) {
  // Never create a placeholder record — require at least one way to reach
  // the person, or the row is unusable and poisons reporting.
  return !!(lead.email || lead.mobile);
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return Response.json({ ok: false, error: 'POST only' }, { status: 405 });
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== 'object') return Response.json({ ok: false, error: 'Invalid or missing JSON body' }, { status: 400 });

    // --- validate + normalise ---
    const lead = normalize(raw);
    if (!hasMinimumViableContact(lead)) {
      return Response.json({ ok: false, error: 'At least one of email or mobile is required' }, { status: 400 });
    }
    if (!lead.qualification_status) lead.qualification_status = 'new';
    if (!lead.source) lead.source = 'quiz';

    // --- attribution (hidden capture) ---
    lead.ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || lead.ip_address || null;
    lead.user_agent = req.headers.get('user-agent') || lead.user_agent || null;
    lead.raw_payload = raw;

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    // --- create ---
    const created = await db.entities.Lead.create(lead);

    // --- calculate (best-effort, never blocks the response) ---
    let calculatedFields = {};
    try {
      const defs = await db.entities.CalculatedField.list();
      const { calculated } = runCalculatedFieldsInline(created, defs || []);
      calculatedFields = calculated;
      await db.entities.Lead.update(created.id, { calculated_fields: calculated });
    } catch (e) {
      db.entities.AuditLog.create({
        actor_email: 'system:ingestLead', action: 'lead.calculate_failed',
        entity_type: 'Lead', entity_id: created.id, summary: e?.message || String(e),
      }).catch(() => {});
    }

    // --- deliver (fire-and-forget — a dead buyer endpoint must never cost
    // the captured record or block this response) ---
    fireDeliveries(base44, created.id).catch(() => {});

    db.entities.AuditLog.create({
      actor_email: `system:ingestLead:${lead.source}`,
      action: 'lead.created', entity_type: 'Lead', entity_id: created.id,
      summary: `New ${lead.source} lead (${lead.accident_state || 'state unknown'})`,
    }).catch(() => {});

    return Response.json({ ok: true, lead_id: created.id, qualification_status: lead.qualification_status, calculated_fields: calculatedFields });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
});

// Fire the lead.created event through the same webhook engine fireWebhooks
// uses, without a network hop back into this app.
async function fireDeliveries(base44, leadId) {
  const db = base44.asServiceRole;
  await base44.functions.invoke('fireWebhooks', { lead_id: leadId, event: 'lead.created' }).catch((e) => {
    db.entities.AuditLog.create({
      actor_email: 'system:ingestLead', action: 'webhook.dispatch_failed',
      entity_type: 'Lead', entity_id: leadId, summary: e?.message || String(e),
    }).catch(() => {});
  });
}
