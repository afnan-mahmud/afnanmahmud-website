'use client';

import type { ValueItem } from '@/app/ai-for-developers/_landing/content';
import { cardAccent, Container, Reveal, SectionHeading } from '../ui';

export function WhyBest({ heading, items }: { heading: string; items: ValueItem[] }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="কেন এই কোর্স">{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card-color flex h-full items-start gap-4 p-6 transition-transform duration-300 hover:-translate-y-1" style={cardAccent(i)}>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
                  <item.icon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/85">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
