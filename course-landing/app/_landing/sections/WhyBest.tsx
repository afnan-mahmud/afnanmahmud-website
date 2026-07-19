'use client';

import type { ValueItem } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal, SectionHeading } from '../ui';

export function WhyBest({ heading, items }: { heading: string; items: ValueItem[] }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="কেন এই কোর্স">{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="panel-accent flex h-full items-start gap-4 p-6">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white"
                  style={{ color: 'rgb(var(--seg-accent-2))' }}
                >
                  <item.icon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
