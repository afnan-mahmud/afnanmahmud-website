'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Space_Grotesk } from 'next/font/google';
import OtpInput from '@/components/shared/OtpInput';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

const RESEND_SECONDS = 120;

function OtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (step !== 'otp') return;
    setCountdown(RESEND_SECONDS);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendOtp = useCallback(async () => {
    const trimmed = phone.trim();
    if (!/^01[3-9]\d{8}$/.test(trimmed)) {
      toast.error('Enter a valid BD phone number (01XXXXXXXXX)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to send OTP');
      toast.success('OTP sent to ' + trimmed);
      setAnimating(true);
      setTimeout(() => { setStep('otp'); setAnimating(false); }, 350);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const handleVerify = useCallback(async () => {
    const code = digits.join('');
    if (code.length < 6) {
      toast.error('Enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        phone: phone.trim(),
        otp: code,
        redirect: false,
      });
      if (res?.error) throw new Error('Wrong OTP or OTP expired');
      toast.success('Verified! Redirecting…');
      router.push(returnUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [digits, phone, router, returnUrl]);

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    setDigits(Array(6).fill(''));
    await handleSendOtp();
  }, [countdown, handleSendOtp]);

  return (
    <div
      className={spaceGrotesk.className}
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating orbs */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          animation: 'orb1 8s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '12%',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
          animation: 'orb2 11s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '55%',
          left: '60%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          animation: 'orb3 14s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes orb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, 60px) scale(1.1); } }
        @keyframes orb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px, -40px) scale(1.08); } }
        @keyframes orb3 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px, 50px) scale(0.95); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-18px); } }
      `}</style>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 16px',
          padding: '40px 36px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          backdropFilter: 'blur(18px)',
          animation: animating ? 'fadeSlideOut 0.35s ease forwards' : 'fadeSlideIn 0.45s ease both',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              marginBottom: '14px',
              boxShadow: '0 0 28px rgba(99,102,241,0.4)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1
            style={{
              color: '#f1f5f9',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Afnan Mahmud
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.875rem', marginTop: '4px' }}>
            {step === 'phone' ? 'Sign in with your phone number' : 'Enter the 6-digit OTP'}
          </p>
        </div>

        {step === 'phone' ? (
          /* ── STEP A: Phone entry ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="phone"
                style={{ display: 'block', color: 'rgba(148,163,184,0.9)', fontSize: '0.8125rem', marginBottom: '8px', letterSpacing: '0.03em' }}
              >
                PHONE NUMBER
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                maxLength={11}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                }}
                className="focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                padding: '13px',
                background: loading
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        ) : (
          /* ── STEP B: OTP entry ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <OtpInput value={digits} onChange={setDigits} disabled={loading} />

            {/* Countdown */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(148,163,184,0.7)', margin: 0 }}>
              {countdown > 0 ? (
                <>Resend OTP in <span style={{ color: '#6366f1', fontWeight: 600 }}>{formatCountdown(countdown)}</span></>
              ) : (
                <button
                  onClick={handleResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </p>

            <button
              onClick={handleVerify}
              disabled={loading}
              style={{
                padding: '13px',
                background: loading
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <button
              onClick={() => { setStep('phone'); setDigits(Array(6).fill('')); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(148,163,184,0.6)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              ← Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <OtpPageContent />
    </Suspense>
  );
}
