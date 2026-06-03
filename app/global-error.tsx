'use client';

import { useEffect } from 'react';

// Root-level boundary: catches errors thrown in the root layout itself.
// It must render its own <html>/<body> because it replaces the whole document.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 32 }}>
            একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem' }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
