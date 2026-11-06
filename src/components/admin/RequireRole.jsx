// Route-level role enforcement. Hiding a nav link is not access control —
// without this guard, typing the URL gets a lower-role user in anyway.
// Waits for auth to resolve before deciding (a slow profile load must never
// bounce a legitimate admin out of their own panel). On denial it renders an
// explanatory panel naming the current role, never a blank page or a
// redirect loop.
import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { canAccess, normalizeRole } from '@/lib/admin-nav';
import { A } from '@/lib/admin-ds';
import { ShieldAlert } from 'lucide-react';

export default function RequireRole() {
  const { user, isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: A.bg }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: A.teal, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const role = normalizeRole(user?.role);
  const allowed = canAccess(role, location.pathname);

  if (!allowed) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: A.bg, color: A.text }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: A.dangerBg, color: A.danger }}>
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">You don't have access to this page</h1>
          <p className="mt-2 max-w-md text-sm" style={{ color: A.textMuted }}>
            Your role is <span className="font-semibold lowercase" style={{ color: A.text }}>{role}</span>, which doesn't
            include this section. If you think this is wrong, ask an owner or admin to change your role in Settings → Users.
          </p>
        </div>
        <Link to="/admin" className="text-sm font-medium underline" style={{ color: A.teal }}>Back to Overview</Link>
      </div>
    );
  }

  return <Outlet />;
}
