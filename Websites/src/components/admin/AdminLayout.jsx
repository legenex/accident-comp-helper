import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, Globe, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Mark } from '@/components/site/Logo';
import { A } from '@/lib/admin-ds';
import { PRIMARY_NAV, NAV_GROUPS, findNavItem, breadcrumbsFor, normalizeRole } from '@/lib/admin-nav';
import { CollapsibleGroup } from '@/components/admin/ui';

const GROUP_STORAGE_KEY = 'ach_admin_nav_groups';

function readGroupState() {
  try {
    const raw = localStorage.getItem(GROUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function writeGroupState(state) {
  try { localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(state)); } catch { /* private browsing */ }
}

function NavLink({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={item.label}
      className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      style={{
        color: active ? A.gold : A.textMuted,
        background: active ? 'rgba(214,162,60,0.09)' : 'transparent',
      }}
    >
      {active && <span className="absolute -left-3 top-0 h-full w-[3px] rounded-r" style={{ background: A.gold }} />}
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout({ breadcrumbs, children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [groupState, setGroupState] = useState(readGroupState);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const activeEntry = useMemo(() => findNavItem(location.pathname), [location.pathname]);
  const role = normalizeRole(user?.role);

  // Auto-expand the group containing the current route.
  useEffect(() => {
    if (activeEntry?.group) {
      setGroupState((prev) => {
        if (prev[activeEntry.group.id]) return prev;
        const next = { ...prev, [activeEntry.group.id]: true };
        writeGroupState(next);
        return next;
      });
    }
  }, [activeEntry]);

  const toggleGroup = (id) => {
    setGroupState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeGroupState(next);
      return next;
    });
  };

  const visiblePrimary = PRIMARY_NAV.filter((i) => (i.roles || []).includes(role) || role === 'owner');
  const visibleGroups = NAV_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => (i.roles || []).includes(role) || role === 'owner') }))
    .filter((g) => g.items.length > 0);

  const crumbs = breadcrumbs || breadcrumbsFor(location.pathname);
  const handleLogout = () => base44.auth.logout(window.location.origin);

  const SidebarInner = (
    <div className="flex h-full flex-col" style={{ background: A.sidebar }}>
      <Link to="/admin" className="flex flex-shrink-0 items-center gap-2.5 px-4 py-4" style={{ borderBottom: `1px solid ${A.line}` }}>
        <Mark className="h-8 w-8 flex-shrink-0" />
        <div className="leading-tight">
          <div className="font-heading text-sm font-bold" style={{ color: A.text }}>Accident Compensation</div>
          <div className="text-[11px]" style={{ color: A.textFaint }}>Admin</div>
        </div>
      </Link>

      <a href="/" target="_blank" rel="noopener noreferrer" className="flex flex-shrink-0 items-center gap-2 px-4 py-2.5 text-xs" style={{ color: A.textFaint, borderBottom: `1px solid ${A.line}` }}>
        <Globe className="h-3.5 w-3.5" /> View Public Site
      </a>

      <nav className="admin-scroll flex-1 space-y-4 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {visiblePrimary.map((item) => (
            <NavLink key={item.path} item={item} active={activeEntry?.path === item.path} onClick={() => setMobileOpen(false)} />
          ))}
        </div>
        {visibleGroups.map((group) => (
          <CollapsibleGroup key={group.id} label={group.label} icon={group.icon} open={!!groupState[group.id]} onToggle={() => toggleGroup(group.id)}>
            {group.items.map((item) => (
              <NavLink key={item.path} item={item} active={activeEntry?.path === item.path} onClick={() => setMobileOpen(false)} />
            ))}
          </CollapsibleGroup>
        ))}
      </nav>

      <div className="flex-shrink-0 p-3" style={{ borderTop: `1px solid ${A.line}` }}>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: A.teal, color: '#fff' }}>
            {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold" style={{ color: A.text }}>{user?.full_name || user?.email || 'Loading…'}</div>
            <div className="text-[11px] lowercase" style={{ color: A.textFaint }}>{role}</div>
          </div>
          <button onClick={handleLogout} title="Log out" style={{ color: A.textFaint }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 px-2 text-[10px]" style={{ color: A.textFaint }}>© {new Date().getFullYear()} Accident Compensation Helper</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: A.bg, color: A.text }}>
      <aside className="hidden flex-shrink-0 lg:block" style={{ width: 256, borderRight: `1px solid ${A.line}` }}>
        {SidebarInner}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] flex lg:hidden">
          <div style={{ width: 256, borderRight: `1px solid ${A.line}` }}>{SidebarInner}</div>
          <div className="flex-1" style={{ background: 'rgba(3,8,10,0.6)' }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between px-4 py-3" style={{ background: A.bg, borderBottom: `1px solid ${A.line}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 lg:hidden" style={{ color: A.textMuted }} title="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs" style={{ color: A.textMuted }}>
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" style={{ color: A.textFaint }} />}
                    {c.href ? <Link to={c.href} className="hover:underline">{c.label}</Link> : <span style={{ color: i === crumbs.length - 1 ? A.text : A.textMuted }}>{c.label}</span>}
                  </span>
                ))}
              </nav>
            </div>
          </div>
          <Link to="/" className="lg:hidden">
            <Mark className="h-7 w-7" />
          </Link>
        </header>
        <main className="admin-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full" style={{ maxWidth: 1600 }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
