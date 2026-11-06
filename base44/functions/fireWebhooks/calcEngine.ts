// Shared calculated-fields engine. Duplicated (not imported across function
// boundaries — Base44 functions can't reach outside their own folder) into
// runCalculatedFields/, fireWebhooks/ and ingestLead/ so delivery can re-run
// calculations inline without a network hop. Keep the copies in sync.
//
// Config format matches the canonical Legenex export: `config` is a JSON
// STRING, value_map uses {map:{from:to}}, date_age_bucket uses
// {buckets:[{label,max_days}],fallback,date_format}, and conditional uses
// {rules:[{conditions:<group>,output}],fallback}.

export const OPERATORS = {
  equals: (a, b) => norm(a) === norm(b),
  not_equals: (a, b) => norm(a) !== norm(b),
  contains: (a, b) => String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  not_contains: (a, b) => !String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  is_in: (a, b) => toArray(b).map(norm).includes(norm(a)),
  is_not_in: (a, b) => !toArray(b).map(norm).includes(norm(a)),
  exists: (a) => a !== undefined && a !== null && String(a) !== '',
  not_exists: (a) => a === undefined || a === null || String(a) === '',
  is_blank: (a) => a === undefined || a === null || String(a).trim() === '',
  is_not_blank: (a) => a !== undefined && a !== null && String(a).trim() !== '',
  greater_than: (a, b) => Number(a) > Number(b),
  greater_than_or_equal: (a, b) => Number(a) >= Number(b),
  less_than: (a, b) => Number(a) < Number(b),
  less_than_or_equal: (a, b) => Number(a) <= Number(b),
  starts_with: (a, b) => String(a ?? '').toLowerCase().startsWith(String(b ?? '').toLowerCase()),
  ends_with: (a, b) => String(a ?? '').toLowerCase().endsWith(String(b ?? '').toLowerCase()),
};

function norm(v) { return String(v ?? '').trim().toLowerCase(); }
function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',').map((s) => s.trim());
  return [v];
}

// Whitelisted script transforms. A runtime that blocks dynamic evaluation is
// not worked around or faked: an unrecognised script returns the original
// value with an explicit error in the trace, rather than silently dropping
// data or throwing during capture.
export const WHITELISTED_SCRIPTS = {
  uppercase: (v) => String(v ?? '').toUpperCase(),
  lowercase: (v) => String(v ?? '').toLowerCase(),
  trim: (v) => String(v ?? '').trim(),
  title_case: (v) => String(v ?? '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  digits_only: (v) => String(v ?? '').replace(/\D/g, ''),
  // MM/DD/YYYY -> YYYY-MM-DD (ISO). Matches the exported incident_date_2 rule.
  mdy_to_iso: (v) => {
    if (!v) return v;
    const m = String(v).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m ? `${m[3]}-${m[1]}-${m[2]}` : v;
  },
  // YYYY-MM-DD -> MM/DD/YYYY
  iso_to_mdy: (v) => {
    if (!v) return v;
    const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[2]}/${m[3]}/${m[1]}` : v;
  },
};

// Recognise an exported raw script body as a known whitelisted transform.
// This is pattern matching against known-safe shapes, not evaluation.
function matchScript(scriptBody) {
  if (!scriptBody) return null;
  const s = String(scriptBody).replace(/\s+/g, ' ');
  if (/\(\\?d\{2\}\)\\?\/\(\\?d\{2\}\)\\?\/\(\\?d\{4\}\)/.test(s) && /m\[3\].*m\[1\].*m\[2\]/.test(s)) return 'mdy_to_iso';
  if (/\(\\?d\{4\}\)-\(\\?d\{2\}\)-\(\\?d\{2\}\)/.test(s) && /m\[2\].*m\[3\].*m\[1\]/.test(s)) return 'iso_to_mdy';
  if (/toUpperCase\(\)/.test(s) && !/toLowerCase/.test(s)) return 'uppercase';
  if (/toLowerCase\(\)/.test(s) && !/toUpperCase/.test(s)) return 'lowercase';
  if (/replace\(\/\\D\/g/.test(s)) return 'digits_only';
  if (/^\s*return\s+String\(value\)\.trim\(\)/.test(s)) return 'trim';
  return null;
}

export function parseConfig(config) {
  if (!config) return {};
  if (typeof config === 'object') return config;
  try { return JSON.parse(config); } catch { return {}; }
}

export function getField(ctx, key) {
  if (!key) return undefined;
  if (ctx.record[key] !== undefined) return ctx.record[key];
  if (ctx.record.custom_fields && ctx.record.custom_fields[key] !== undefined) return ctx.record.custom_fields[key];
  if (ctx.calculated[key] !== undefined) return ctx.calculated[key];
  return undefined;
}

export function interpolate(template, ctx) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{\s*([\w .-]+)\s*\}\}/g, (_, key) => {
    const v = getField(ctx, key.trim());
    return v === undefined || v === null ? '' : String(v);
  });
}

// Evaluates the exported nested condition tree: a node is either
// { type:'group', match:'all'|'any', children:[...] } or
// { type:'condition', field, operator, value }.
function evalNode(node, ctx) {
  if (!node) return true;
  if (node.type === 'group' || Array.isArray(node.children)) {
    const children = node.children || [];
    if (children.length === 0) return true;
    const results = children.map((c) => evalNode(c, ctx));
    return (node.match || 'all').toLowerCase() === 'any' ? results.some(Boolean) : results.every(Boolean);
  }
  const op = OPERATORS[node.operator];
  if (!op) return false;
  return !!op(getField(ctx, node.field), node.value);
}

function parseDate(value, format) {
  if (!value) return null;
  const raw = String(value).trim();
  // Explicit MM/DD/YYYY handling — Date() parses this inconsistently.
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) {
    const [, a, b, y] = mdy;
    const isDMY = String(format || '').toUpperCase().startsWith('DD');
    const month = isDMY ? Number(b) : Number(a);
    const day = isDMY ? Number(a) : Number(b);
    const d = new Date(Number(y), month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function runTransform(field, ctx) {
  const input = getField(ctx, field.input_field);
  const cfg = parseConfig(field.config);
  try {
    switch (field.transform_type) {
      case 'clone':
        return { output: input ?? null, matched: 'clone', error: null };

      case 'value_map': {
        const map = cfg.map || {};
        if (Object.prototype.hasOwnProperty.call(map, input)) {
          return { output: map[input], matched: `exact:${input}`, error: null };
        }
        // Second pass: normalised case-insensitive / trimmed lookup.
        const target = norm(input);
        const hit = Object.keys(map).find((k) => norm(k) === target);
        if (hit) return { output: map[hit], matched: `normalized:${hit}`, error: null };
        return { output: cfg.default ?? null, matched: 'default', error: null };
      }

      case 'date_age_bucket': {
        const d = parseDate(input, cfg.date_format);
        if (!d) return { output: cfg.fallback ?? null, matched: 'unparseable_date', error: input ? `Could not parse "${input}" as a date` : null };
        const ageDays = Math.floor((Date.now() - d.getTime()) / 86400000);
        const buckets = [...(cfg.buckets || [])].sort((a, b) => a.max_days - b.max_days);
        const hit = buckets.find((b) => ageDays <= b.max_days);
        if (hit) return { output: hit.label ?? hit.value ?? null, matched: `bucket<=${hit.max_days}d (age=${ageDays}d)`, error: null };
        return { output: cfg.fallback ?? null, matched: `fallback (age=${ageDays}d)`, error: null };
      }

      case 'conditional': {
        const rules = cfg.rules || cfg.rule_groups || [];
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          const conditions = rule.conditions || rule;
          if (evalNode(conditions, ctx)) {
            const name = conditions?.name ? `${conditions.name}` : `rule[${i}]`;
            return { output: interpolate(rule.output, ctx), matched: name, error: null };
          }
        }
        return { output: interpolate(cfg.fallback ?? cfg.fallback_template ?? null, ctx), matched: 'fallback', error: null };
      }

      case 'script': {
        const explicit = cfg.whitelisted_transform;
        const key = explicit || matchScript(cfg.script);
        const fn = WHITELISTED_SCRIPTS[key];
        if (!fn) {
          return {
            output: input ?? null, matched: 'unrecognized_script',
            error: 'Script did not match a supported transform, so the original value was passed through unchanged. Supported: ' + Object.keys(WHITELISTED_SCRIPTS).join(', '),
          };
        }
        return { output: fn(input), matched: `script:${key}`, error: null };
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
  const byToken = new Map(fields.map((f) => [f.output_token, f]));
  const remaining = new Set(fields.map((f) => f.output_token));
  const ordered = [];
  let cycleDetected = false;
  let guard = fields.length + 1;

  while (remaining.size > 0 && guard-- > 0) {
    const ready = [...remaining]
      .map((t) => byToken.get(t))
      .filter((f) => (f.depends_on || []).every((dep) => !remaining.has(dep) || !byToken.has(dep)))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (ready.length === 0) { cycleDetected = true; break; }
    for (const f of ready) { ordered.push(f); remaining.delete(f.output_token); }
  }
  if (remaining.size > 0) {
    const rest = [...remaining].map((t) => byToken.get(t)).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    ordered.push(...rest);
  }
  return { ordered, cycleDetected };
}

export function runCalculatedFieldsInline(record, defs) {
  const enabled = (defs || []).filter((f) => f.enabled !== false && f.output_token);
  const { ordered, cycleDetected } = orderFields(enabled);
  const ctx = { record, calculated: { ...(record.calculated_fields || {}) } };
  const trace = [];
  for (const field of ordered) {
    const started = Date.now();
    const inputValue = getField(ctx, field.input_field);
    const { output, matched, error } = runTransform(field, ctx);
    ctx.calculated[field.output_token] = output;
    trace.push({
      token: field.output_token, label: field.output_label, input_field: field.input_field,
      input_value: inputValue ?? null, matched, output,
      duration_ms: Date.now() - started, error,
    });
  }
  return { calculated: ctx.calculated, trace, cycleDetected };
}
