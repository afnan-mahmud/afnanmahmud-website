'use client';

import { ArrowRight } from 'lucide-react';
import type { SegmentKey } from '@/app/ai-for-developers/_landing/theme';
import { SEGMENT_THEMES } from '@/app/ai-for-developers/_landing/theme';
import { GATE_SEGMENTS } from './segments';

/**
 * Full-screen audience picker shown before any landing content. The visitor
 * MUST choose one of five categories; the landing is not reachable until then.
 */
export function CategoryGate({ onChoose }: { onChoose: (key: SegmentKey) => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      {/* soft ambient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-16">
        <header className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--ink-soft)] shadow-sm">
            🎯 শুরু করার আগে একটা প্রশ্ন
          </span>
          <h1 className="mt-6 text-3xl font-black leading-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
            আপনি নিজেকে কোন ক্যাটাগরিতে দেখেন?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--ink-soft)] sm:text-lg">
            আপনার উত্তর অনুযায়ী আমরা আপনার জন্য সবচেয়ে রিলেভেন্ট কোর্স অভিজ্ঞতাটা
            সাজিয়ে দেবো। একটা বেছে নিন 👇
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GATE_SEGMENTS.map((seg) => {
            const t = SEGMENT_THEMES[seg.key];
            return (
              <button
                key={seg.key}
                type="button"
                onClick={() => onChoose(seg.key)}
                style={{
                  ['--seg-accent' as string]: t.accent,
                  ['--seg-accent-2' as string]: t.accent2,
                }}
                className="group flex flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(150deg,rgb(var(--seg-accent)),rgb(var(--seg-accent-2)))] p-4 text-left text-white shadow-[0_14px_34px_-14px_rgb(var(--seg-accent-2)/0.6)] outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_-14px_rgb(var(--seg-accent-2)/0.75)] focus-visible:ring-2 focus-visible:ring-white/70 sm:flex-col sm:items-start sm:p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl sm:h-12 sm:w-12">
                  {seg.emoji}
                </span>
                <span className="text-base font-extrabold text-white sm:text-lg">
                  {seg.title}
                </span>
                {/* Mobile: arrow pinned to the right of the row */}
                <ArrowRight size={18} className="ml-auto shrink-0 opacity-80 sm:hidden" />
                {/* Desktop: reveal-on-hover CTA line */}
                <span className="mt-1 hidden items-center gap-1.5 text-sm font-bold text-white opacity-80 transition-opacity duration-200 group-hover:opacity-100 sm:inline-flex">
                  এই পথে এগোই <ArrowRight size={15} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--ink-muted)]">
          পরে যেকোনো সময় ক্যাটাগরি পরিবর্তন করতে পারবেন।
        </p>
      </div>
    </main>
  );
}
