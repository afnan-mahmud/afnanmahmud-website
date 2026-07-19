'use client';

import { ArrowRight } from 'lucide-react';
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
              <div className="card-soft h-full p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500">✕</span>
                  <p className="text-[var(--ink-soft)]">{item.pain}</p>
                </div>
                <div className="my-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider accent-text">
                  <ArrowRight size={14} /> সমাধান
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>✓</span>
                  <p className="font-medium text-[var(--ink)]">{item.flip}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
