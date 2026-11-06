import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PARTICIPATING_ATTORNEYS } from "@/lib/partnersData";

/**
 * Searchable, state-filterable directory of participating attorneys.
 * The list itself lives in src/lib/partnersData.js.
 */
export default function AttorneyDirectory() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("All states");

  const states = useMemo(() => {
    const set = new Set();
    PARTICIPATING_ATTORNEYS.forEach((a) => {
      const parts = a.location.split(",");
      set.add(parts[parts.length - 1].trim());
    });
    return ["All states", ...Array.from(set).sort()];
  }, []);

  const needle = q.trim().toLowerCase();
  const visible = PARTICIPATING_ATTORNEYS.filter((a) => {
    const inText =
      !needle || a.name.toLowerCase().includes(needle) || a.location.toLowerCase().includes(needle);
    const inState = state === "All states" || a.location.endsWith(state);
    return inText && inState;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or city"
            aria-label="Search participating attorneys"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="Filter by state"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-56"
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Showing {visible.length} of {PARTICIPATING_ATTORNEYS.length}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a, i) => (
            <li key={`${a.name}-${a.location}-${i}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-navy">{a.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">Office Location: {a.location}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No matches. Try a different name, city, or state.
        </p>
      )}
    </div>
  );
}