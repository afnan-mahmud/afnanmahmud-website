'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { PERMISSIONS, viewPermFor } from '@/lib/permissions';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export interface AdminTarget {
  _id: string;
  name: string;
  phone: string;
  permissions: string[];
}

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  initial?: AdminTarget;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminPermissionModal({ open, mode, initial, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [perms, setPerms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setPhone(initial?.phone ?? '');
      setPerms(new Set(initial?.permissions ?? []));
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  const toggle = (perm: string) => {
    setPerms((prev) => {
      const next = new Set(prev);
      const view = viewPermFor(perm);
      const isView = perm === view;
      if (next.has(perm)) {
        next.delete(perm);
        // Turning off a section's view removes all its actions too.
        if (isView) {
          for (const p of [...next]) if (viewPermFor(p) === view) next.delete(p);
        }
      } else {
        next.add(perm);
        // Any action implies the section's view.
        if (!isView) next.add(view);
      }
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('নাম দাও।'); return; }
    if (mode === 'add' && !/^01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      setError('সঠিক ফোন নম্বর দাও (01XXXXXXXXX)।');
      return;
    }

    setLoading(true);
    try {
      const url = mode === 'add' ? '/api/admin/team' : `/api/admin/team/${initial!._id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), permissions: [...perms] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'কিছু একটা সমস্যা হয়েছে।'); return; }
      onSaved();
      onClose();
    } catch {
      setError('Network সমস্যা। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0',
    fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color="#6366f1" />
            <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>
              {mode === 'add' ? 'Add Admin' : 'Edit Admin'}
            </h2>
          </div>
          {!loading && (
            <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
            <div>
              <label className={inter.className} style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8125rem', marginBottom: 6 }}>Name</label>
              <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin er nam" disabled={loading} />
            </div>
            <div>
              <label className={inter.className} style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8125rem', marginBottom: 6 }}>
                Phone {mode === 'edit' && <span style={{ color: '#52525b' }}>(change kora jabe na)</span>}
              </label>
              <input style={{ ...input, opacity: mode === 'edit' ? 0.6 : 1 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} disabled={loading || mode === 'edit'} />
            </div>
          </div>

          <p className={sg.className} style={{ color: '#3f3f46', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Permissions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {PERMISSIONS.map((section) => (
              <div key={section.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className={sg.className} style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem', margin: '0 0 10px' }}>{section.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                  {section.actions.map((action) => {
                    const checked = perms.has(action.key);
                    return (
                      <label key={action.key} className={inter.className} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: loading ? 'default' : 'pointer', color: checked ? '#a5b4fc' : '#71717a', fontSize: '0.8125rem' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggle(action.key)} disabled={loading} style={{ accentColor: '#6366f1', width: 15, height: 15 }} />
                        {action.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className={inter.className} style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} className={inter.className} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#a1a1aa', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
            <button type="submit" disabled={loading} className={sg.className} style={{ padding: '10px 24px', background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
              {loading ? 'Saving…' : mode === 'add' ? 'Add Admin' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
