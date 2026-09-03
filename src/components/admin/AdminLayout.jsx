import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BookOpen, Search, BarChart2,
  Puzzle, Users, Settings, ChevronRight, Menu, LogOut, Globe,
  Radar, Newspaper, Bot, Beaker, ListChecks, Layout, Palette,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Mark } from "@/components/site/Logo";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Pages", icon: FileText, path: "/admin/pages" },
  { label: "Blog Manager", icon: BookOpen, path: "/admin/blog" },
  { label: "SEO Manager", icon: Search, path: "/admin/seo" },
  { label: "Analytics", icon: BarChart2, path: "/admin/analytics" },
  { label: "Signal Engine", icon: Radar, path: "/admin/signals" },
  { label: "Advertorials", icon: Newspaper, path: "/admin/advertorials" },
  { label: "ClaimBot", icon: Bot, path: "/admin/claimbot" },
  { label: "Experiments", icon: Beaker, path: "/admin/experiments" },
  { label: "Surveys", icon: ListChecks, path: "/admin/surveys" },
  { label: "Themes", icon: Palette, path: "/admin/themes" },
  { label: "Landing Pages", icon: Layout, path: "/admin/landing-pages" },
  { label: "Integrations", icon: Puzzle, path: "/admin/integrations" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout({ children, title, breadcrumbs = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then((u) => setAdminEmail(u?.email || u?.full_name || "Admin")).catch(() => {});
  }, []);

  const handleLogout = () => base44.auth.logout("/");

  const isActive = (path) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        {collapsed ? (
          <Mark className="h-9 w-9 flex-shrink-0" />
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Mark className="h-9 w-9 flex-shrink-0" />
            <div className="leading-none">
              <div className="font-heading text-[15px] font-extrabold tracking-tight text-white">Accident</div>
              <div className="font-heading text-[15px] font-extrabold tracking-tight text-white">Compensation</div>
            </div>
          </div>
        )}
      </div>
      <nav className="admin-scroll flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all hover:bg-white/5 hover:text-white">
          <Globe className="h-4 w-4" /> {!collapsed && <span>View Website</span>}
        </a>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-navy text-white">
      <aside className={`hidden flex-shrink-0 flex-col border-r border-white/10 bg-navy transition-all duration-300 md:flex ${collapsed ? "w-16" : "w-60"}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex w-60 flex-col border-r border-white/10 bg-navy"><SidebarContent /></div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-navy px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(!mobileOpen); }}
              className="rounded-lg p-1.5 text-admuted hover:bg-white/5 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              {breadcrumbs.length > 0 && (
                <div className="mb-0.5 flex items-center gap-1 text-xs text-admuted">
                  {breadcrumbs.map((b, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3" />}
                      {b.href ? <Link to={b.href} className="hover:text-white">{b.label}</Link> : <span>{b.label}</span>}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-sm font-semibold text-white">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {adminEmail && <span className="hidden max-w-[180px] truncate text-xs text-admuted md:block">{adminEmail}</span>}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-admuted transition-all hover:bg-white/5 hover:text-white">
              <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="admin-scroll flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}