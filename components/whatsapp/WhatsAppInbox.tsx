'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import SavedRepliesMenu from './SavedRepliesMenu';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const POLL_MS = 7000;
/** Below this width the inbox switches to WhatsApp-style list → full-screen chat. */
const MOBILE_QUERY = '(max-width: 720px)';

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

/** True while the viewport matches `query`; false during SSR and first paint. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/**
 * The *visual* viewport — the part of the page not covered by the on-screen
 * keyboard. Mobile Safari does not shrink the layout viewport (`100vh`/`100dvh`)
 * when the keyboard opens, so a bottom-pinned composer ends up underneath it and
 * you can't see what you're typing. Sizing the chat overlay to `visualViewport`
 * (and offsetting it by `offsetTop`, which is non-zero while the page is pinch-
 * scrolled) is the only reliable fix. Returns null where the API is missing —
 * callers fall back to `100dvh`.
 */
function useVisualViewport(): { height: number; offsetTop: number } | null {
  const [vv, setVv] = useState<{ height: number; offsetTop: number } | null>(null);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setVv({ height: v.height, offsetTop: v.offsetTop });
    update();
    v.addEventListener('resize', update);
    v.addEventListener('scroll', update);
    return () => {
      v.removeEventListener('resize', update);
      v.removeEventListener('scroll', update);
    };
  }, []);
  return vv;
}

export default function WhatsAppInbox({ canReply }: { canReply: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeWaId, setActiveWaId] = useState<string | null>(null);
  const [contact, setContact] = useState<ThreadContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const vv = useVisualViewport();
  const chatOpen = isMobile && Boolean(activeWaId);

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

  // Keep the thread scrolled to the newest message — also when the keyboard
  // opens and shrinks the visible area (vv.height changes).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, vv?.height]);

  // The full-screen chat is a fixed overlay; stop the page behind it scrolling.
  useEffect(() => {
    if (!chatOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [chatOpen]);

  const openConversation = (waId: string) => {
    setActiveWaId(waId);
    setError(null);
    // Optimistically clear the unread dot in the list.
    setConversations((prev) => prev.map((c) => (c.waId === waId ? { ...c, unreadCount: 0 } : c)));
  };

  const closeConversation = () => {
    setActiveWaId(null);
    setContact(null);
    setMessages([]);
    setError(null);
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

  const composer = (
    <Composer
      draft={draft}
      setDraft={setDraft}
      onSend={send}
      sending={sending}
      disabled={replyDisabled}
      note={replyNote}
      error={error}
      compact={isMobile}
      canManageReplies={canReply}
    />
  );

  return (
    <div className="wa-inbox" style={{ display: 'flex', height: '100vh', minHeight: 0 }}>
      {/* Conversation list — the only pane on mobile. */}
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
              const active = !isMobile && c.waId === activeWaId;
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

      {/* Desktop thread pane (hidden on mobile — the overlay below replaces it). */}
      <section className="wa-thread-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        {!activeWaId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#52525b' }}>
            <MessageCircle size={40} />
            <p className={inter.className} style={{ fontSize: '0.9375rem' }}>Ekta conversation select korun</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>
                {contact?.name ?? activeWaId}
              </p>
              <p className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', margin: '2px 0 0' }}>
                +{activeWaId}{contact?.studentName ? ` · ${contact.studentName} (student)` : ''}
              </p>
            </div>
            {!isMobile && <MessageList listRef={scrollRef} messages={messages} />}
            {!isMobile && composer}
          </>
        )}
      </section>

      {/* Mobile: the chat is its own full-screen view, sized to the visual
          viewport so the composer stays above the keyboard. */}
      {chatOpen && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: vv ? vv.offsetTop : 0,
            height: vv ? vv.height : '100dvh',
            zIndex: 120,
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#111111', flexShrink: 0 }}>
            <button onClick={closeConversation} aria-label="Back to conversations" style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {contact?.name ?? activeWaId}
              </p>
              <p className={inter.className} style={{ color: '#71717a', fontSize: '0.75rem', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                +{activeWaId}{contact?.studentName ? ` · ${contact.studentName} (student)` : ''}
              </p>
            </div>
          </div>
          <MessageList listRef={scrollRef} messages={messages} />
          {composer}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .wa-inbox { height: auto !important; }
          .wa-list { width: 100% !important; border-right: none !important; }
          .wa-thread-pane { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function MessageList({ listRef, messages }: { listRef: RefObject<HTMLDivElement | null>; messages: Message[] }) {
  return (
    <div
      ref={listRef}
      className="wa-messages"
      style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {messages.length === 0 ? (
        <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem', textAlign: 'center', margin: 'auto 0' }}>
          Kono message nei
        </p>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} m={m} />)
      )}
    </div>
  );
}

function Composer({
  draft, setDraft, onSend, sending, disabled, note, error, compact, canManageReplies,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
  note: string | null;
  error: string | null;
  compact: boolean;
  canManageReplies: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const blocked = disabled || sending || !draft.trim();

  // Grow with the text, like WhatsApp, up to ~5 lines.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: compact ? '10px 12px' : '14px 24px', background: '#111111', flexShrink: 0 }}>
      {note && (
        <p className={inter.className} style={{ color: '#f59e0b', fontSize: '0.75rem', margin: '0 0 8px' }}>{note}</p>
      )}
      {error && (
        <p className={inter.className} style={{ color: '#f87171', fontSize: '0.75rem', margin: '0 0 8px' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <SavedRepliesMenu
          canManage={canManageReplies}
          onPick={(text) => {
            setDraft(text);
            // Land the caret at the end so the operator can keep typing.
            requestAnimationFrame(() => {
              const el = ref.current;
              if (!el) return;
              el.focus();
              el.setSelectionRange(text.length, text.length);
            });
          }}
        />
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // On mobile Enter inserts a newline (the send icon is the only way to
            // send); on desktop Enter sends and Shift+Enter breaks the line.
            if (!compact && e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={disabled || sending}
          placeholder={disabled ? 'Reply disabled' : 'Message likhun…'}
          rows={1}
          className={inter.className}
          style={{
            flex: 1, resize: 'none', maxHeight: 120,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: compact ? 20 : 10,
            color: '#e2e8f0',
            padding: compact ? '10px 14px' : '10px 14px',
            // <16px triggers iOS Safari's auto-zoom on focus, which breaks the layout.
            fontSize: compact ? '1rem' : '0.875rem',
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={onSend}
          disabled={blocked}
          aria-label="Send"
          className={sg.className}
          style={{
            background: '#22c55e', color: '#fff', border: 'none',
            borderRadius: compact ? '50%' : 10,
            width: compact ? 42 : undefined,
            height: compact ? 42 : undefined,
            padding: compact ? 0 : '10px 16px',
            fontWeight: 700, fontSize: '0.875rem',
            cursor: blocked ? 'not-allowed' : 'pointer',
            opacity: blocked ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            flexShrink: 0,
          }}
        >
          <Send size={compact ? 18 : 15} />
          {!compact && (sending ? '…' : 'Send')}
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const out = m.direction === 'out';
  return (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '78%',
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
          <audio src={m.mediaPath} controls style={{ display: 'block', maxWidth: '100%', marginBottom: m.text ? 6 : 0 }} />
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
