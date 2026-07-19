'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { useEnroll } from './EnrollContext';

/** Scroll-reveal wrapper (light-theme; ported behavior from the main app). */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children?: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const hidden = () => {
    switch (direction) {
      case 'up': return 'translate-y-8';
      case 'down': return '-translate-y-8';
      case 'left': return 'translate-x-8';
      case 'right': return '-translate-x-8';
      default: return 'translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition duration-700 ${visible ? 'translate-x-0 translate-y-0 opacity-100' : `${hidden()} opacity-0`} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
    >
      {children}
    </div>
  );
}

/** Accent gradient text on a light background. */
export function GradientText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`accent-gradient ${className}`}>{children}</span>;
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  children,
  sub,
  className = '',
}: {
  eyebrow?: string;
  children: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {eyebrow && (
        <span className="inline-block rounded-full border border-[rgb(var(--seg-accent)/0.3)] bg-[rgb(var(--seg-accent)/0.08)] px-3 py-1 text-xs font-bold uppercase tracking-wider accent-text">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-black leading-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
        {children}
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">{sub}</p>}
    </div>
  );
}

/** Primary enroll button — opens the modal. */
export function EnrollButton({ className = '', label = 'এখনই এনরোল করুন' }: { className?: string; label?: string }) {
  const { openEnroll } = useEnroll();
  return (
    <div className={`flex justify-center ${className}`}>
      <button type="button" onClick={openEnroll} className="btn-accent rounded-full px-8 py-3.5 text-base font-extrabold sm:text-lg">
        {label}
      </button>
    </div>
  );
}

/** Light accordion used by the FAQ + curriculum. */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`card-soft overflow-hidden transition-all ${open ? 'border-[rgb(var(--seg-accent)/0.4)]' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-bold text-[var(--ink)]">{title}</span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
        >
          <ChevronDown size={18} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-[var(--ink-soft)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
