'use client';

import { ToggleLeft, ToggleRight } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

export const sg = Space_Grotesk({ subsets: ['latin'] });
export const inter = Inter({ subsets: ['latin'] });

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className={inter.className} style={{ display: 'block', color: '#a1a1aa', fontSize: '0.8125rem', marginBottom: 6, fontWeight: 500 }}>
      {children}
      {hint && <span style={{ color: '#3f3f46', marginLeft: 6 }}>{hint}</span>}
    </label>
  );
}

export function Input({
  value, onChange, placeholder, type = 'text', maxLength, invalid,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={inter.className}
      style={{
        width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${invalid ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 8, color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

export function Textarea({
  value, onChange, placeholder, rows = 4, maxLength, mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={inter.className}
      style={{
        width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
        border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0',
        fontSize: mono ? '0.875rem' : '0.9375rem', outline: 'none', resize: 'vertical',
        boxSizing: 'border-box', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
        lineHeight: 1.5,
      }}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      {checked ? <ToggleRight size={24} color="#6366f1" /> : <ToggleLeft size={24} color="#52525b" />}
      <span className={inter.className} style={{ color: checked ? '#a5b4fc' : '#71717a', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

export const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14, padding: '24px',
};
export const cardTitle: React.CSSProperties = {
  color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', marginBottom: 20,
};
export const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
  borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
};

export function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
