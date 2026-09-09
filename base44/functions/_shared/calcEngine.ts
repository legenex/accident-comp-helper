// Shared calculated-fields engine logic, imported directly (never over a
// network hop) by both runCalculatedFields/entry.ts and fireWebhooks/entry.ts.
// fireWebhooks must re-run calculations inline so a dead second hop can never
// leave an outbound payload unenriched.

export const OPERATORS = {
  equals: (a, b) => String(a ?? '') === String(b ?? ''),
  not_equals: (a, b) => String(a ?? '') !== String(b ?? ''),
  contains: (a, b) => String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  not_contains: (a, b) => !String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  is_in: (a, b) => Array.isArray(b) && b.map(String).includes(String(a)),
  is_not_in: (a, b) => !(Array.isArray(b) && b.map(String).includes(String(a))),
  exists: (a) => a !== undefined && a !== null,
  not_exists: (a) => a === undefined || a === null,
  is_blank: (a) => a === undefined || a === null || String(a).trim() === '',
  is_not_blank: (a) => a !== undefined && a !== null && String(a).trim() !== '',
  greater_than: (a, b) => Number(a) > Number(b),
  greater_than_or_equal: (a, b) => Number(a) >= Number(b),
  less_than: (a, b) => Number(a) < Number(b),
  less_than_or_equal: (a, b) => Number(a) <= Number(b),
};

export const WHITELISTED_SCRIPTS = {
  uppercase: (v) => String(v ?? '').toUpperCase(),
  lowercase: (v) => String(v ?? '').toLowerCase(),
  trim: (v) => String(v ?? '').trim(),
  title_case: (v) => String(v ?? '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  digits_only: (v) => String(v ?? '').replace(/\D/g, ''),
};

export function getField(ctx, key) {
  if (!key) return undefined;
  if (ctx.record[key] !== undefined) return ctx.record[key];
  if (ctx.record.custom_fields && ctx.record.custom_fields[key] !== undefined) return ctx.record.custom_fields[key];
  if (ctx.calculated[key] !== undefined) return ctx.calculated[key];
  return undefined;
}

export function interpolate(template, ctx) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = getField(ctx, key);
    return v === undefined || v === null ? '' : String(v);
  });
}

function evalConditionGroup(group, ctx) {
  const logic = (group.logic || 'ALL').toUpperCase();
  const conditions = group.conditions || [];
  const results = conditions.map((c) => {
    const op = OPERATORS[c.operator];
    if (!op) return false;
    return !!op(getField(ctx, c.field), c.value);
  });
  return logic === 'ANY' ? results.some(Boolean) : results.every(Boolean);
}

function runTransform(field, ctx) {
  const input = getField(ctx, field.input_field);
  const cfg = field.config || {};
  try {
    switch (field.transform_type) {
      case 'clone':
        return { output: input, matched: 'clone', error: null };
      case 'value_map': {
        const mappings = cfg.mappings || [];
        const exact = mappings.find((m) => String(m.from) === String(input));
        if (exact) return { output: exact.to, matched: `exact:${exact.from}`, error: null };
        if (cfg.case_insensitive_fallback) {
          const norm = String(input ?? '').trim().toLowerCase();
          const loose = mappings.find((m) => String(m.from).trim().toLowerCase() === norm);
          if (loose) return { output: loose.to, matched: `normalized:${loose.from}`, error: null };
        }
        return { output: cfg.default ?? null, matched: 'default', error: null };
      }
      case 'date_age_bucket': {
        const d = input ? new Date(input) : null;
        if (!d || isNaN(d.getTime())) return { output: cfg.fallback ?? null, matched: 'unparseable_date', error: 'Could not parse input as a date' };
        const ageDays = Math.floor((Date.now() - d.getTime()) / 86400000);
        const buckets = [...(cfg.buckets || [])].sort((a, b) => a.max_days - b.max_days);
        const hit = buckets.find((b) => ageDays <= b.max_days);
        if (hit) return { output: hit.value, matched: `bucket<=${hit.max_days}d (age=${ageDays}d)`, error: null };
        return { output: cfg.fallback ?? null, matched: `no_bucket (age=${ageDays}d)`, error: null };
      }
      case 'conditional': {
        const groups = cfg.rule_groups || [];
        for (let i = 0; i < groups.length; i++) {
          if (evalConditionGroup(groups[i], ctx)) {
            return { output: interpolate(groups[i].output, ctx), matched: `rule_group[${i}]`, error: null };
          }
        }
        return { output: interpolate(cfg.fallback_template ?? null, ctx), matched: 'fallback_template', error: null };
      }
      case 'script': {
        const fn = WHITELISTED_SCRIPTS[cfg.whitelisted_transform];
        if (!fn) return { output: input, matched: 'unrecognized_script', error: `'${cfg.whitelisted_transform}' is not a whitelisted transform — original value passed through` };
        return { output: fn(input), matched: cfg.whitelisted_transform, error: null };
      }
      default:
        return { output: null, matched: null, error: `Unknown transform_type '${field.transform_type}'` };
    }
  } catch (e) {
    return { output: null, matched: null, error: e?.message || String(e) };
  }
}

// Topological sort by depends_on, ties broken by sort_order. Cycles are
// detected and reported, never followed — cyclic nodes run in sort_order.
export function orderFields(fields) {
  const byToken = new Map(fields.map((f) => [f.token, f]));
  const remaining = new Set(fields.map((f) => f.token));
  const ordered = [];
  let cycleDetected = false;
  let guard = fields.length + 1;

  while (remaining.size > 0 && guard-- > 0) {
    const ready = [...remaining]
      .map((t) => byToken.get(t))
      .filter((f) => (f.depends_on || []).every((dep) => !remaining.has(dep) || !byToken.has(dep)))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (ready.length === 0) { cycleDetected = true; break; }
    for (const f of ready) { ordered.push(f); remaining.delete(f.token); }
  }
  if (remaining.size > 0) {
    const rest = [...remaining].map((t) => byToken.get(t)).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    ordered.push(...rest);
  }
  return { ordered, cycleDetected };
}

// Runs every enabled (optionally pre-filtered) CalculatedField def against a
// record in memory. Never persists — callers decide whether/how to save.
export function runCalculatedFieldsInline(record, defs) {
  const enabled = (defs || []).filter((f) => f.enabled !== false);
  const { ordered, cycleDetected } = orderFields(enabled);
  const ctx = { record, calculated: { ...(record.calculated_fields || {}) } };
  const trace = [];
  for (const field of ordered) {
    const started = performance.now();
    const inputValue = getField(ctx, field.input_field);
    const { output, matched, error } = runTransform(field, ctx);
    ctx.calculated[field.token] = output;
    trace.push({
      token: field.token, label: field.label, input_field: field.input_field,
      input_value: inputValue ?? null, matched, output,
      duration_ms: Math.round((performance.now() - started) * 100) / 100, error,
    });
  }
  return { calculated: ctx.calculated, trace, cycleDetected };
}
