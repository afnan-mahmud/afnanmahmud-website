'use client';

import { Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal, SectionHeading } from '../ui';

export function Feedback({ heading, sub, items }: { heading: string; sub: string; items: Testimonial[] }) {
  return (
    <section id="feedback" className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="স্টুডেন্ট ফিডব্যাক" sub={sub}>{heading}</SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <figure className="card-soft flex h-full flex-col p-6">
                <Quote size={26} className="accent-text" />
                <blockquote className="mt-3 grow text-sm leading-relaxed text-[var(--ink-soft)]">
                  {t.text}
                </blockquote>
                <div className="mt-2 flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}>
                    {t.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-[var(--ink)]">{t.name}</div>
                    {t.role && <div className="text-xs text-[var(--ink-muted)]">{t.role}</div>}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
