'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Lock, Rocket, Loader2, ArrowRight } from 'lucide-react';
import { trackPixel } from '@/lib/meta-pixel';
import { trackTikTok } from '@/lib/tiktok-pixel';
import { useEnroll } from './EnrollContext';
import { OTP_URL } from './constants';

const RETRY_KEY = 'devc_enroll_retry';

const isValidName = (v: string) => v.trim().length >= 2;
const isValidPhone = (v: string) => /^01[3-9]\d{8}$/.test(v);

export function EnrollModal() {
  const { open, closeEnroll } = useEnroll();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDone('');
    setTouched({ name: false, phone: false });
    try {
      const saved = localStorage.getItem(RETRY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { name?: string; phone?: string };
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch { /* ignore */ }
    setTimeout(() => nameRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) closeEnroll();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading, closeEnroll]);

  const nameValid = isValidName(name);
  const phoneValid = isValidPhone(phone);
  const formValid = nameValid && phoneValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDone('');
    setTouched({ name: true, phone: true });
    if (!formValid) return;

    try {
      localStorage.setItem(RETRY_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    } catch { /* ignore */ }

    setLoading(true);
    try {
      const res = await fetch('/api/enroll/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = (await res.json()) as {
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
        setError(data.error ?? 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        return;
      }
      if (data.alreadyPurchased) {
        setDone('আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন। ফোন নম্বর দিয়ে লগইন করুন।');
        return;
      }
      if (data.paymentUrl) {
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
          trackTikTok(
            'InitiateCheckout',
            {
              contents: data.contentId
                ? [{ content_id: data.contentId, content_type: 'product', content_name: data.contentName }]
                : undefined,
              content_type: 'product',
              value: data.value,
              currency: data.currency ?? 'BDT',
            },
            data.eventId
          );
        }
        window.location.href = data.paymentUrl;
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা। ইন্টারনেট কানেকশন চেক করুন।');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !loading) closeEnroll(); }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-5 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-7 shadow-2xl sm:p-9">
        {!loading && (
          <button
            onClick={closeEnroll}
            aria-label="বন্ধ করুন"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <X size={16} />
          </button>
        )}

        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--seg-accent)/0.3)] bg-[rgb(var(--seg-accent)/0.08)] px-3 py-1 text-xs font-bold uppercase tracking-wider accent-text">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--seg-accent-2))]" /> আজকের অফার · ৳৯৯০
          </span>
          <h2 className="mt-4 text-2xl font-black text-[var(--ink)]">এনরোলমেন্ট শুরু করুন 🚀</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            আপনার নাম ও ফোন নম্বর দিন। পেমেন্টের পর এই নাম্বারে কনফার্মেশন পাবেন এবং এই নাম্বার দিয়েই লগইন করে কোর্স শুরু করবেন।
          </p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {done}
            </div>
            <a href={OTP_URL} className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-extrabold">
              লগইন করুন <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--ink-soft)]">আপনার নাম *</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="যেমন: Rahim Uddin"
                disabled={loading}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:ring-2 focus:ring-[rgb(var(--seg-accent)/0.25)] disabled:opacity-60 ${
                  touched.name && !nameValid ? 'border-red-400' : 'border-[var(--line)] focus:border-[rgb(var(--seg-accent)/0.6)]'
                }`}
              />
              {touched.name && !nameValid && <p className="mt-1.5 text-xs text-red-500">নাম কমপক্ষে ২ অক্ষরের হতে হবে।</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--ink-soft)]">
                ফোন নম্বর * <span className="font-normal text-[var(--ink-muted)]">(01XXXXXXXXX)</span>
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
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:ring-2 focus:ring-[rgb(var(--seg-accent)/0.25)] disabled:opacity-60 ${
                  touched.phone && !phoneValid ? 'border-red-400' : 'border-[var(--line)] focus:border-[rgb(var(--seg-accent)/0.6)]'
                }`}
              />
              {touched.phone && !phoneValid && <p className="mt-1.5 text-xs text-red-500">সঠিক BD নম্বর দিন (যেমন 01712345678)।</p>}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !formValid}
              className="btn-accent mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (<><Loader2 size={18} className="animate-spin" /> সিট সংরক্ষণ হচ্ছে...</>) : (<><Rocket size={18} /> এনরোল করুন</>)}
            </button>
          </form>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--ink-muted)]">
          <Lock size={13} /> আপনার তথ্য নিরাপদ। পেমেন্টের পর এই নম্বর দিয়ে লগইন করতে পারবেন।
        </p>
      </div>
    </div>
  );
}
