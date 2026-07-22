'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Send, StickyNote, CreditCard, MessageCircle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { formatDhakaDateTime } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

/** Which part of the view the opening button wants front-and-centre. */
export type ActivityFocus = 'details' | 'notes' | 'whatsapp';

interface Attempt {
  id: string;
  courseTitle: string;
  amount: number;
  status: 'pending' | 'failed' | 'success' | 'refunded';
  paymentGateway: string | null;
  merchantTransactionId: string | null;
  transactionId: string | null;
  failReason: string | null;
  followupSentAt: string | null;
  createdAt: string;
}

interface Note {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
}

interface WaMessage {
  id: string;
  direction: 'in' | 'out';
  type: string;
  text: string;
  mediaPath: string | null;
  status: string | null;
  timestamp: string;
}

interface ActivityData {
  student: { name: string; phone: string; createdAt: string; enrolled: boolean };
  counts: { total: number; pending: number; failed: number; success: number; refunded: number };
  attempts: Attempt[];
  notes: Note[];
  whatsapp: { waId: string; configured: boolean; canReply: boolean; messages: WaMessage[] };
}

const STATUS_STYLE: Record<Attempt['status'], { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  failed: { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  success: { label: 'Success', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' },
  refunded: { label: 'Refunded', color: '#a1a1aa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)' },
};

const sectionLabel: CSSProperties = {
  color: '#52525b',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: 0,
};

export default function StudentActivityModal({
  studentId,
  focus = 'details',
  canNote,
  canWhatsApp,
  onClose,
}: {
  studentId: string;
  focus?: ActivityFocus;
  canNote: boolean;
  canWhatsApp: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<ActivityData | null>(null);
  const [error, setError] = useState('');

  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const [waDraft, setWaDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [waError, setWaError] = useState('');
  const [needsTemplate, setNeedsTemplate] = useState(false);

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const waRef = useRef<HTMLTextAreaElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  /** Only steer focus on the first successful load, not on every refetch. */
  const focusedOnce = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/activity`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError('Details load hoyni');
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on Escape — the modal has no other keyboard affordance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!data || focusedOnce.current) return;
    focusedOnce.current = true;
    if (focus === 'notes') {
      notesSectionRef.current?.scrollIntoView({ block: 'start' });
      noteRef.current?.focus();
    } else if (focus === 'whatsapp') {
      waRef.current?.focus();
    }
  }, [data, focus]);

  // Keep the WhatsApp thread pinned to the newest message.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [data?.whatsapp.messages.length]);

  const saveNote = async () => {
    const text = noteDraft.trim();
    if (!text || savingNote) return;
    setSavingNote(true);
    setNoteError('');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNoteError(body.error ?? 'Note save holo na');
        return;
      }
      setData((prev) => (prev ? { ...prev, notes: [body.note, ...prev.notes] } : prev));
      setNoteDraft('');
      router.refresh();
    } catch {
      setNoteError('Network error, abar try korun');
    } finally {
      setSavingNote(false);
    }
  };

  const sendWhatsApp = async (asTemplate: boolean) => {
    const text = waDraft.trim();
    if (sending || (!asTemplate && !text)) return;
    setSending(true);
    setWaError('');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asTemplate ? { template: true } : { text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWaError(body.error ?? 'Send fail holo');
        setNeedsTemplate(Boolean(body.needsTemplate));
        return;
      }
      setNeedsTemplate(false);
      setData((prev) =>
        prev
          ? { ...prev, whatsapp: { ...prev.whatsapp, messages: [...prev.whatsapp.messages, body.message] } }
          : prev
      );
      if (!asTemplate) setWaDraft('');
    } catch {
      setWaError('Network error, abar try korun');
    } finally {
      setSending(false);
    }
  };

  const wa = data?.whatsapp;
  const canFreeForm = Boolean(canWhatsApp && wa?.configured && wa?.canReply);
  const waNote = !canWhatsApp
    ? 'Apnar WhatsApp pathanor permission nei.'
    : wa && !wa.configured
      ? 'WhatsApp API configure kora nei.'
      : wa && !wa.canReply
        ? '24-ghontar window bondho — free-form text pathano jabe na. Follow-up template diye conversation open korun.'
        : null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="act-modal"
        style={{ width: '100%', maxWidth: 940, background: '#121214', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div>
            <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>
              {data?.student.name ?? 'Student Details'}
            </h2>
            {data && (
              <p className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', margin: '3px 0 0' }}>
                {data.student.phone} · account {formatDhakaDateTime(data.student.createdAt)}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}>
            <X size={18} />
          </button>
        </div>

        {!data && !error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={24} color="#6366f1" className="spin" />
          </div>
        )}
        {error && (
          <p className={inter.className} style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center', padding: '40px 0' }}>{error}</p>
        )}

        {data && (
          <div className="act-body" style={{ display: 'grid', gridTemplateColumns: '1fr 330px', minHeight: 0, flex: 1 }}>
            {/* Left — payment attempts + call notes */}
            <div className="act-main" style={{ overflowY: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <CreditCard size={14} color="#a78bfa" />
                <p className={sg.className} style={sectionLabel}>Payment attempts</p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                <CountChip label="Total" value={data.counts.total} color="#a5b4fc" bg="rgba(99,102,241,0.1)" border="rgba(99,102,241,0.22)" />
                <CountChip label="Pending" value={data.counts.pending} color={STATUS_STYLE.pending.color} bg={STATUS_STYLE.pending.bg} border={STATUS_STYLE.pending.border} />
                <CountChip label="Failed" value={data.counts.failed} color={STATUS_STYLE.failed.color} bg={STATUS_STYLE.failed.bg} border={STATUS_STYLE.failed.border} />
                <CountChip label="Success" value={data.counts.success} color={STATUS_STYLE.success.color} bg={STATUS_STYLE.success.bg} border={STATUS_STYLE.success.border} />
              </div>

              {data.attempts.length === 0 ? (
                <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: '0 0 22px' }}>
                  Ekhono kono payment attempt nei — signup korechhe, checkout e jayni.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {data.attempts.map((a) => {
                    const st = STATUS_STYLE[a.status];
                    return (
                      <div key={a.id} style={{ padding: '11px 13px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <span className={sg.className} style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>{a.courseTitle}</span>
                          <span className={inter.className} style={{ padding: '2px 8px', borderRadius: '100px', background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{st.label}</span>
                        </div>
                        <p className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', margin: '5px 0 0' }}>
                          ৳{a.amount.toLocaleString()}{a.paymentGateway ? ` · ${a.paymentGateway}` : ''} · {formatDhakaDateTime(a.createdAt)}
                        </p>
                        {(a.merchantTransactionId || a.transactionId) && (
                          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', margin: '4px 0 0', wordBreak: 'break-all' }}>
                            {a.transactionId ? `Txn: ${a.transactionId}` : `Ref: ${a.merchantTransactionId}`}
                          </p>
                        )}
                        {a.failReason && (
                          <p className={inter.className} style={{ color: '#f87171', fontSize: '0.6875rem', margin: '4px 0 0' }}>{a.failReason}</p>
                        )}
                        {a.followupSentAt && (
                          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', margin: '4px 0 0' }}>
                            Follow-up pathano hoyeche {formatDhakaDateTime(a.followupSentAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Call notes */}
              <div ref={notesSectionRef} style={{ scrollMarginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <StickyNote size={14} color="#fbbf24" />
                  <p className={sg.className} style={sectionLabel}>Call notes ({data.notes.length})</p>
                </div>

                {canNote ? (
                  <div style={{ marginBottom: 14 }}>
                    <textarea
                      ref={noteRef}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Call er feedback likhun… (e.g. call dhoreche, next week enroll korbe)"
                      rows={3}
                      className={inter.className}
                      style={{ width: '100%', resize: 'vertical', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', padding: '10px 12px', fontSize: '0.8125rem', outline: 'none' }}
                    />
                    {noteError && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.75rem', margin: '6px 0 0' }}>{noteError}</p>}
                    <button
                      onClick={saveNote}
                      disabled={savingNote || !noteDraft.trim()}
                      className={sg.className}
                      style={{ marginTop: 8, padding: '7px 14px', borderRadius: 9, background: '#6366f1', color: '#fff', border: 'none', fontSize: '0.8125rem', fontWeight: 700, cursor: savingNote || !noteDraft.trim() ? 'not-allowed' : 'pointer', opacity: savingNote || !noteDraft.trim() ? 0.5 : 1 }}
                    >
                      {savingNote ? 'Saving…' : 'Save note'}
                    </button>
                  </div>
                ) : (
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', margin: '0 0 12px' }}>
                    Note lekhar permission nei — dekhte parben.
                  </p>
                )}

                {data.notes.length === 0 ? (
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>Kono note nei.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.notes.map((n) => (
                      <div key={n.id} style={{ padding: '10px 12px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10 }}>
                        <p className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.8125rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</p>
                        <p className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', margin: '6px 0 0' }}>
                          {n.authorName} · {formatDhakaDateTime(n.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — WhatsApp thread + composer */}
            <aside className="act-side" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <MessageCircle size={14} color="#22c55e" />
                <p className={sg.className} style={sectionLabel}>WhatsApp</p>
              </div>

              <div ref={threadRef} className="act-thread" style={{ flex: 1, minHeight: 140, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wa && wa.messages.length === 0 ? (
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 'auto 0', textAlign: 'center' }}>
                    Ekhono kono text pathano hoyni.
                  </p>
                ) : (
                  wa?.messages.map((m) => <Bubble key={m.id} m={m} />)
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
                {waNote && <p className={inter.className} style={{ color: '#f59e0b', fontSize: '0.6875rem', margin: '0 0 8px' }}>{waNote}</p>}
                {waError && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.6875rem', margin: '0 0 8px' }}>{waError}</p>}
                <textarea
                  ref={waRef}
                  value={waDraft}
                  onChange={(e) => setWaDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendWhatsApp(false); } }}
                  disabled={!canFreeForm || sending}
                  placeholder={canFreeForm ? 'Message likhun…' : 'Free-form disabled'}
                  rows={2}
                  className={inter.className}
                  style={{ width: '100%', resize: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', padding: '9px 12px', fontSize: '0.8125rem', outline: 'none', opacity: canFreeForm ? 1 : 0.5 }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => sendWhatsApp(false)}
                    disabled={!canFreeForm || sending || !waDraft.trim()}
                    className={sg.className}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 12px', fontWeight: 700, fontSize: '0.8125rem', cursor: !canFreeForm || sending || !waDraft.trim() ? 'not-allowed' : 'pointer', opacity: !canFreeForm || sending || !waDraft.trim() ? 0.5 : 1 }}
                  >
                    <Send size={14} /> {sending ? '…' : 'Send'}
                  </button>
                  {canWhatsApp && wa?.configured && (!wa.canReply || needsTemplate) && (
                    <button
                      onClick={() => sendWhatsApp(true)}
                      disabled={sending}
                      className={sg.className}
                      title="Approved enroll_followup template pathiye conversation open korun"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 12px', color: '#a1a1aa', fontWeight: 700, fontSize: '0.8125rem', cursor: sending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Template
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        <style>{`
          .spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
          .act-modal .act-body { height: min(72vh, 620px); }
          @media (max-width: 860px) {
            .act-modal .act-body { grid-template-columns: 1fr; height: auto; overflow-y: auto; }
            .act-modal .act-main { overflow-y: visible; }
            .act-modal .act-side { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); }
            .act-modal .act-thread { max-height: 260px; }
          }
        `}</style>
      </div>
    </div>
  );
}

function CountChip({ label, value, color, bg, border }: { label: string; value: number; color: string; bg: string; border: string }) {
  return (
    <span className={inter.className} style={{ padding: '3px 10px', borderRadius: '100px', background: bg, border: `1px solid ${border}`, color, fontSize: '0.6875rem', fontWeight: 700 }}>
      {label} {value}
    </span>
  );
}

function Bubble({ m }: { m: WaMessage }) {
  const out = m.direction === 'out';
  return (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '85%', background: out ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${out ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '7px 11px' }}>
        {m.type === 'image' && m.mediaPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.mediaPath} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: m.text ? 6 : 0 }} />
        )}
        {m.text && (
          <p className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.8125rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 3 }}>
          <span className={inter.className} style={{ color: '#52525b', fontSize: '0.625rem' }}>{formatDhakaDateTime(m.timestamp)}</span>
          {out && m.status && (
            <span className={inter.className} style={{ color: m.status === 'failed' ? '#f87171' : '#52525b', fontSize: '0.625rem' }}>
              {m.status === 'failed' ? '✗ failed' : m.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
