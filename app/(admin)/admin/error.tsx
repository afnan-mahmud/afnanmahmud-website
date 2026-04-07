'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Space_Grotesk, Inter } from 'next/font/google';
import { ShieldAlert } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin error]', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <ShieldAlert size={28} color="#f87171" />
        </div>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Admin Panel Error
        </h1>
        <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 32 }}>
          An error occurred in the admin panel. Please try again or contact support if the issue persists.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            className={sg.className}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem' }}
          >
            Retry
          </button>
          <Link
            href="/admin"
            className={sg.className}
            style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#a1a1aa', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
