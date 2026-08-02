'use client';

import type { AudienceItem } from '@/app/ai-for-developers/_landing/content';
import { cardAccent, Container, Reveal, SectionHeading } from '../ui';

export function Audience({ heading, items }: { heading: string; items: AudienceItem[] }) {
  return (
    <section id="audience" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="কাদের জন্য">{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card-color h-full p-6 transition-transform duration-300 hover:-translate-y-1" style={cardAccent(i)}>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
                    <item.icon size={22} />
                  </div>
                  <h3 className="min-w-0 font-bold text-white">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
