import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }) {
  return <div className={cn("rounded-xl border border-navyline bg-panel p-5", className)}>{children}</div>;
}

export function Pill({ status, children, tone = "neutral" }) {
  const tones = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
    neutral: "bg-white/10 text-admuted",
    blue: "bg-brand/15 text-brand",
    purple: "bg-purple-500/15 text-purple-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-success": tone === "success",
        "bg-warning": tone === "warning",
        "bg-destructive": tone === "danger",
        "bg-admuted": tone === "neutral",
        "bg-brand": tone === "blue",
        "bg-purple-400": tone === "purple",
      })} />
      {children || status}
    </span>
  );
}

export function AdminButton({ children, variant = "primary", className, ...props }) {
  const variants = {
    primary: "bg-brand hover:bg-brand-hover text-white",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-navyline",
    ghost: "hover:bg-white/5 text-admuted hover:text-white",
    danger: "bg-destructive/90 hover:bg-destructive text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
  };
  return (
    <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all", variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function AdminInput({ className, ...props }) {
  return (
    <input
      className={cn("w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white placeholder-admuted/60 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40", className)}
      {...props}
    />
  );
}

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg border border-navyline bg-navy/60 px-3 py-2 min-w-[180px]">
      <svg className="h-4 w-4 text-admuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-white placeholder-admuted/60 outline-none" />
    </div>
  );
}

export function Select({ value, onChange, options, className }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={cn("rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand", className)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navyline bg-panel/40 px-6 py-16 text-center">
      {Icon && <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-admuted"><Icon className="h-5 w-5" /></div>}
      <h3 className="mt-4 font-heading text-base font-bold text-white">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-admuted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full rounded-2xl border border-navyline bg-navy p-6 shadow-2xl", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-admuted hover:bg-white/10 hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-admuted">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-admuted/70">{hint}</p>}
    </div>
  );
}