// Calculated Fields engine — thin HTTP wrapper around the shared inline
// engine (see _shared/calcEngine.ts). Always returns 200, even on internal
// failure, so a caller is never blocked.
//
// Call modes:
//   { lead_id }                    run and persist to that Lead
//   { lead_id, dry_run: true }     run, persist nothing, return trace
//   { sample: {...} }              run against ad-hoc values, dry-run only
//   { lead_id | sample, field_id } restrict to a single field (Test button)
import { createClientFromRequest } from 'npm:@base44/sdk';
import { runCalculatedFieldsInline } from '../_shared/calcEngine.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { lead_id, sample, dry_run, field_id } = body || {};
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    let record = sample || {};
    if (lead_id) {
      record = await db.entities.Lead.get(lead_id);
      if (!record) return Response.json({ ok: false, error: `Lead ${lead_id} not found` });
    }
    const persist = !!lead_id && !dry_run && !sample;

    let defs = await db.entities.CalculatedField.list();
    if (field_id) defs = (defs || []).filter((f) => f.id === field_id || f.token === field_id);

    const { calculated, trace, cycleDetected } = runCalculatedFieldsInline(record, defs);

    if (persist) {
      await db.entities.Lead.update(lead_id, { calculated_fields: calculated });
      db.entities.AuditLog.create({
        actor_email: 'system:runCalculatedFields',
        action: 'lead.recalculate',
        entity_type: 'Lead',
        entity_id: lead_id,
        summary: `Ran ${trace.length} calculated field(s)${cycleDetected ? ' (cycle detected)' : ''}`,
      }).catch(() => {});
    }

    return Response.json({ ok: true, persisted: persist, calculated_fields: calculated, trace, cycle_detected: cycleDetected });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error), trace: [] });
  }
});
