'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { RefreshCw, MessageCircle } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const REASON_MESSAGES: Record<string, string> = {
  payment_cancelled: 'You cancelled the payment.',
  verification_failed: 'We could not verify your payment. Please contact support if you were charged.',
  insufficient_funds: 'Payment declined due to insufficient balance.',
  invalid_order: 'Invalid order. Please try enrolling again.',
  server_error: 'An unexpected error occurred on our end. Please try again.',
};

function getFriendlyMessage(reason: string): string {
  return REASON_MESSAGES[reason] ?? 'Something went wrong. Please try again.';
}

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'unknown';
  const courseSlug = searchParams.get('course') ?? '';
  const message = getFriendlyMessage(reason);

  const WHATSAPP_URL = 'https://wa.me/8801XXXXXXXXX?text=Payment+failed+for+order+issue';
  const SUPPORT_EMAIL = 'mailto:support@devcourses.bd';

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
        background: 'radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)',
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
        {/* Animated X */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 60px rgba(239,68,68,0.35)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M18 6L6 18M6 6l12 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
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
            Payment Failed
          </h1>

          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              marginBottom: '32px',
            }}
          >
            <p
              className={inter.className}
              style={{ color: '#fca5a5', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}
            >
              {message}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courseSlug && (
              <Link
                href={`/courses/${courseSlug}`}
                className={sg.className}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                  letterSpacing: '0.01em',
                }}
              >
                <RefreshCw size={16} />
                Try Again
              </Link>
            )}
            <a
              href={reason === 'verification_failed' ? SUPPORT_EMAIL : WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={sg.className}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#a1a1aa',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#a5b4fc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
              <MessageCircle size={16} />
              Contact Support
            </a>

            <Link
              href="/"
              className={inter.className}
              style={{ color: '#52525b', fontSize: '0.875rem', textDecoration: 'none', marginTop: '4px' }}
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
