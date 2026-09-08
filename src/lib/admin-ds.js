// Admin design system tokens — single source of truth for admin colour.
// No admin component may hardcode a colour. If you need one, it comes from `A`.
// Re-themed for Accident Compensation Helper: brand blue #028CC9 (confirmed from
// logo pixels) as `teal` (action / affirmative), plus a complementary warm gold
// as `gold` (highest emphasis / "you are here"). Everything else is structural
// and kept as-is per the design system.

export const A = {
  // Surfaces, darkest to lightest
  bg: '#070F13',
  surface: '#0D1A20',
  surface2: '#122430',
  surface3: '#17303C',
  sidebar: '#050C0F',

  // Lines
  line: 'rgba(148,180,190,0.14)',
  lineStrong: 'rgba(148,180,190,0.26)',

  // Text, by descending emphasis
  text: '#E8F1EF',
  textMuted: '#93AAB2',
  textFaint: '#5E7681',

  // Brand accents — Accident Compensation Helper
  teal: '#028CC9',
  tealBright: '#2FA8DE',
  gold: '#D6A23C',
  goldSoft: '#E8C578',

  // Semantic (hues carry meaning, never change these)
  danger: '#E5534B', dangerBg: 'rgba(229,83,75,0.12)',
  success: '#3FB950', successBg: 'rgba(63,185,80,0.12)',
  warning: '#D6A234', warningBg: 'rgba(214,162,52,0.12)',
  info: '#58A6FF', infoBg: 'rgba(88,166,255,0.12)',

  radius: '10px',
  radiusLg: '14px',
};

// Status string -> tone. toneFor() lowercases + underscores, looks up, and
// defaults to 'neutral' rather than crashing or rendering invisibly.
export const STATUS_TONE = {
  active: 'success', published: 'success', success: 'success',
  connected: 'success', ready: 'success', enabled: 'success',
  qualified: 'success', sold: 'success', delivered: 'success', sent: 'success',

  draft: 'neutral', archived: 'neutral', hidden: 'neutral',
  inactive: 'neutral', disabled: 'neutral', not_configured: 'neutral',
  skipped: 'neutral', queued: 'neutral', not_tracked: 'neutral',

  review: 'warning', scheduled: 'warning', pending: 'warning',
  retrying: 'warning', generating: 'warning', soft_dq: 'warning',
  unsold: 'warning', open: 'warning', escalated: 'warning',

  failed: 'danger', error: 'danger', hard_dq: 'danger',
  disqualified: 'danger', rejected: 'danger', returned: 'danger',
};

export function toneFor(status) {
  if (!status && status !== 0) return 'neutral';
  const key = String(status).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return STATUS_TONE[key] || 'neutral';
}

// Resolve a tone name to its {fg,bg,border} colour triple from `A`.
export function toneColors(tone) {
  switch (tone) {
    case 'success': return { fg: A.success, bg: A.successBg, border: 'rgba(63,185,80,0.3)' };
    case 'warning': return { fg: A.warning, bg: A.warningBg, border: 'rgba(214,162,52,0.3)' };
    case 'danger': return { fg: A.danger, bg: A.dangerBg, border: 'rgba(229,83,75,0.3)' };
    case 'info': return { fg: A.info, bg: A.infoBg, border: 'rgba(88,166,255,0.3)' };
    case 'brand': return { fg: A.teal, bg: 'rgba(2,140,201,0.12)', border: 'rgba(2,140,201,0.3)' };
    case 'neutral':
    default: return { fg: A.textMuted, bg: 'rgba(148,180,190,0.1)', border: A.line };
  }
}
