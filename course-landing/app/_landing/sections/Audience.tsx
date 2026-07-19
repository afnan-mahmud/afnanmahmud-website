'use client';

import type { AudienceItem } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal, SectionHeading } from '../ui';

export function Audience({ heading, items }: { heading: string; items: AudienceItem[] }) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="কাদের জন্য">{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card-soft h-full p-6">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl"
                    style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
                  >
                    <item.icon size={22} />
                  </div>
                  <h3 className="font-bold text-[var(--ink)]">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
