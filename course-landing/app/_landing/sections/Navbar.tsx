'use client';

import { useEffect, useState } from 'react';
import { useEnroll } from '../EnrollContext';

export function Navbar({ onChangeCategory }: { onChangeCategory?: () => void }) {
  const { openEnroll } = useEnroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'border-b border-[var(--line)] bg-white/85 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <a href="#" className="text-lg font-black text-[var(--ink)]">
          Afnan<span className="accent-text">.</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          {onChangeCategory && (
            <button
              type="button"
              onClick={onChangeCategory}
              className="hidden rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:border-[rgb(var(--seg-accent)/0.5)] sm:inline-flex"
            >
              ক্যাটাগরি পরিবর্তন
            </button>
          )}
          <button
            type="button"
            onClick={openEnroll}
            className="btn-accent rounded-full px-5 py-2.5 text-sm font-bold sm:px-6"
          >
            এনরোল করুন
          </button>
        </div>
      </div>
    </header>
  );
}
