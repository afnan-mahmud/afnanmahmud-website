'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Send, MessageCircle } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const POLL_MS = 7000;

interface Conversation {
  waId: string;
  name: string;
  studentName: string | null;
  lastMessageText: string;
  lastMessageAt: string;
  lastInboundAt: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  direction: 'in' | 'out';
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  text: string;
  mediaPath: string | null;
  mediaMime: string | null;
  status: string | null;
  error: string | null;
  timestamp: string;
}

interface ThreadContact {
  waId: string;
  name: string;
  studentName: string | null;
  lastInboundAt: string | null;
  canReply: boolean;
}

const dhakaTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));

export default function WhatsAppInbox({ canReply }: { canReply: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeWaId, setActiveWaId] = useState<string | null>(null);
  const [contact, setContact] = useState<ThreadContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp/conversations');
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      /* ignore transient errors */
    }
  }, []);

  const loadThread = useCallback(async (waId: string) => {
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${encodeURIComponent(waId)}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setContact(data.contact ?? null);
      setMessages(data.messages ?? []);
    } catch {
      /* ignore transient errors */
    }
  }, []);

  // Poll the conversation list.
  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, POLL_MS);
    return () => clearInterval(id);
  }, [loadConversations]);

  // Poll the open thread.
  useEffect(() => {
    if (!activeWaId) return;
    loadThread(activeWaId);
    const id = setInterval(() => loadThread(activeWaId), POLL_MS);
    return () => clearInterval(id);
  }, [activeWaId, loadThread]);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const openConversation = (waId: string) => {
    setActiveWaId(waId);
    setError(null);
    // Optimistically clear the unread dot in the list.
    setConversations((prev) => prev.map((c) => (c.waId === waId ? { ...c, unreadCount: 0 } : c)));
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeWaId || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/whatsapp/conversations/${encodeURIComponent(activeWaId)}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Send fail holo');
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setDraft('');
      loadConversations();
    } catch {
      setError('Network error, abar try korun');
    } finally {
      setSending(false);
    }
  };

  const replyDisabled = !canReply || !contact?.canReply;
  const replyNote = !canReply
    ? 'Apnar reply pathanor permission nei.'
    : contact && !contact.canReply
      ? '24-ghontar window shesh — customer notun message na dile reply pathano jabe na.'
      : null;

  return (
    <div className="wa-inbox" style={{ display: 'flex', height: 'calc(100vh - 0px)', minHeight: 0 }}>
      {/* Conversation list */}
      <aside
        className="wa-list"
        style={{
          width: 320,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.125rem', margin: 0, letterSpacing: '-0.01em' }}>
            WhatsApp
          </h1>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem', padding: '24px 20px', textAlign: 'center' }}>
              Kono conversation nei
            </p>
          ) : (
            conversations.map((c) => {
              const active = c.waId === activeWaId;
              return (
                <button
                  key={c.waId}
                  onClick={() => openConversation(c.waId)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                    padding: '12px 20px', border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className={sg.className} style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className={sg.className} style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: '#22c55e', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 3 }}>
                    <span className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessageText || '—'}
                    </span>
                    <span className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', flexShrink: 0 }}>
                      {dhakaTime(c.lastMessageAt)}
                    </span>
                  </div>
                  {c.studentName && (
                    <span className={inter.className} style={{ color: '#a5b4fc', fontSize: '0.6875rem' }}>
                      ● Student
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        {!activeWaId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#52525b' }}>
            <MessageCircle size={40} />
            <p className={inter.className} style={{ fontSize: '0.9375rem' }}>Ekta conversation select korun</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>
                {contact?.name ?? activeWaId}
              </p>
              <p className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', margin: '2px 0 0' }}>
                +{activeWaId}{contact?.studentName ? ` · ${contact.studentName} (student)` : ''}
              </p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
            </div>

            {/* Reply box */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px' }}>
              {replyNote && (
                <p className={inter.className} style={{ color: '#f59e0b', fontSize: '0.75rem', margin: '0 0 8px' }}>
                  {replyNote}
                </p>
              )}
              {error && (
                <p className={inter.className} style={{ color: '#f87171', fontSize: '0.75rem', margin: '0 0 8px' }}>
                  {error}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={replyDisabled || sending}
                  placeholder={replyDisabled ? 'Reply disabled' : 'Message likhun…'}
                  rows={1}
                  className={inter.className}
                  style={{
                    flex: 1, resize: 'none', maxHeight: 120,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#e2e8f0', padding: '10px 14px',
                    fontSize: '0.875rem', outline: 'none',
                    opacity: replyDisabled ? 0.5 : 1,
                  }}
                />
                <button
                  onClick={send}
                  disabled={replyDisabled || sending || !draft.trim()}
                  className={sg.className}
                  style={{
                    background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 16px', fontWeight: 700, fontSize: '0.875rem',
                    cursor: replyDisabled || sending || !draft.trim() ? 'not-allowed' : 'pointer',
                    opacity: replyDisabled || sending || !draft.trim() ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Send size={15} /> {sending ? '…' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <style>{`
        @media (max-width: 720px) {
          .wa-inbox { flex-direction: column; height: auto !important; }
          .wa-list { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); max-height: 40vh; }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const out = m.direction === 'out';
  return (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '70%',
          background: out ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${out ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 12, padding: '8px 12px',
        }}
      >
        {m.type === 'image' && m.mediaPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.mediaPath} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: m.text ? 6 : 0 }} />
        )}
        {m.type === 'video' && m.mediaPath && (
          <video src={m.mediaPath} controls style={{ maxWidth: '100%', borderRadius: 8, marginBottom: m.text ? 6 : 0 }} />
        )}
        {m.type === 'audio' && m.mediaPath && (
          <audio src={m.mediaPath} controls style={{ display: 'block', marginBottom: m.text ? 6 : 0 }} />
        )}
        {m.type === 'document' && m.mediaPath && (
          <a href={m.mediaPath} target="_blank" rel="noopener noreferrer" className={inter.className} style={{ color: '#a5b4fc', fontSize: '0.8125rem', textDecoration: 'underline', display: 'block', marginBottom: m.text ? 6 : 0 }}>
            {m.text || 'Download file'}
          </a>
        )}
        {(m.type === 'text' || (m.text && m.type !== 'document')) && (
          <p className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {m.text}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
          <span className={inter.className} style={{ color: '#52525b', fontSize: '0.625rem' }}>
            {dhakaTime(m.timestamp)}
          </span>
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
