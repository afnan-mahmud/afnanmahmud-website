'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { trackPixel } from '@/lib/meta-pixel';
import { trackTikTok } from '@/lib/tiktok-pixel';
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
import { trackClarity, upgradeClarity, CLARITY_EVENT } from '@/lib/clarity';

const OTP_URL = 'https://afnanmahmud.com/auth/otp';

function SuccessContent() {
  const params = useSearchParams();
  const courseSlug = params.get('course') ?? '';
  const courseTitle = params.get('title') ? decodeURIComponent(params.get('title')!) : 'আপনার কোর্স';
  const eid = params.get('eid');
  const value = params.get('value');
  const currency = params.get('currency') ?? 'BDT';
  const txn = params.get('txn') ?? undefined;

  useEffect(() => {
    if (!eid) return;
    trackPixel(
      'Purchase',
      {
        value: value ? Number(value) : undefined,
        currency,
        content_ids: courseSlug ? [courseSlug] : undefined,
        content_name: courseTitle,
        content_type: 'product',
      },
      eid
    );
    trackTikTok(
      'CompletePayment',
      {
        contents: courseSlug ? [{ content_id: courseSlug, content_type: 'product', content_name: courseTitle }] : undefined,
        content_type: 'product',
        value: value ? Number(value) : undefined,
        currency,
      },
      eid
    );

    // Advanced matching for GTM/Google Ads — the enroll form stashed the phone
    // before the gateway redirect. Mirrors the main app's success page.
    let phone: string | undefined;
    try {
      const saved = localStorage.getItem('devc_enroll_retry');
      if (saved) {
        const digits = (JSON.parse(saved) as { phone?: string }).phone?.replace(/\D/g, '');
        if (digits) phone = digits.startsWith('88') ? digits : `88${digits}`;
      }
    } catch { /* ignore unavailable/malformed storage */ }

    pushToDataLayer(GTM_EVENT.purchase, {
      content_id: courseSlug || undefined,
      content_name: courseTitle,
      value: value ? Number(value) : undefined,
      currency,
      transaction_id: txn,
      event_id: eid,
      ...(phone ? { user_data: { phone } } : {}),
    });

    // Clarity gets the same conversion, minus the phone — no PII leaves here.
    // `upgrade` keeps every buyer's session recording out of sampling.
    trackClarity(CLARITY_EVENT.purchase, {
      content_id: courseSlug || undefined,
      content_name: courseTitle,
      value: value ?? undefined,
      currency,
      transaction_id: txn,
    });
    upgradeClarity('purchase');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eid]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_50px_-8px_rgba(16,185,129,0.6)]">
          <Check size={44} strokeWidth={3} className="text-white" />
        </div>

        <h1 className="mt-8 text-3xl font-black text-[var(--ink)]">পেমেন্ট সফল হয়েছে! 🎉</h1>
        <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
          আপনি এখন <span className="font-bold text-emerald-600">{courseTitle}</span> কোর্সে এনরোলড।
          শেখা শুরু করতে নিচের বাটনে ক্লিক করুন।
        </p>

        <div className="card-soft mt-8 p-5 text-left">
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            👉 <span className="font-bold text-[var(--ink)]">পরের ধাপ:</span> এনরোলমেন্টে দেওয়া{' '}
            <span className="font-semibold">ফোন নম্বর</span> দিয়ে লগইন করলেই কোর্সটি আনলকড পাবেন —
            কোনো আলাদা পাসওয়ার্ড লাগবে না।
          </p>
        </div>

        <a
          href={OTP_URL}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-4 text-lg font-extrabold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] transition-transform hover:-translate-y-0.5"
        >
          এখনই শেখা শুরু করুন <ArrowRight size={20} />
        </a>

        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          afnanmahmud.com এ লগইন পেজে নিয়ে যাওয়া হবে।
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <SuccessContent />
    </Suspense>
  );
}
