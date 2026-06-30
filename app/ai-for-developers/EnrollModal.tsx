'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lock, Rocket, Loader2 } from 'lucide-react';
import { trackPixel } from '@/lib/meta-pixel';
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';

const COURSE_SLUG = 'ai-for-developers';
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
  const [done, setDone] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });
  const nameRef = useRef<HTMLInputElement>(null);
  const formStarted = useRef(false);

  useEffect(() => {
    if (open) {
      pushToDataLayer(GTM_EVENT.enrollClick, { content_id: COURSE_SLUG });
      formStarted.current = false;
      setError('');
      setDone('');
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading, onClose]);

  function handleFormStart() {
    if (formStarted.current) return;
    formStarted.current = true;
    pushToDataLayer(GTM_EVENT.formStart, { content_id: COURSE_SLUG });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDone('');
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
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), slug: COURSE_SLUG }),
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
        setDone('তুমি ইতিমধ্যে এই course-এ enroll করেছ। ফোন নম্বর দিয়ে লগইন করো।');
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
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
      style={{ animation: 'modalFade 0.2s ease' }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0f172a] border border-slate-700 p-8 md:p-10 shadow-2xl neon-border"
        style={{ animation: 'modalSlideIn 0.22s ease' }}
      >
        {!loading && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Funnel stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['Enroll', 'Payment', 'Access'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className={
                    'w-2 h-2 rounded-full ' +
                    (i === 0 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'bg-slate-600')
                  }
                />
                <span className={'text-xs font-semibold ' + (i === 0 ? 'text-cyan-300' : 'text-slate-500')}>
                  {step}
                </span>
              </span>
              {i < 2 && <span className="w-5 h-px bg-slate-700" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-cyan-500/10 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Early Bird — ৳990</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">Mission শুরু করো 🚀</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            আপনার নাম ও ফোন নম্বর দিন — কোর্সের পেমেন্ট করার পর এই ফোন নাম্বারে কনফার্মেশন মেসেজ পাবেন এবং এই নাম্বার দিয়ে ওয়েবসাইটে লগইন করবেন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">তোমার নাম *</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              onFocus={handleFormStart}
              placeholder="যেমন: Rahim Uddin"
              disabled={loading}
              className={
                'w-full px-4 py-3 rounded-xl bg-slate-900 border text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-60 ' +
                (touched.name && !nameValid ? 'border-red-500/60' : 'border-slate-700 focus:border-cyan-500/60')
              }
            />
            {touched.name && !nameValid && (
              <p className="mt-1.5 text-xs text-red-400">নাম কমপক্ষে ২ অক্ষরের হতে হবে।</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              ফোন নম্বর * <span className="text-slate-500 font-normal">(01XXXXXXXXX)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              onFocus={handleFormStart}
              placeholder="01XXXXXXXXX"
              disabled={loading}
              maxLength={11}
              className={
                'w-full px-4 py-3 rounded-xl bg-slate-900 border text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-60 ' +
                (touched.phone && !phoneValid ? 'border-red-500/60' : 'border-slate-700 focus:border-cyan-500/60')
              }
            />
            {touched.phone && !phoneValid && (
              <p className="mt-1.5 text-xs text-red-400">সঠিক BD নম্বর দাও (যেমন 01712345678)।</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/30">
              {error}
            </div>
          )}

          {done && (
            <div className="rounded-lg px-4 py-3 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30">
              {done}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formValid}
            className="w-full mt-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-base shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            {loading
              ? (<><Loader2 size={18} className="animate-spin" /> Securing your spot...</>)
              : (<><Rocket size={18} />Enroll Now</>)}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-5 flex items-center justify-center gap-1.5">
          <Lock size={13} /> আপনার তথ্য নিরাপদ। Payment করার পরে এই নম্বর দিয়ে login করতে পারবেন।
        </p>
      </div>

      <style>{`
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
