'use client';

import type { OutcomeItem } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal, SectionHeading } from '../ui';

export function Outcomes({ heading, sub, items }: { heading: string; sub: string; items: OutcomeItem[] }) {
  return (
    <section id="outcomes" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="যা শিখবেন" sub={sub}>{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card-soft h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
                >
                  <item.icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
