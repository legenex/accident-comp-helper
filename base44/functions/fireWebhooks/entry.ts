// Webhook delivery engine.
//
// Order of operations, and it matters:
//   1. Load the record
//   2. Run calculated fields first (inline — no second network hop)
//   3. Select webhooks whose trigger matches and whose conditions pass
//   4. Build each payload from its mapping
//   5. Deliver with bounded retries and exponential backoff
//   6. Write a delivery record per attempt
//
// Fire-and-forget from the capture surface: a dead endpoint must never cost
// a captured record or block the user's confirmation screen. Always returns
// 200, even on internal failure.
import { createClientFromRequest } from 'npm:@base44/sdk';
import { runCalculatedFieldsInline, getField, interpolate } from './calcEngine.ts';

const REDACT_PATTERN = /token|secret|key|password|authorization/i;
const RETRY_COUNTS = { none: 1, '3x': 3, '5x': 5 };

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACT_PATTERN.test(k) ? '[redacted]' : (v && typeof v === 'object' ? redact(v) : v);
  }
  return out;
}

function conditionsPass(webhook, ctx) {
  const conditions = webhook.conditions || [];
  if (conditions.length === 0) return true;
  return conditions.every((c) => {
    const a = getField(ctx, c.field);
    switch (c.operator) {
      case 'equals': return String(a ?? '') === String(c.value ?? '');
      case 'not_equals': return String(a ?? '') !== String(c.value ?? '');
      case 'contains': return String(a ?? '').toLowerCase().includes(String(c.value ?? '').toLowerCase());
      case 'is_in': return Array.isArray(c.value) && c.value.map(String).includes(String(a));
      case 'exists': return a !== undefined && a !== null;
      case 'not_exists': return a === undefined || a === null;
      default: return true;
    }
  });
}

function buildPayload(webhook, ctx) {
  const mapping = webhook.payload_mapping || {};
  const payload = {};
  for (const [outKey, template] of Object.entries(mapping)) {
    payload[outKey] = typeof template === 'string' && template.includes('{{') ? interpolate(template, ctx) : template;
  }
  return payload;
}

async function readSecret(secretRef) {
  if (!secretRef) return null;
  // Secrets are environment-only — never stored on the Webhook record, never
  // returned to a client, never rendered, never written to a delivery log.
  try { return Deno.env.get(secretRef) || null; } catch { return null; }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function deliverOnce(webhook, payload, secret) {
  const started = performance.now();
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (secret) headers['Authorization'] = `Bearer ${secret}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), webhook.timeout_ms || 8000);
    const res = await fetch(webhook.endpoint_url, {
      method: webhook.http_method || 'POST',
      headers,
      body: (webhook.http_method || 'POST') === 'GET' ? undefined : JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const bodyText = await res.text().catch(() => '');
    return {
      ok: res.ok, http_status: res.status,
      duration_ms: Math.round(performance.now() - started),
      response_body: bodyText.slice(0, 2000),
      // 4xx other than 408/429 will not succeed on retry.
      shouldRetry: !res.ok && !(res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429),
      error: res.ok ? null : `HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, http_status: null, duration_ms: Math.round(performance.now() - started), response_body: '', shouldRetry: true, error: e?.message || String(e) };
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { lead_id, event, event_version = '1', webhook_id, dry_run } = body || {};
    if (!lead_id || !event) return Response.json({ ok: false, error: 'lead_id and event are required' });

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    // 1. Load the record
    const lead = await db.entities.Lead.get(lead_id);
    if (!lead) return Response.json({ ok: false, error: `Lead ${lead_id} not found` });

    // 2. Run calculated fields first, inline
    const calcDefs = await db.entities.CalculatedField.list();
    const { calculated } = runCalculatedFieldsInline(lead, calcDefs || []);
    const enrichedLead = { ...lead, calculated_fields: calculated };
    if (!dry_run) {
      db.entities.Lead.update(lead_id, { calculated_fields: calculated }).catch(() => {});
    }
    const ctx = { record: enrichedLead, calculated };

    // 3. Select matching webhooks
    let webhooks = await db.entities.Webhook.list();
    webhooks = (webhooks || []).filter((w) => w.enabled !== false);
    if (webhook_id) webhooks = webhooks.filter((w) => w.id === webhook_id);
    webhooks = webhooks.filter((w) => (w.triggers || []).includes(event) && conditionsPass(w, ctx));

    const results = [];
    for (const webhook of webhooks) {
      const idempotencyKey = `${lead_id}:${webhook.id}:${event}:${event_version}`;
      const payload = buildPayload(webhook, ctx);

      if (dry_run) {
        results.push({ webhook_id: webhook.id, webhook_name: webhook.name, resolved_payload: payload, dry_run: true });
        continue;
      }

      // Idempotency: a repeat call whose key already succeeded is skipped.
      const priorSuccess = (await db.entities.WebhookDelivery.filter({ idempotency_key: idempotencyKey, status: 'success' }).catch(() => [])) || [];
      if (priorSuccess.length > 0) {
        results.push({ webhook_id: webhook.id, webhook_name: webhook.name, status: 'skipped', reason: 'idempotency key already succeeded' });
        continue;
      }

      const secret = await readSecret(webhook.auth_secret_ref);
      const maxAttempts = RETRY_COUNTS[webhook.retry_policy] || RETRY_COUNTS['3x'];
      let attempt = 0;
      let final = null;

      while (attempt < maxAttempts) {
        attempt += 1;
        const attemptResult = await deliverOnce(webhook, payload, secret);
        final = attemptResult;

        await db.entities.WebhookDelivery.create({
          webhook_id: webhook.id, lead_id, event, event_version,
          idempotency_key: idempotencyKey, attempt_number: attempt,
          status: attemptResult.ok ? 'success' : (attempt < maxAttempts && attemptResult.shouldRetry ? 'retrying' : 'failed'),
          http_status: attemptResult.http_status, duration_ms: attemptResult.duration_ms,
          resolved_payload: redact(payload), response_body: attemptResult.response_body,
          error_message: attemptResult.error,
        }).catch(() => {});

        if (attemptResult.ok || !attemptResult.shouldRetry) break;
        if (attempt < maxAttempts) await sleep(Math.min(8000, 500 * 2 ** (attempt - 1)));
      }

      db.entities.Webhook.update(webhook.id, {
        last_delivery_at: new Date().toISOString(),
        last_delivery_status: final?.ok ? 'success' : 'failed',
        success_count: (webhook.success_count || 0) + (final?.ok ? 1 : 0),
        failure_count: (webhook.failure_count || 0) + (final?.ok ? 0 : 1),
      }).catch(() => {});

      results.push({ webhook_id: webhook.id, webhook_name: webhook.name, status: final?.ok ? 'success' : 'failed', attempts: attempt, http_status: final?.http_status });
    }

    return Response.json({ ok: true, dry_run: !!dry_run, matched_webhooks: webhooks.length, results });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error), results: [] });
  }
});
