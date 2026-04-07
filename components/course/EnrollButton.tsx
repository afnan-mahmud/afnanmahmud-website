'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseThumbnail?: string;
  price: number;
  isFree: boolean;
  totalLessons: number;
  totalSections: number;
  alreadyPurchased: boolean;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  courseThumbnail,
  price,
  isFree,
  totalLessons,
  totalSections,
  alreadyPurchased: initialPurchased,
}: EnrollButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(initialPurchased);

  const handleEnroll = async () => {
    if (status === 'loading') return;

    if (!session) {
      router.push(`/auth/otp?returnUrl=/courses/${courseSlug}`);
      return;
    }

    if (purchased) {
      router.push(`/dashboard/my-courses/${courseSlug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, courseSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Payment initiation failed');
      }

      if (data.alreadyPurchased) {
        setPurchased(true);
        toast.success('You already have access to this course!');
        router.push(`/dashboard/my-courses/${courseSlug}`);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      throw new Error('No payment URL received');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Payment initiation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPurchased = purchased;
  const isLoggedIn = !!session;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Two-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
        }}
        className="enroll-grid"
      >
        {/* Left: Course summary */}
        <div
          style={{
            padding: '32px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
          className="enroll-left"
        >
          {/* Thumbnail */}
          <div
            style={{
              height: 140,
              borderRadius: '12px',
              background: courseThumbnail
                ? `url(${courseThumbnail}) center/cover`
                : 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(34,211,238,0.15))',
              marginBottom: '20px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {!courseThumbnail && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                ⚡
              </div>
            )}
          </div>

          <h3
            className={sg.className}
            style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px', lineHeight: 1.4 }}
          >
            {courseTitle}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: BookOpen, text: `${totalLessons} lessons` },
              { icon: CheckCircle, text: `${totalSections} sections` },
              { icon: CheckCircle, text: 'Lifetime access' },
              { icon: CheckCircle, text: 'Certificate of completion' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                <span className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pricing & action */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            {/* Price */}
            <div style={{ marginBottom: '24px' }}>
              {isFree ? (
                <p className={sg.className} style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4ade80', margin: 0 }}>
                  Free
                </p>
              ) : (
                <div>
                  <p className={sg.className} style={{ fontSize: '2.25rem', fontWeight: 800, color: '#6366f1', margin: 0, letterSpacing: '-0.02em' }}>
                    ৳{price.toLocaleString()}
                  </p>
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', marginTop: '4px' }}>
                    One-time payment · Lifetime access
                  </p>
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />

            {/* Action button */}
            {isPurchased ? (
              <Link
                href={`/dashboard/my-courses/${courseSlug}`}
                className={sg.className}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  boxShadow: '0 0 24px rgba(34,211,238,0.3)',
                }}
              >
                <CheckCircle size={18} />
                Go to Course
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={loading || status === 'loading'}
                className={sg.className}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  background:
                    loading || status === 'loading'
                      ? 'rgba(99,102,241,0.5)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: '10px',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: loading || status === 'loading' ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                  transition: 'box-shadow 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? (
                  <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>
                    {isLoggedIn ? (isFree ? 'Enroll Free' : 'Enroll Now') : 'Login to Enroll'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', textAlign: 'center', marginBottom: '8px' }}>
              Secure payment via EPS | SSL Encrypted
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['EPS', 'SSL', '256-bit'].map((label) => (
                <span
                  key={label}
                  className={sg.className}
                  style={{
                    padding: '3px 8px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    color: '#52525b',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .enroll-grid { grid-template-columns: 1fr !important; }
          .enroll-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); }
        }
      `}</style>
    </div>
  );
}
