'use client';

import type { CtaBannerContent } from '@/app/ai-for-developers/_landing/content';
import { Container, GradientText } from '../ui';
import { useEnroll } from '../EnrollContext';

export function CtaBanner({ content }: { content: CtaBannerContent }) {
  const { openEnroll } = useEnroll();
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="panel-accent relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[rgb(var(--seg-accent-2)/0.15)] blur-[90px]" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-2xl font-black leading-tight text-[var(--ink)] sm:text-4xl">
              {content.headlineLead} <GradientText>{content.headlineAccent}</GradientText>
              {content.headlineTrail ? ` ${content.headlineTrail}` : ''}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--ink-soft)]">{content.sub}</p>
            <button
              type="button"
              onClick={openEnroll}
              className="btn-accent mt-8 rounded-full px-9 py-4 text-lg font-extrabold"
            >
              এখনই এনরোল করুন — ৳৯৯০
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
