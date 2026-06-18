'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Pencil, Trash2, Crown } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { PERMISSIONS } from '@/lib/permissions';
import AdminPermissionModal, { type AdminTarget } from './AdminPermissionModal';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export interface AdminRow {
  _id: string;
  name: string;
  phone: string;
  isOwner: boolean;
  permissions: string[];
  createdAt: string | null;
}

/** Section labels this admin can view, for the summary column. */
function sectionSummary(permissions: string[]): string {
  const labels = PERMISSIONS.filter((s) => permissions.includes(`${s.id}.view`)).map((s) => s.label);
  return labels.length ? labels.join(', ') : 'No access yet';
}

export default function TeamTable({ admins, currentUserId }: { admins: AdminRow[]; currentUserId: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTarget | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openAdd = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit = (a: AdminRow) => {
    setEditing({ _id: a._id, name: a.name, phone: a.phone, permissions: a.permissions });
    setModalOpen(true);
  };

  async function remove(a: AdminRow) {
    if (!window.confirm(`${a.name} (${a.phone}) ke admin theke remove korbe?`)) return;
    setBusyId(a._id);
    try {
      const res = await fetch(`/api/admin/team/${a._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { window.alert(data.error ?? 'Remove failed'); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const th: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 16px', fontSize: '0.8125rem', verticalAlign: 'middle' };

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>Users</h1>
          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: '4px 0 0' }}>Admin team ar tader access manage korun.</p>
        </div>
        <button onClick={openAdd} className={sg.className} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
          <UserPlus size={16} /> Add Admin
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Phone', 'Role', 'Access', 'Joined', ''].map((h, i) => (
                  <th key={h || `c${i}`} className={sg.className} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => {
                const isSelf = a._id === currentUserId;
                return (
                  <tr key={a._id} style={{ borderBottom: i < admins.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className={inter.className} style={{ ...td, color: '#e2e8f0' }}>
                      {a.name}{isSelf && <span style={{ marginLeft: 6, color: '#52525b', fontSize: '0.6875rem' }}>(you)</span>}
                    </td>
                    <td className={inter.className} style={{ ...td, color: '#71717a' }}>{a.phone}</td>
                    <td style={td}>
                      {a.isOwner ? (
                        <span className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 100, color: '#fbbf24', fontSize: '0.6875rem', fontWeight: 700 }}>
                          <Crown size={11} /> Owner
                        </span>
                      ) : (
                        <span className={sg.className} style={{ padding: '2px 9px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, color: '#a5b4fc', fontSize: '0.6875rem', fontWeight: 700 }}>Admin</span>
                      )}
                    </td>
                    <td className={inter.className} style={{ ...td, color: a.isOwner ? '#a1a1aa' : '#a1a1aa', maxWidth: 280 }}>
                      {a.isOwner ? 'Full access' : sectionSummary(a.permissions)}
                    </td>
                    <td className={inter.className} style={{ ...td, color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {a.isOwner ? (
                        <span style={{ color: '#3f3f46', fontSize: '0.75rem' }}>—</span>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button onClick={() => openEdit(a)} title="Edit permissions" style={iconBtn}>
                            <Pencil size={14} color="#a5b4fc" />
                          </button>
                          <button onClick={() => remove(a)} disabled={busyId === a._id} title="Remove admin" style={iconBtn}>
                            <Trash2 size={14} color="#f87171" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPermissionModal
        open={modalOpen}
        mode={editing ? 'edit' : 'add'}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => router.refresh()}
      />

      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
  borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
};
