'use client';

import type { FaqItem } from '@/app/ai-for-developers/_landing/content';
import { Accordion, Container, Reveal, SectionHeading } from '../ui';

export function Faq({ heading, items }: { heading: string; items: FaqItem[] }) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="প্রশ্নোত্তর">{heading}</SectionHeading>
        <div className="mt-10 space-y-3">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 40}>
              <Accordion title={item.q} defaultOpen={i === 0}>
                <p className="leading-relaxed">{item.a}</p>
              </Accordion>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
