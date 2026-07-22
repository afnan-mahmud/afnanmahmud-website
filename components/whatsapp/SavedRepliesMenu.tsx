'use client';

import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical, Plus, Trash2, ChevronLeft, Loader2, MessageSquareText } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface Reply {
  id: string;
  title: string;
  text: string;
}

/**
 * The composer's ⋮ button: a small popover with the team's saved (canned)
 * WhatsApp replies. Picking one drops its text into the composer — it is not
 * sent, so the operator can still edit before hitting send.
 */
export default function SavedRepliesMenu({
  onPick,
  canManage,
  disabled,
}: {
  onPick: (text: string) => void;
  /** Whether this admin may add/remove entries (mirrors `whatsapp.reply`). */
  canManage: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'list' | 'add'>('menu');
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const loadReplies = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/whatsapp/saved-replies');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReplies(data.replies ?? []);
    } catch {
      setError('Saved replies load hoyni');
      setReplies([]);
    }
  };

  const openList = () => {
    setView('list');
    if (replies === null) loadReplies();
  };

  const save = async () => {
    if (saving || !title.trim() || !text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/whatsapp/saved-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Save holo na');
        return;
      }
      setReplies((prev) => [data.reply, ...(prev ?? [])]);
      setTitle('');
      setText('');
      setView('list');
    } catch {
      setError('Network error, abar try korun');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setError('');
    // Optimistic — restore the row if the server rejects it.
    const prev = replies ?? [];
    setReplies(prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/admin/whatsapp/saved-replies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    } catch {
      setReplies(prev);
      setError('Delete holo na');
    }
  };

  const pick = (reply: Reply) => {
    onPick(reply.text);
    setOpen(false);
    setView('menu');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setView('menu'); setError(''); }}
        disabled={disabled}
        aria-label="More options"
        aria-expanded={open}
        style={{
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%', width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a1a1aa', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1, flexShrink: 0,
        }}
      >
        <EllipsisVertical size={18} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
            width: 'min(320px, calc(100vw - 32px))',
            background: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
            zIndex: 130, overflow: 'hidden',
          }}
        >
          {view === 'menu' && (
            <button
              type="button"
              onClick={openList}
              className={inter.className}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left' }}
            >
              <MessageSquareText size={16} color="#22c55e" /> Saved replies
            </button>
          )}

          {view !== 'menu' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                type="button"
                onClick={() => setView(view === 'add' ? 'list' : 'menu')}
                aria-label="Back"
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 2, display: 'flex' }}
              >
                <ChevronLeft size={17} />
              </button>
              <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.8125rem' }}>
                {view === 'add' ? 'New saved reply' : 'Saved replies'}
              </span>
            </div>
          )}

          {error && (
            <p className={inter.className} style={{ color: '#f87171', fontSize: '0.75rem', margin: 0, padding: '8px 14px' }}>{error}</p>
          )}

          {view === 'list' && (
            <>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {replies === null ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                    <Loader2 size={18} color="#6366f1" className="spin" />
                  </div>
                ) : replies.length === 0 ? (
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', padding: '18px 14px', margin: 0, textAlign: 'center' }}>
                    Kono saved reply nei.
                  </p>
                ) : (
                  replies.map((r) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <button
                        type="button"
                        onClick={() => pick(r)}
                        style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 6px 10px 14px' }}
                      >
                        <span className={sg.className} style={{ display: 'block', color: '#e2e8f0', fontSize: '0.8125rem', fontWeight: 600 }}>{r.title}</span>
                        <span className={inter.className} style={{ display: 'block', color: '#71717a', fontSize: '0.75rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</span>
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          aria-label={`Delete ${r.title}`}
                          style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: '11px 12px', display: 'flex', flexShrink: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => { setView('add'); setError(''); }}
                  className={sg.className}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '11px 14px', background: 'rgba(34,197,94,0.1)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', color: '#4ade80', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={15} /> Add saved reply
                </button>
              )}
            </>
          )}

          {view === 'add' && (
            <div style={{ padding: 12 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g. Payment problem)"
                className={inter.className}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', padding: '8px 11px', fontSize: '0.8125rem', outline: 'none', marginBottom: 8 }}
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message ta likhun…"
                rows={4}
                className={inter.className}
                style={{ width: '100%', resize: 'vertical', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', padding: '8px 11px', fontSize: '0.8125rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={save}
                disabled={saving || !title.trim() || !text.trim()}
                className={sg.className}
                style={{ marginTop: 8, width: '100%', padding: '9px 12px', borderRadius: 8, background: '#22c55e', color: '#fff', border: 'none', fontSize: '0.8125rem', fontWeight: 700, cursor: saving || !title.trim() || !text.trim() ? 'not-allowed' : 'pointer', opacity: saving || !title.trim() || !text.trim() ? 0.5 : 1 }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
