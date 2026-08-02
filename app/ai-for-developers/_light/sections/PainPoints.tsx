'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { PainPoint } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal, SectionHeading } from '../ui';

export function PainPoints({ heading, items }: { heading: string; items: PainPoint[] }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="চেনা সমস্যা">{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <PainCard item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Desktop shows the pain and its solution together. On mobile the solution is
 * collapsed behind a FAQ-style toggle so the card stays scannable — the pain is
 * always visible, tapping "সমাধান দেখুন" reveals the flip. Desktop force-opens
 * the collapsible region via `md:` overrides, so the toggle state only matters
 * below the `md` breakpoint (where the toggle button is the only control shown).
 */
function PainCard({ item }: { item: PainPoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-soft h-full p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500">✕</span>
        <p className="text-[var(--ink-soft)]">{item.pain}</p>
      </div>

      {/* Desktop: static "সমাধান" label. */}
      <div className="my-4 hidden items-center gap-2 text-xs font-bold uppercase tracking-wider accent-text md:flex">
        <ArrowRight size={14} /> সমাধান
      </div>

      {/* Mobile: tap-to-reveal toggle. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="my-4 flex w-full items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider accent-text md:hidden"
      >
        <span className="flex items-center gap-2">
          <ArrowRight size={14} /> সমাধান দেখুন
        </span>
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Solution: collapsible below `md`, always open at `md` and up. */}
      <div
        className={`grid transition-all duration-300 md:grid-rows-[1fr] md:opacity-100 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full"
              style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
            >
              ✓
            </span>
            <p className="font-medium text-[var(--ink)]">{item.flip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
