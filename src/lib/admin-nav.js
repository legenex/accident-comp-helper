// Single source of truth for admin navigation. The sidebar, the breadcrumbs
// and the route guard all read this file. Adding a page means adding one
// entry here and one <Route> in App.jsx. Menu markup is never hardcoded
// anywhere else.
import {
  LayoutDashboard, Users2, FileText, BarChart2, BookOpen, ListChecks,
  Layout, Newspaper, Bot, Rss, Wrench, Settings, Beaker, Palette,
} from 'lucide-react';

export const ROLES = ['owner', 'admin', 'editor', 'analyst'];

// Primary (flat, in this order)
export const PRIMARY_NAV = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, roles: ['owner', 'admin', 'editor', 'analyst'] },
  { label: 'Leads', path: '/admin/leads', icon: Users2, roles: ['owner', 'admin', 'editor', 'analyst'] },
  { label: 'Pages', path: '/admin/pages', icon: FileText, roles: ['owner', 'admin', 'editor'] },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2, roles: ['owner', 'admin', 'analyst'] },
  { label: 'Blog Manager', path: '/admin/blog', icon: BookOpen, roles: ['owner', 'admin', 'editor'] },
  { label: 'Surveys', path: '/admin/surveys', icon: ListChecks, roles: ['owner', 'admin', 'editor'] },
  { label: 'Landing Pages', path: '/admin/landing-pages', icon: Layout, roles: ['owner', 'admin', 'editor'] },
  { label: 'Advertorials', path: '/admin/advertorials', icon: Newspaper, roles: ['owner', 'admin', 'editor'] },
  { label: 'Bot', path: '/admin/claimbot', icon: Bot, roles: ['owner', 'admin', 'editor'] },
  { label: 'News & Insights', path: '/admin/news-insights', icon: Rss, roles: ['owner', 'admin', 'editor'] },
];

// Groups (collapsible, below primary)
export const NAV_GROUPS = [
  {
    id: 'tools', label: 'Tools', icon: Wrench,
    items: [
      { label: 'Calculated Fields', path: '/admin/tools/calculated-fields', roles: ['owner', 'admin'] },
      { label: 'Webhooks', path: '/admin/tools/webhooks', roles: ['owner', 'admin'] },
      { label: 'Custom Fields', path: '/admin/tools/custom-fields', roles: ['owner', 'admin'] },
      { label: 'Contact Forms', path: '/admin/tools/contact-forms', roles: ['owner', 'admin', 'editor'] },
      { label: 'Completion Routing', path: '/admin/tools/completion-routing', roles: ['owner', 'admin'] },
      // Kept from the previous panel — not part of the portable spec but a
      // real, working feature. Never deleted, just relocated in the nav.
      { label: 'Experiments', path: '/admin/experiments', icon: Beaker, roles: ['owner', 'admin', 'editor'] },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: Settings,
    items: [
      { label: 'General', path: '/admin/settings/general', roles: ['owner', 'admin'] },
      { label: 'Users', path: '/admin/settings/users', roles: ['owner', 'admin'] },
      { label: 'SEO', path: '/admin/settings/seo', roles: ['owner', 'admin', 'editor'] },
      { label: 'Integrations', path: '/admin/settings/integrations', roles: ['owner', 'admin'] },
      { label: 'Tracking', path: '/admin/settings/tracking', roles: ['owner', 'admin'] },
      { label: 'Bot Settings', path: '/admin/settings/bot', roles: ['owner', 'admin'] },
      { label: 'Knowledge Base', path: '/admin/settings/knowledge-base', roles: ['owner', 'admin', 'editor'] },
      // Kept from the previous panel, same reasoning as Experiments above.
      { label: 'Themes', path: '/admin/themes', icon: Palette, roles: ['owner', 'admin'] },
    ],
  },
];

// Old URL -> new home. Rendered as <Navigate replace> so bookmarks survive.
export const ROUTE_REDIRECTS = {
  '/admin/seo': '/admin/settings/seo',
  '/admin/users': '/admin/settings/users',
  '/admin/integrations': '/admin/settings/integrations',
  '/admin/settings': '/admin/settings/general',
  '/admin/signals': '/admin/news-insights',
};

function normalizeRole(role) {
  const r = (role || '').toLowerCase();
  if (ROLES.includes(r)) return r;
  // Legacy User.role values from before the role model existed.
  if (r === 'user') return 'analyst';
  if (r === 'admin') return 'admin';
  return 'analyst';
}

// Flatten primary + group items into one list of { label, path, roles, group }
function allEntries() {
  const out = PRIMARY_NAV.map((i) => ({ ...i, group: null }));
  for (const g of NAV_GROUPS) {
    for (const item of g.items) out.push({ ...item, group: g });
  }
  return out;
}

// Longest-prefix match so /admin/leads/abc keeps /admin/leads highlighted.
// The root path is matched exactly, otherwise it would highlight everywhere.
export function findNavItem(pathname) {
  const entries = allEntries();
  let best = null;
  for (const entry of entries) {
    if (entry.path === '/admin') {
      if (pathname === '/admin') { best = entry; }
      continue;
    }
    if (pathname === entry.path || pathname.startsWith(entry.path + '/')) {
      if (!best || entry.path.length > best.path.length) best = entry;
    }
  }
  return best;
}

// Admin / [Group] / [Page]. Group crumbs are not links (a group has no page
// of its own). The last crumb is not a link.
export function breadcrumbsFor(pathname) {
  const crumbs = [{ label: 'Admin', href: '/admin' }];
  const entry = findNavItem(pathname);
  if (!entry) return crumbs;
  if (entry.group) crumbs.push({ label: entry.group.label, href: null });
  crumbs.push({ label: entry.label, href: null });
  return crumbs;
}

// Role check used by both the sidebar (to filter links) and RequireRole
// (route guard). Unknown paths are allowed through; RequireRole only guards
// paths that are actually registered in this file.
export function canAccess(role, path) {
  const normalized = normalizeRole(role);
  if (normalized === 'owner') return true;
  const entry = findNavItem(path);
  if (!entry) return true;
  return (entry.roles || ROLES).includes(normalized);
}

export { normalizeRole };
