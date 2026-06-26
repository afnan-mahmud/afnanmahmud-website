'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { trackPixel } from '@/lib/meta-pixel';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get('course') ?? '';
  const courseTitle = searchParams.get('title') ? decodeURIComponent(searchParams.get('title')!) : 'your course';

  const eid = searchParams.get('eid');
  const value = searchParams.get('value');
  const currency = searchParams.get('currency') ?? 'BDT';

  useEffect(() => {
    // Meta Purchase — same eventId as the server CAPI call (dedup).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eid]);

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
      {/* Background glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 60px rgba(34,197,94,0.4)',
          }}
        >
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1
            className={sg.className}
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: '-0.025em',
              marginBottom: '12px',
            }}
          >
            Payment Successful!
          </h1>
          <p
            className={inter.className}
            style={{
              color: '#a1a1aa',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              marginBottom: '36px',
            }}
          >
            You are now enrolled in{' '}
            <span style={{ color: '#4ade80', fontWeight: 600 }}>{courseTitle}</span>.
            Start learning right away!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/auth/otp"
              className={sg.className}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                letterSpacing: '0.01em',
              }}
            >
              Start Learning Now →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
