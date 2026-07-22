'use client';

import { Space_Grotesk } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });

/** Round student avatar; falls back to a gradient chip with the name's initials. */
export default function Avatar({ name, avatar, size = 32 }: { name: string; avatar?: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundSize: 'cover',
      }}
    >
      {!avatar && (
        <span className={sg.className} style={{ color: 'white', fontWeight: 700, fontSize: size * 0.34 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
