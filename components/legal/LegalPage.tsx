import Link from 'next/link';
import { Space_Grotesk, Inter } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'bullets'; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalPageProps = {
  badge: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalPage({ badge, title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div className={inter.className} style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }}>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 0 40px' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <span
            className={sg.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            {badge}
          </span>

          <h1
            className={sg.className}
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 14px',
            }}
          >
            {title}
          </h1>

          <p style={{ color: '#71717a', fontSize: '0.9375rem', margin: '0 0 24px' }}>
            Last updated: {lastUpdated}
          </p>

          <p style={{ color: '#a1a1aa', fontSize: '1.0625rem', lineHeight: 1.75, margin: 0 }}>{intro}</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '8px 0 80px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px' }}>
          {sections.map((section, i) => (
            <div key={i} style={{ marginTop: '40px' }}>
              <h2
                className={sg.className}
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                  margin: '0 0 14px',
                }}
              >
                <span style={{ color: '#6366f1' }}>{String(i + 1).padStart(2, '0')}.</span> {section.heading}
              </h2>
              {section.blocks.map((block, j) =>
                block.type === 'p' ? (
                  <p key={j} style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: 1.8, margin: '0 0 14px' }}>
                    {block.text}
                  </p>
                ) : (
                  <ul key={j} style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
                    {block.items.map((item, k) => (
                      <li
                        key={k}
                        style={{
                          color: '#a1a1aa',
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          padding: '6px 0 6px 24px',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '14px',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#22d3ee',
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))}

          <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              href="/"
              className={sg.className}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#a5b4fc',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
