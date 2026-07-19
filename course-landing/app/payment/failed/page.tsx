'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, X } from 'lucide-react';

const REASON_LABELS: Record<string, string> = {
  payment_cancelled: 'পেমেন্ট বাতিল করা হয়েছে।',
  verification_failed: 'পেমেন্ট ভেরিফাই করা যায়নি।',
  invalid_order: 'অর্ডারটি খুঁজে পাওয়া যায়নি।',
  server_error: 'সার্ভারে সাময়িক সমস্যা হয়েছে।',
};

function FailedContent() {
  const params = useSearchParams();
  const reason = params.get('reason') ?? 'payment_cancelled';
  const label = REASON_LABELS[reason] ?? 'পেমেন্ট সম্পন্ন হয়নি।';

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_50px_-8px_rgba(244,63,94,0.5)]">
          <X size={44} strokeWidth={3} className="text-white" />
        </div>

        <h1 className="mt-8 text-3xl font-black text-[var(--ink)]">পেমেন্ট সম্পন্ন হয়নি</h1>
        <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">{label} চিন্তার কিছু নেই — আবার চেষ্টা করতে পারেন।</p>

        <a
          href="/"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-7 py-4 text-base font-bold text-[var(--ink)] transition-colors hover:border-[rgb(var(--seg-accent)/0.5)]"
        >
          <RotateCcw size={18} /> আবার চেষ্টা করুন
        </a>
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          টাকা কেটে থাকলেও চিন্তা নেই — আমরা অটোমেটিক ভেরিফাই করে অ্যাক্সেস দিয়ে দেবো।
        </p>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <FailedContent />
    </Suspense>
  );
}
