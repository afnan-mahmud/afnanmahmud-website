'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Space_Grotesk } from 'next/font/google';
import OtpInput from '@/components/shared/OtpInput';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

type Step = 'phone' | 'otp' | 'done';

export default function DeleteAccountPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);

  const handleSendOtp = useCallback(async () => {
    const trimmed = phone.trim();
    if (!/^01[3-9]\d{8}$/.test(trimmed)) {
      toast.error('Valid BD number din (01XXXXXXXXX)');
      return;
    }
    if (!confirmed) {
      toast.error('Age warning ta accept korun');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/delete/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'OTP pathano jayni');
      toast.success('Jodi ei number e account thake, OTP pathano hoyeche.');
      setStep('otp');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'OTP pathano jayni');
    } finally {
      setLoading(false);
    }
  }, [phone, confirmed]);

  const handleConfirm = useCallback(async () => {
    const code = digits.join('');
    if (code.length < 6) {
      toast.error('6-digit OTP din');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/delete/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'OTP bhul othoba expired');
      // Clear any stale session cookie on this device (account is gone now).
      await signOut({ redirect: false }).catch(() => {});
      setStep('done');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete kora jayni');
    } finally {
      setLoading(false);
    }
  }, [digits, phone]);

  const dangerBtn = (disabled: boolean) => ({
    padding: '13px',
    background: disabled ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
    letterSpacing: '0.02em',
    fontFamily: 'inherit',
  });

  return (
    <div
      className={spaceGrotesk.className}
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '112px 16px 64px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '20px',
          backdropFilter: 'blur(18px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              marginBottom: '14px',
              boxShadow: '0 0 28px rgba(239,68,68,0.35)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Account Delete
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.875rem', marginTop: '6px' }}>
            {step === 'phone' && 'Apnar number diye account permanently delete korun'}
            {step === 'otp' && 'Phone e asha 6-digit OTP din'}
            {step === 'done' && 'Kaj shesh'}
          </p>
        </div>

        {step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Warning box */}
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                padding: '14px 16px',
                color: 'rgba(252,165,165,0.95)',
                fontSize: '0.85rem',
                lineHeight: 1.55,
              }}
            >
              <strong>Sotorko:</strong> Account delete korle apnar profile, kena
              course, ebong progress permanently muche jabe. Eta undo kora jabe{' '}
              <strong>na</strong>. This action is permanent and cannot be undone.
            </div>

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
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(203,213,225,0.9)', fontSize: '0.85rem', cursor: 'pointer', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ marginTop: '3px', width: 16, height: 16, accentColor: '#ef4444', flexShrink: 0 }}
              />
              <span>Ami bujhchi eta permanent, undo kora jabe na — ami amar account delete korte chai.</span>
            </label>

            <button
              onClick={handleSendOtp}
              disabled={loading || !confirmed}
              style={dangerBtn(loading || !confirmed)}
            >
              {loading ? 'Pathano hocche…' : 'Delete request — OTP pathao'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <OtpInput value={digits} onChange={setDigits} disabled={loading} />

            <button onClick={handleConfirm} disabled={loading} style={dangerBtn(loading)}>
              {loading ? 'Delete hocche…' : 'Confirm delete'}
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
              ← Number change korun
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.4)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
              Apnar account delete hoye geche.
            </p>
            <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.875rem', margin: 0 }}>
              Your account and its data have been removed.
            </p>
            <Link
              href="/"
              style={{
                marginTop: '6px',
                color: '#6366f1',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Homepage e ferot →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
