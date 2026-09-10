// Authoring-time compliance enforcement for MVA / personal-injury content.
//
// This is a real gate, not decoration: Blog Manager blocks publishing while
// flags remain, and News & Insights blocks promoting a flagged signal into a
// draft. The rules are legal-advertising bright lines for the vertical —
// guaranteeing outcomes, promising amounts, implying an attorney-client
// relationship, or posing as a government/insurer body.

// Defaults used when no BlogInstructions record has been configured yet.
// Stored patterns from BlogInstructions.banned_patterns are merged on top.
export const DEFAULT_BANNED_PATTERNS = [
  { pattern: 'guarantee', reason: 'Outcome guarantees are prohibited in legal advertising.' },
  { pattern: 'guaranteed', reason: 'Outcome guarantees are prohibited in legal advertising.' },
  { pattern: 'you will win', reason: 'Predicting a case outcome is prohibited.' },
  { pattern: 'we will win', reason: 'Predicting a case outcome is prohibited.' },
  { pattern: 'risk free', reason: 'Implies no cost or downside; unsubstantiated.' },
  { pattern: 'risk-free', reason: 'Implies no cost or downside; unsubstantiated.' },
  { pattern: 'no win no fee', reason: 'Fee-arrangement claims require jurisdiction-specific disclaimers.' },
  { pattern: 'get you paid', reason: 'Promises a payout.' },
  { pattern: 'you are entitled to', reason: 'Asserts legal entitlement; only an attorney can assess a claim.' },
  { pattern: "you're entitled to", reason: 'Asserts legal entitlement; only an attorney can assess a claim.' },
  { pattern: 'your case is worth', reason: 'States a case valuation as fact.' },
  { pattern: 'we are lawyers', reason: 'This is not a law firm and must never imply it is.' },
  { pattern: 'we are attorneys', reason: 'This is not a law firm and must never imply it is.' },
  { pattern: 'our attorneys', reason: 'Implies an in-house legal team and an attorney-client relationship.' },
  { pattern: 'our lawyers', reason: 'Implies an in-house legal team and an attorney-client relationship.' },
  { pattern: 'legal advice', reason: 'This service does not provide legal advice.' },
  { pattern: 'government program', reason: 'Must never imply government affiliation.' },
  { pattern: 'government approved', reason: 'Must never imply government endorsement.' },
  { pattern: 'settlement fund', reason: 'Implies an existing fund the reader can claim from.' },
  { pattern: 'act now or lose', reason: 'Manufactured urgency around legal rights.' },
  { pattern: 'claim your money', reason: 'Implies money is already owed and waiting.' },
  { pattern: 'pre-approved', reason: 'Implies a claim has been assessed and accepted.' },
  { pattern: 'instant payout', reason: 'Promises immediate payment.' },
  { pattern: 'cash advance', reason: 'Lending/advance claims carry separate regulatory obligations.' },
];

// A dollar figure paired with claim language reads as a promised amount.
const AMOUNT_PROMISE = /\$\s?[\d,]+(?:[.,]\d+)?\s*(?:k|m|million|thousand)?\s*(?:settlement|payout|compensation|guaranteed|or more|minimum|average)/i;
const AMOUNT_PROMISE_REVERSE = /(?:get|receive|win|recover|entitled to|worth)\s+(?:up to\s+)?\$\s?[\d,]+/i;

function normalizePatterns(stored) {
  const extra = (stored || []).map((p) =>
    typeof p === 'string' ? { pattern: p, reason: 'Configured banned phrase.' } : p
  ).filter((p) => p && p.pattern);
  return [...DEFAULT_BANNED_PATTERNS, ...extra];
}

function contextAround(text, index, length) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return (start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '…' : '');
}

/**
 * Scan text for compliance violations.
 * Returns [{ phrase, reason, context }] — empty means clean.
 */
export function checkCompliance(text, storedPatterns) {
  if (!text) return [];
  const haystack = String(text);
  const lower = haystack.toLowerCase();
  const flags = [];

  for (const { pattern, reason } of normalizePatterns(storedPatterns)) {
    const needle = String(pattern).toLowerCase();
    let from = 0;
    for (;;) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      flags.push({ phrase: pattern, reason, context: contextAround(haystack, idx, needle.length) });
      from = idx + needle.length;
      break; // one flag per phrase is enough to block; don't spam duplicates
    }
  }

  for (const rx of [AMOUNT_PROMISE, AMOUNT_PROMISE_REVERSE]) {
    const m = haystack.match(rx);
    if (m) {
      flags.push({
        phrase: m[0].trim(),
        reason: 'Reads as a promised or typical compensation amount. Results depend entirely on the facts of each case.',
        context: contextAround(haystack, m.index ?? 0, m[0].length),
      });
    }
  }

  return flags;
}

/** Convenience: scan several fields at once (title, excerpt, body, ...). */
export function checkFields(fields, storedPatterns) {
  const all = [];
  for (const [label, value] of Object.entries(fields || {})) {
    for (const flag of checkCompliance(value, storedPatterns)) {
      all.push({ ...flag, field: label });
    }
  }
  return all;
}

export function readingTimeMinutes(body) {
  const words = String(body || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
