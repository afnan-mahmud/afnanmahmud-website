'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Camera, Save, CheckCircle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface Order {
  _id: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface ProfileData {
  name: string;
  phone: string;
  avatar?: string;
  orders: Order[];
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  failed: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setName(data.name ?? '');
        setAvatarPreview(data.avatar ?? null);
      })
      .catch(() => {
        if (session?.user) {
          setName(session.user.name ?? '');
        }
      });
  }, [session]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      setAvatarPreview(data.url);
      await updateSession({ image: data.url });
      toast.success('Avatar updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setAvatarPreview(profile?.avatar ?? null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingName(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update name');
      setProfile((p) => p ? { ...p, name: name.trim() } : p);
      await updateSession({ name: name.trim() });
      toast.success('Name updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSavingName(false);
    }
  };

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{ padding: '40px 32px', maxWidth: '800px' }} className="profile-content">
      <h1
        className={sg.className}
        style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: '32px' }}
      >
        Profile Settings
      </h1>

      {/* Avatar + basic info card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <h2
          className={sg.className}
          style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '24px', letterSpacing: '-0.01em' }}
        >
          Personal Information
        </h2>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: avatarPreview
                  ? `url(${avatarPreview}) center/cover`
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.5rem',
                fontFamily: sg.style.fontFamily,
                boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                position: 'relative',
                cursor: 'pointer',
                opacity: uploadingAvatar ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
              onClick={() => !uploadingAvatar && fileRef.current?.click()}
              title="Click to change avatar"
            >
              {!avatarPreview && initials}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                className="avatar-overlay"
              >
                <Camera size={22} color="white" />
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            {uploadingAvatar && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
          </div>

          {/* Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
            {/* Name */}
            <div>
              <label className={inter.className} style={{ display: 'block', color: '#71717a', fontSize: '0.8125rem', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className={inter.className}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className={sg.className}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    background: savingName ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: savingName ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  <Save size={14} />
                  {savingName ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {/* Phone (read-only) */}
            <div>
              <label className={inter.className} style={{ display: 'block', color: '#71717a', fontSize: '0.8125rem', marginBottom: '6px' }}>
                Phone Number <span style={{ color: '#3f3f46', fontSize: '0.75rem' }}>(cannot be changed)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={profile?.phone ?? '—'}
                  readOnly
                  className={inter.className}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1.5px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    color: '#52525b',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    cursor: 'not-allowed',
                    width: '200px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} color="#22c55e" />
                  <span className={inter.className} style={{ color: '#4ade80', fontSize: '0.75rem' }}>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase history */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Purchase History
          </h2>
        </div>

        {!profile?.orders?.length ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem' }}>
              No purchases yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Course', 'Amount', 'Date', 'Status', 'Invoice'].map((h) => (
                    <th
                      key={h}
                      className={sg.className}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        color: '#52525b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.orders.map((order, i) => {
                  const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
                  return (
                    <tr
                      key={order._id}
                      style={{
                        borderBottom: i < profile.orders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    >
                      <td
                        className={inter.className}
                        style={{ padding: '14px 20px', color: '#e2e8f0', fontSize: '0.875rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {order.courseTitle}
                      </td>
                      <td
                        className={sg.className}
                        style={{ padding: '14px 20px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        ৳{order.amount.toLocaleString()}
                      </td>
                      <td
                        className={inter.className}
                        style={{ padding: '14px 20px', color: '#71717a', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                      >
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          className={sg.className}
                          style={{
                            padding: '3px 10px',
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                            borderRadius: '100px',
                            color: st.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          className={inter.className}
                          style={{
                            color: '#3f3f46',
                            fontSize: '0.8125rem',
                            fontStyle: 'italic',
                          }}
                        >
                          Coming soon
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .avatar-overlay:hover, div:hover > .avatar-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          .profile-content { padding: 24px 16px !important; }
        }
      `}</style>
    </div>
  );
}
