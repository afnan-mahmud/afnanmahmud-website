// components/home/TrustedBy.tsx
'use client';

import { Space_Grotesk } from 'next/font/google';
import { COMPANIES } from '@/lib/home-data';

const sg = Space_Grotesk({ subsets: ['latin'] });

export default function TrustedBy() {
  const row = [...COMPANIES, ...COMPANIES, ...COMPANIES];
  return (
    <section style={{ background: '#0a0a0a', padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <p className={sg.className} style={{ textAlign: 'center', color: '#52525b', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 28 }}>
        Building products for &amp; with
      </p>
      <div style={{ display: 'flex', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)' }}>
        <div style={{ display: 'flex', gap: 64, animation: 'marqueeMove 24s linear infinite', whiteSpace: 'nowrap', paddingLeft: 32 }}>
          {row.map((c, i) => (
            <span key={i} className={sg.className} style={{ color: '#71717a', fontSize: '1.5rem', fontWeight: 700, opacity: 0.7 }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marqueeMove { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
    </section>
  );
}
