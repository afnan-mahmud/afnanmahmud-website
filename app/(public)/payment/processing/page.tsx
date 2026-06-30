'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 24; // ~72s of polling before we stop and show a soft notice

interface StatusResponse {
  status: 'success' | 'failed' | 'pending';
  course?: string;
  title?: string;
  eid?: string;
  value?: number;
  currency?: string;
  txn?: string;
}

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const courseSlug = searchParams.get('course') ?? '';
  const [timedOut, setTimedOut] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!orderId) {
      router.replace('/payment/failed?reason=invalid_order');
      return;
    }

    cancelled.current = false;
    let attempts = 0;

    const poll = async () => {
      if (cancelled.current) return;
      attempts += 1;
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`, {
          cache: 'no-store',
        });
        const data = (await res.json()) as StatusResponse;

        if (cancelled.current) return;

        if (data.status === 'success') {
          const params = new URLSearchParams();
          if (data.course) params.set('course', data.course);
          if (data.title) params.set('title', data.title);
          if (data.eid) params.set('eid', data.eid);
          if (data.value != null) params.set('value', String(data.value));
          if (data.currency) params.set('currency', data.currency);
          if (data.txn) params.set('txn', data.txn);
          router.replace(`/payment/success?${params.toString()}`);
          return;
        }

        if (data.status === 'failed') {
          const slug = data.course ?? courseSlug;
          router.replace(`/payment/failed?reason=verification_failed${slug ? `&course=${slug}` : ''}`);
          return;
        }
      } catch {
        // network blip — fall through and retry
      }

      if (attempts >= MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }
      if (!cancelled.current) setTimeout(poll, POLL_INTERVAL_MS);
    };

    const t = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled.current = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const WHATSAPP_URL =
    'https://wa.me/8801791225000?text=Payment+verification+taking+long+for+my+order';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {!timedOut ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: 72,
                height: 72,
                margin: '0 auto 32px',
                borderRadius: '50%',
                border: '4px solid rgba(99,102,241,0.2)',
                borderTopColor: '#8b5cf6',
              }}
            />
            <h1
              className={sg.className}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.025em',
                marginBottom: 12,
              }}
            >
              Confirming your payment…
            </h1>
            <p
              className={inter.className}
              style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: 1.6 }}
            >
              This usually takes a few seconds. Please don’t close or refresh this page —
              we’re verifying your transaction with the payment gateway.
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                margin: '0 auto 32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
              }}
            >
              ⏳
            </div>
            <h1
              className={sg.className}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.025em',
                marginBottom: 12,
              }}
            >
              Still verifying…
            </h1>
            <p
              className={inter.className}
              style={{ color: '#a1a1aa', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 28 }}
            >
              Your payment is taking a little longer to confirm. If you were charged, don’t
              worry — your course will be unlocked automatically once it clears, and you’ll get
              a confirmation SMS. You can safely close this page.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={sg.className}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#a1a1aa',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                }}
              >
                Contact Support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <PaymentProcessingContent />
    </Suspense>
  );
}
