// Shared admin component library — 22 primitives. No admin page may define
// its own button, input, table or modal. If something is missing, add it
// here. Every colour comes from `A` in admin-ds.js; no hex is hardcoded in
// any page component.
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { A, toneFor, toneColors } from '@/lib/admin-ds';
import { ChevronRight, ChevronDown, Search, X, AlertTriangle, RotateCw, Inbox } from 'lucide-react';

/* ---------------------------------- 1. PageHeader ---------------------------------- */
export function PageHeader({ title, description, actions, children }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight" style={{ color: A.text }}>{title}</h1>
          {description && <p className="mt-1 text-sm" style={{ color: A.textMuted }}>{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* -------------------------------- 2. SectionTitle -------------------------------- */
export function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: A.textMuted }}>{children}</h2>
      {hint && <span className="text-[11px]" style={{ color: A.textFaint }}>{hint}</span>}
    </div>
  );
}

/* ------------------------------------ 3. Panel ------------------------------------ */
export function Panel({ title, actions, padded = true, className, children }) {
  return (
    <div className="overflow-hidden" style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: A.radiusLg }}>
      {(title || actions) && (
        <div className="flex items-center justify-between" style={{ borderBottom: `1px solid ${A.line}`, padding: '12px 16px' }}>
          {title && <h3 className="text-sm font-semibold" style={{ color: A.text }}>{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(padded && 'p-4', className)}>{children}</div>
    </div>
  );
}

/* ------------------------------------ 4. Button ----------------------------------- */
const BUTTON_VARIANTS = {
  gold: { background: A.gold, color: '#101617', border: `1px solid ${A.gold}` },
  primary: { background: A.teal, color: '#ffffff', border: `1px solid ${A.teal}` },
  secondary: { background: A.surface2, color: A.text, border: `1px solid ${A.lineStrong}` },
  ghost: { background: 'transparent', color: A.textMuted, border: '1px solid transparent' },
  danger: { background: A.dangerBg, color: A.danger, border: `1px solid ${A.danger}55` },
};
const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};
export function Button({ variant = 'secondary', size = 'md', icon: Icon, loading, disabled, disabledReason, className, children, ...props }) {
  const isDisabled = disabled || loading;
  const style = { ...BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.secondary, borderRadius: A.radius };
  return (
    <button
      {...props}
      disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : props.title}
      style={{ ...style, opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
      className={cn('inline-flex items-center justify-center font-semibold transition-opacity hover:opacity-90', BUTTON_SIZES[size], className)}
    >
      {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

/* --------------------------------- 5. StatusBadge --------------------------------- */
export function StatusBadge({ status, label, tone }) {
  const t = tone || toneFor(status);
  const c = toneColors(t);
  const text = label ?? status ?? 'unknown';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.fg }} />
      {String(text).replace(/_/g, ' ')}
    </span>
  );
}

/* ------------------------------------ 6. Pill ------------------------------------- */
export function Pill({ children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px]', className)} style={{ background: A.surface2, color: A.goldSoft, border: `1px solid ${A.line}` }}>
      {children}
    </span>
  );
}

/* --------------------------------- shared input shell ------------------------------ */
function InputShell({ label, hint, error, children }) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-medium" style={{ color: A.textMuted }}>{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-[11px]" style={{ color: A.textFaint }}>{hint}</p>}
      {error && <p className="mt-1 text-[11px]" style={{ color: A.danger }}>{error}</p>}
    </div>
  );
}
const fieldStyle = { background: A.surface2, border: `1px solid ${A.lineStrong}`, color: A.text, borderRadius: A.radius };

/* ------------------------------- 7/8/9. Text inputs -------------------------------- */
export function TextInput({ label, hint, error, className, ...props }) {
  return (
    <InputShell label={label} hint={hint} error={error}>
      <input {...props} style={fieldStyle} className={cn('h-9 w-full px-3 text-sm outline-none placeholder:text-current', className)} />
    </InputShell>
  );
}
export function TextArea({ label, hint, error, className, rows = 4, ...props }) {
  return (
    <InputShell label={label} hint={hint} error={error}>
      <textarea {...props} rows={rows} style={fieldStyle} className={cn('w-full px-3 py-2 text-sm outline-none', className)} />
    </InputShell>
  );
}
export function SelectInput({ label, hint, error, options = [], className, ...props }) {
  return (
    <InputShell label={label} hint={hint} error={error}>
      <select {...props} style={fieldStyle} className={cn('h-9 w-full px-3 text-sm outline-none', className)}>
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </InputShell>
  );
}

/* -------------------------------- 10. SearchInput ---------------------------------- */
export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('flex h-9 items-center gap-2 px-3', className)} style={{ ...fieldStyle }}>
      <Search className="h-4 w-4 flex-shrink-0" style={{ color: A.textFaint }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none" style={{ color: A.text }} />
      {value ? (
        <button onClick={() => onChange('')} title="Clear search" className="flex-shrink-0" style={{ color: A.textFaint }}>
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------ 11. Toggle ----------------------------------- */
export function Toggle({ checked, onChange, disabled, disabledReason, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      title={disabled ? disabledReason : label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ background: checked ? A.teal : A.surface2, border: `1px solid ${checked ? A.teal : A.lineStrong}`, opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors"
    >
      <span className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
}

/* ------------------------------------- 12. Tabs ------------------------------------ */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto" style={{ borderBottom: `1px solid ${A.line}` }}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className="relative flex-shrink-0 px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: active ? A.gold : A.textMuted }}
          >
            {t.label}{typeof t.count === 'number' && <span className="ml-1.5 text-xs" style={{ color: A.textFaint }}>{t.count}</span>}
            {active && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: A.gold }} />}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- 13. LoadingState -------------------------------- */
export function LoadingState({ rows = 5, label = 'Loading' }) {
  return (
    <div role="status" aria-label={label} className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 w-full animate-pulse" style={{ background: A.surface2, borderRadius: A.radius }} />
      ))}
    </div>
  );
}

/* --------------------------------- 14. EmptyState ---------------------------------- */
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: A.surface2, color: A.textFaint }}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold" style={{ color: A.text }}>{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm" style={{ color: A.textMuted }}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------------------------- 15. ErrorState ---------------------------------- */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: A.dangerBg, color: A.danger }}>
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold" style={{ color: A.text }}>Something failed</h3>
      <p className="mt-1.5 max-w-sm text-sm" style={{ color: A.textMuted }}>{message}</p>
      {onRetry && <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry} className="mt-5">Retry</Button>}
    </div>
  );
}

/* -------------------------------- 16. NotConfigured -------------------------------- */
export function NotConfigured({ title = 'Not configured', description, settingsHref, settingsLabel = 'Go to settings' }) {
  return (
    <div className="flex flex-col items-start gap-2 p-4" style={{ background: A.warningBg, border: `1px solid ${A.warning}44`, borderRadius: A.radiusLg }}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" style={{ color: A.warning }} />
        <h4 className="text-sm font-semibold" style={{ color: A.warning }}>{title}</h4>
      </div>
      {description && <p className="text-sm" style={{ color: A.textMuted }}>{description}</p>}
      {settingsHref && <a href={settingsHref} className="text-sm font-medium underline" style={{ color: A.warning }}>{settingsLabel}</a>}
    </div>
  );
}

/* ----------------------------------- 17. DataTable ---------------------------------- */
// Owns its own loading / error / empty rendering. A page passes loading,
// error, onRetry and an `empty` node and never branches on those states itself.
export function DataTable({ columns, rows, loading, error, onRetry, empty, onRowClick, rowKey = 'id' }) {
  if (loading) return <LoadingState label="Loading table rows" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0) return empty || <EmptyState title="Nothing here yet" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${A.line}` }}>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider', col.className)} style={{ color: A.textFaint }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ borderBottom: `1px solid ${A.line}`, cursor: onRowClick ? 'pointer' : 'default' }}
              className={onRowClick ? 'transition-colors hover:bg-white/[0.03]' : undefined}
            >
              {columns.map((col) => {
                const val = col.render ? col.render(row) : row[col.key];
                const isEmpty = val === null || val === undefined || val === '';
                return (
                  <td key={col.key} className={cn('px-3 py-2.5 tabular-nums', col.className)} style={{ color: isEmpty ? A.textFaint : A.text }}>
                    {isEmpty ? '—' : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------- 18. Pagination ---------------------------------- */
export function Pagination({ page, pageSize, total, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = end < total;
  return (
    <div className="flex items-center justify-between px-1 py-3 text-xs" style={{ color: A.textMuted }}>
      <span>{total === 0 ? 'No results' : `${start}–${end} of ${total}`}</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>Prev</Button>
        <Button variant="secondary" size="sm" disabled={!canNext} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

/* ------------------------------------- 19. Modal ------------------------------------ */
export function Modal({ open, onClose, title, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(3,8,10,0.7)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div className={cn('relative flex max-h-[85vh] w-full flex-col', wide ? 'max-w-2xl' : 'max-w-md')} style={{ background: A.surface, border: `1px solid ${A.lineStrong}`, borderRadius: A.radiusLg }}>
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${A.line}` }}>
          <h3 className="text-base font-semibold" style={{ color: A.text }}>{title}</h3>
          <button onClick={onClose} title="Close" className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ color: A.textFaint }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="admin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-shrink-0 items-center justify-end gap-2 px-5 py-4" style={{ borderTop: `1px solid ${A.line}` }}>{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------- 20. ConfirmDialog -------------------------------- */
// Destructive confirmation. `consequence` must name the actual effect, e.g.
// "Any webhook mapping that references this token will stop receiving a value."
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', consequence, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }>
      <p className="text-sm" style={{ color: A.textMuted }}>{consequence}</p>
    </Modal>
  );
}

/* ------------------------------------ 21. StatCard ---------------------------------- */
export function StatCard({ label, value, sub, tone = 'neutral', icon: Icon, onClick }) {
  const c = toneColors(tone);
  return (
    <div
      onClick={onClick}
      className={cn('flex items-start justify-between p-4', onClick && 'cursor-pointer transition-transform hover:-translate-y-0.5')}
      style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: A.radiusLg }}
    >
      <div>
        <div className="text-xs font-medium" style={{ color: A.textMuted }}>{label}</div>
        <div className="mt-1.5 font-heading text-2xl font-semibold tabular-nums" style={{ color: A.text }}>{value}</div>
        {sub && <div className="mt-1 text-xs" style={{ color: A.textFaint }}>{sub}</div>}
      </div>
      {Icon && (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: c.bg, color: c.fg }}>
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ 22. FieldRow ---------------------------------- */
export function FieldRow({ label, value, wide }) {
  const isEmpty = value === null || value === undefined || value === '';
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2', wide && 'flex-col gap-1')} style={{ borderBottom: `1px solid ${A.line}` }}>
      <span className="flex-shrink-0 text-xs font-medium" style={{ color: A.textMuted }}>{label}</span>
      <span className={cn('text-sm', wide ? '' : 'text-right')} style={{ color: isEmpty ? A.textFaint : A.text }}>{isEmpty ? '—' : value}</span>
    </div>
  );
}

/* ------------------------------ collapsible group (layout helper) ------------------- */
export function CollapsibleGroup({ label, icon: Icon, open, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: A.textFaint }}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}
