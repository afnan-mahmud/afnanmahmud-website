'use client';

import { Check, Clock, Infinity as InfinityIcon } from 'lucide-react';
import { Container, GradientText, Reveal, SectionHeading } from '../ui';
import { useEnroll } from '../EnrollContext';

const VALUE_ITEMS: { label: string; price: string }[] = [
  { label: 'Architecture & Fundamentals', price: '১০,০০০৳' },
  { label: 'Database Design Masterclass', price: '৫,০০০৳' },
  { label: 'Server Management & Cloud Deploy', price: '৩,০০০৳' },
  { label: 'Frontend, Backend & Mobile App', price: '১২,০০০৳+' },
];

export function PricingAnchor() {
  const { openEnroll } = useEnroll();
  return (
    <section id="pricing" className="bg-white py-16 sm:py-24">
      <Container className="max-w-2xl">
        <SectionHeading
          eyebrow="আজকের অফার"
          sub="বাজারে এই টপিকগুলো আলাদা করে কিনতে গেলে আপনার খরচ হতো:"
        >
          এই কোর্সে কী কী পাচ্ছেন, আর তার <GradientText>আসল মূল্য কত?</GradientText>
        </SectionHeading>

        <Reveal>
          <div className="panel-accent mt-10 p-7 sm:p-9">
            <ul className="space-y-3">
              {VALUE_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-3">
                  <span className="flex items-center gap-2 text-[var(--ink-soft)]">
                    <Check size={16} className="accent-text" /> {item.label}
                  </span>
                  <span className="shrink-0 text-[var(--ink-muted)] line-through">{item.price}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between font-bold text-[var(--ink)]">
              <span>টোটাল মার্কেট ভ্যালু</span>
              <span className="text-lg text-[var(--ink-muted)] line-through">~৩০,০০০৳</span>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold text-[var(--ink-soft)]">কিন্তু আপনার জন্য আজকের অফার!</p>
              <div className="mt-1 text-5xl font-black accent-gradient sm:text-6xl">৯৯৯৳</div>

              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-[var(--ink-soft)] sm:flex-row sm:gap-6">
                <span className="inline-flex items-center gap-1.5">
                  <InfinityIcon size={16} className="accent-text" /> লাইফটাইম অ্যাক্সেস
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} className="accent-text" /> একবার পেমেন্ট, বারবার নয়
                </span>
              </div>

              <button
                type="button"
                onClick={openEnroll}
                className="btn-accent mt-7 w-full rounded-full px-8 py-4 text-lg font-extrabold"
              >
                👉 অফারটি এখনই নিন
              </button>
              <p className="mt-3 text-xs text-[var(--ink-muted)]">⏳ সীমিত সময়ের অফার — দাম যেকোনো সময় বাড়তে পারে।</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
