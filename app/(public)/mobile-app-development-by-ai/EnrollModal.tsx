'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { trackPixel } from '@/lib/meta-pixel';
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const ACCENT = '#625fff';
const RETRY_KEY = 'devc_enroll_retry';

const isValidName = (v: string) => v.trim().length >= 2;
const isValidPhone = (v: string) => /^01[3-9]\d{8}$/.test(v);

interface EnrollModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EnrollModal({ open, onClose }: EnrollModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError('');
      setTouched({ name: false, phone: false });
      // Prefill from a previous failed attempt (seamless retry).
      try {
        const saved = localStorage.getItem(RETRY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { name?: string; phone?: string };
          if (parsed.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
        }
      } catch { /* ignore malformed/unavailable storage */ }
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open]);

  const nameValid = isValidName(name);
  const phoneValid = isValidPhone(phone);
  const formValid = nameValid && phoneValid;

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setTouched({ name: true, phone: true });

    if (!formValid) return;

    // Save for seamless retry if the payment fails.
    try {
      localStorage.setItem(RETRY_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    } catch { /* ignore unavailable storage */ }

    setLoading(true);
    try {
      const res = await fetch('/api/enroll/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const data = await res.json() as {
        paymentUrl?: string;
        alreadyPurchased?: boolean;
        error?: string;
        eventId?: string;
        value?: number;
        currency?: string;
        contentId?: string;
        contentName?: string;
      };

      if (!res.ok) {
        setError(data.error ?? 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।');
        return;
      }

      if (data.alreadyPurchased) {
        setError('তুমি ইতিমধ্যে এই course-এ enroll করেছ। 01 নম্বর দিয়ে লগইন করো।');
        return;
      }

      if (data.paymentUrl) {
        // Meta InitiateCheckout — same eventId as the server CAPI call (dedup).
        if (data.eventId) {
          trackPixel(
            'InitiateCheckout',
            {
              value: data.value,
              currency: data.currency ?? 'BDT',
              content_ids: data.contentId ? [data.contentId] : undefined,
              content_name: data.contentName,
              content_type: 'product',
            },
            data.eventId
          );
          pushToDataLayer(GTM_EVENT.beginCheckout, {
            content_id: data.contentId,
            content_name: data.contentName,
            value: data.value,
            currency: data.currency ?? 'BDT',
            event_id: data.eventId,
          });
        }
        window.location.href = data.paymentUrl;
      }
    } catch {
      setError('Network সমস্যা। Internet connection চেক করো।');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={inter.className}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 460, position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'modalSlideIn 0.22s ease',
      }}>

        {/* Close button */}
        {!loading && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: '#f4f3ef', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#8c8880',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Funnel stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {['Enroll', 'Payment', 'Access'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === 0 ? ACCENT : '#d8d6d0',
                  boxShadow: i === 0 ? `0 0 8px ${ACCENT}80` : 'none',
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? ACCENT : '#a8a49c' }}>{step}</span>
              </span>
              {i < 2 && <span style={{ width: 20, height: 1, background: '#e8e6e0' }} />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(98,95,255,0.08)', border: '1px solid rgba(98,95,255,0.2)',
            borderRadius: 50, padding: '5px 14px', marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, background: ACCENT, borderRadius: '50%', display: 'inline-block', animation: 'hBlink 1.5s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Early Bird — ৳৯৯০</span>
          </div>
          <h2 className={poppins.className} style={{
            fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 6, lineHeight: 1.3,
          }}>
            Enroll করতে তোমার তথ্য দাও
          </h2>
          <p style={{ fontSize: 14, color: '#8c8880', margin: 0, lineHeight: 1.6 }}>
            আপনার নাম ও ফোন নম্বর দিয়ে নিচের বাটনে ক্লিক করলে payment page-এ চলে যাবেন।
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4a4740', display: 'block', marginBottom: 6 }}>
              তোমার নাম *
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="যেমন: Rahim Uddin"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: `1.5px solid ${touched.name && !nameValid ? '#ef4444' : name ? ACCENT + '60' : '#e8e6e0'}`,
                fontSize: 15, fontFamily: 'inherit', color: '#1a1814',
                outline: 'none', background: 'white', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {touched.name && !nameValid && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626' }}>নাম কমপক্ষে ২ অক্ষরের হতে হবে।</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4a4740', display: 'block', marginBottom: 6 }}>
              ফোন নম্বর * <span style={{ color: '#8c8880', fontWeight: 400 }}>(01XXXXXXXXX)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="01XXXXXXXXX"
              disabled={loading}
              maxLength={11}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: `1.5px solid ${touched.phone && !phoneValid ? '#ef4444' : phone ? ACCENT + '60' : '#e8e6e0'}`,
                fontSize: 15, fontFamily: 'inherit', color: '#1a1814',
                outline: 'none', background: 'white', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {touched.phone && !phoneValid && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626' }}>সঠিক BD নম্বর দাও (যেমন 01712345678)।</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#dc2626', fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formValid}
            style={{
              width: '100%', padding: '15px', borderRadius: 50,
              background: loading || !formValid ? '#a8a6ff' : ACCENT, color: 'white',
              border: 'none', fontSize: 15, fontWeight: 700,
              fontFamily: 'inherit', cursor: loading || !formValid ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading || !formValid ? 'none' : '0 4px 16px rgba(98,95,255,0.3)',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
                  display: 'inline-block', animation: 'enrollSpin 0.7s linear infinite',
                }} />
                Securing your spot...
              </>
            ) : 'Enroll Now →'}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ fontSize: 12, color: '#8c8880', textAlign: 'center', marginTop: 20, marginBottom: 0 }}>
          🔒 তোমার তথ্য সম্পূর্ণ নিরাপদ। Payment-এর পরে এই ফোন নম্বর দিয়ে login করতে পারবে।
        </p>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes enrollSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
