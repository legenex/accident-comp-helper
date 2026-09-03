import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Pill, AdminButton, SearchBar, EmptyState, Modal, Field, AdminInput } from "@/components/admin/ui";
import { base44 } from "@/api/base44Client";
import { UserPlus, Users, Mail } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try { setUsers((await base44.entities.User.list()) ?? []); } catch { setUsers([]); }
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));

  const invite = async () => {
    setInviting(true); setError("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteOpen(false); setInviteEmail(""); setInviteRole("user");
      fetchUsers();
    } catch (e) {
      setError(e?.message || "Could not send invite. You may need admin permissions.");
    } finally { setInviting(false); }
  };

  return (
    <AdminLayout title="User Management" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "User Management" }]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">User Management</h2><p className="mt-1 text-sm text-admuted">{users.length} users</p></div>
        <AdminButton onClick={() => setInviteOpen(true)}><UserPlus className="h-4 w-4" /> Invite User</AdminButton>
      </div>
      <Card className="mb-6"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." /></Card>
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-5"><EmptyState icon={Users} title="No users found" body="Invite team members to collaborate." action={<AdminButton onClick={() => setInviteOpen(true)}><UserPlus className="h-4 w-4" /> Invite User</AdminButton>} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-admuted">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Role</th>
              <th className="hidden p-3 text-left font-medium sm:table-cell">Joined</th>
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-semibold text-white">{u.full_name || "-"}</td>
                  <td className="p-3 text-slate-300">{u.email}</td>
                  <td className="p-3"><Pill tone={u.role === "admin" ? "blue" : "neutral"}>{u.role || "user"}</Pill></td>
                  <td className="hidden p-3 text-slate-300 sm:table-cell">{u.created_date ? new Date(u.created_date).toLocaleDateString("en-US") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User">
        <div className="space-y-4">
          <Field label="Email address"><AdminInput type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@example.com" /></Field>
          <Field label="Role">
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full rounded-lg border border-navyline bg-navy/60 px-3 py-2 text-sm text-white outline-none focus:border-brand">
              <option value="user">user</option><option value="admin">admin</option>
            </select>
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><AdminButton variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</AdminButton><AdminButton onClick={invite} disabled={inviting || !inviteEmail}><Mail className="h-4 w-4" /> {inviting ? "Sending..." : "Send invite"}</AdminButton></div>
        </div>
      </Modal>
    </AdminLayout>
  );
}