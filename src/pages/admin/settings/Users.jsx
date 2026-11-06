import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, SearchInput, DataTable, Modal, EmptyState } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { UserPlus, Users2, Mail } from 'lucide-react';
import { ROLES, normalizeRole } from '@/lib/admin-nav';

export default function UsersSettings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try { setUsers((await base44.entities.User.list()) ?? []); } catch { setUsers([]); }
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));
  const ownerCount = users.filter((u) => normalizeRole(u.role) === 'owner').length;

  const invite = async () => {
    setInviting(true); setError('');
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteOpen(false); setInviteEmail(''); setInviteRole('editor');
      fetchUsers();
    } catch (e) {
      setError(e?.message || 'Could not send invite. You may need admin permissions.');
    } finally { setInviting(false); }
  };

  const changeRole = async (user, nextRole) => {
    await base44.entities.User.update(user.id, { role: nextRole });
    fetchUsers();
  };

  return (
    <AdminLayout>
      <PageHeader title="Users" description="Roles and access. The last remaining owner can't be demoted."
        actions={<Button variant="gold" icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite user</Button>} />

      <Panel padded={false}>
        <div className="p-4"><SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." /></div>
        <DataTable
          loading={loading} rows={filtered}
          empty={<div className="p-4"><EmptyState icon={Users2} title="No users found" description="Invite team members to collaborate." action={<Button variant="gold" icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite user</Button>} /></div>}
          columns={[
            { key: 'full_name', header: 'Name' },
            { key: 'email', header: 'Email' },
            {
              key: 'role', header: 'Role',
              render: (u) => {
                const role = normalizeRole(u.role);
                const isLastOwner = role === 'owner' && ownerCount <= 1;
                return (
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={role}
                      disabled={isLastOwner}
                      title={isLastOwner ? "The last remaining owner can't be demoted" : undefined}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="rounded px-2 py-1 text-sm"
                      style={{ background: '#122430', color: '#E8F1EF', border: '1px solid rgba(148,180,190,0.26)', opacity: isLastOwner ? 0.5 : 1, cursor: isLastOwner ? 'not-allowed' : 'pointer' }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                );
              },
            },
            { key: 'created_date', header: 'Joined', render: (u) => u.created_date ? new Date(u.created_date).toLocaleDateString() : null },
          ]}
        />
      </Panel>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite user"
        footer={<><Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button><Button variant="gold" icon={Mail} loading={inviting} disabled={!inviteEmail} onClick={invite}>Send invite</Button></>}>
        <div className="space-y-4">
          <TextInput label="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@example.com" />
          <SelectInput label="Role" value={inviteRole} options={ROLES} onChange={(e) => setInviteRole(e.target.value)} />
          {error && <p className="text-sm" style={{ color: '#E5534B' }}>{error}</p>}
        </div>
      </Modal>
    </AdminLayout>
  );
}
