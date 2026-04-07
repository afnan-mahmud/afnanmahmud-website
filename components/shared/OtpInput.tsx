'use client';

import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...value];
    next[index] = char;
    onChange(next);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...value];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? '';
    }
    onChange(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: '48px',
            height: '56px',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(99,102,241,0.4)',
            borderRadius: '10px',
            color: '#e2e8f0',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          className="focus:border-indigo-500"
        />
      ))}
    </div>
  );
}
