'use client';

import { Star, Users, ShieldCheck, PlayCircle } from 'lucide-react';
import type { HeroContent } from '@/app/ai-for-developers/_landing/content';
import { Container, GradientText, Reveal } from '../ui';
import { useEnroll } from '../EnrollContext';

export function Hero({ content, enrolledLabel }: { content: HeroContent; enrolledLabel: string }) {
  const { openEnroll } = useEnroll();
  return (
    <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
      <div className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-[rgb(var(--seg-accent)/0.12)] blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-[rgb(var(--seg-accent-2)/0.12)] blur-[130px]" />

      {/* Concentric circles — radiating accent rings behind the hero content.
          The wrapper is sized to the largest ring so the radial mask (which fades
          the rings toward the edges) has an area to apply over. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] h-[1280px] w-[1280px] -translate-x-1/2 -translate-y-1/2"
        style={{
          maskImage: 'radial-gradient(circle, #000 6%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 6%, transparent 62%)',
        }}
      >
        {[240, 420, 600, 800, 1020, 1280].map((size, i) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: `rgb(var(--seg-accent) / ${Math.max(0.06, 0.22 - i * 0.026)})`,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[rgb(var(--seg-accent)/0.3)] bg-white px-4 py-1.5 text-center text-sm font-semibold leading-snug text-[var(--ink-soft)] shadow-sm">
              <ShieldCheck size={16} className="shrink-0 accent-text" />
              AI-First Web + Mobile App Development — বাংলায়
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-black leading-[1.15] text-[var(--ink)] sm:text-5xl md:text-6xl">
              {content.headlineLead}{' '}
              <GradientText>{content.headlineAccent}</GradientText>
              {content.headlineTrail ? ` ${content.headlineTrail}` : ''}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
              {content.subheadline}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openEnroll}
                className="btn-accent w-full rounded-full px-8 py-4 text-lg font-extrabold sm:w-auto"
              >
                এখনই এনরোল করুন — ৳৯৯০
              </button>
              <a
                href="#journey"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-7 py-4 text-base font-bold text-[var(--ink)] transition-colors hover:border-[rgb(var(--seg-accent)/0.5)] sm:w-auto"
              >
                <PlayCircle size={20} className="accent-text" />
                কোর্স আউটলাইন দেখুন
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </span>
                ৪.৯/৫ রেটিং
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} className="accent-text" />
                <span className="font-bold text-[var(--ink)]">{enrolledLabel}</span> স্টুডেন্ট
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="accent-text" />
                একবার পেমেন্ট, লাইফটাইম অ্যাক্সেস
              </span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
