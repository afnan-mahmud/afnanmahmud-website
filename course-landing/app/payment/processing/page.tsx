'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type StatusResponse = {
  status: 'pending' | 'success' | 'failed';
  course?: string;
  title?: string;
  eid?: string;
  value?: number;
  currency?: string;
  txn?: string;
  reason?: string;
};

function ProcessingContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [tries, setTries] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    if (!orderId) {
      window.location.replace('/payment/failed?reason=invalid_order');
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      if (stopped.current) return;
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = (await res.json()) as StatusResponse;

        if (data.status === 'success') {
          stopped.current = true;
          const sp = new URLSearchParams();
          if (data.course) sp.set('course', data.course);
          if (data.title) sp.set('title', data.title);
          if (data.eid) sp.set('eid', data.eid);
          if (data.value != null) sp.set('value', String(data.value));
          if (data.currency) sp.set('currency', data.currency);
          if (data.txn) sp.set('txn', data.txn);
          window.location.replace(`/payment/success?${sp.toString()}`);
          return;
        }
        if (data.status === 'failed') {
          stopped.current = true;
          window.location.replace(`/payment/failed?reason=${data.reason ?? 'verification_failed'}`);
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      setTries((t) => t + 1);
      timer = setTimeout(poll, 3000);
    }

    poll();
    return () => {
      stopped.current = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-5 py-16">
      <div className="w-full max-w-md text-center">
        <Loader2 size={48} className="mx-auto animate-spin accent-text" />
        <h1 className="mt-8 text-2xl font-black text-[var(--ink)]">পেমেন্ট ভেরিফাই হচ্ছে…</h1>
        <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
          একটু অপেক্ষা করুন — আমরা আপনার পেমেন্ট কনফার্ম করছি। এই পেজ থেকে চলে যাবেন না।
        </p>
        {tries > 6 && (
          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            একটু বেশি সময় লাগছে। টাকা কেটে থাকলে চিন্তা নেই — অ্যাক্সেস অটোমেটিক দিয়ে দেওয়া হবে।
          </p>
        )}
      </div>
    </main>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <ProcessingContent />
    </Suspense>
  );
}
