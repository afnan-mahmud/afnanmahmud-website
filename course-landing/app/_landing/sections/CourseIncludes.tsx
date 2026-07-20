'use client';

import { Layers, Infinity as InfinityIcon, Rocket, Smartphone, Globe, Briefcase } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { Container, GradientText, Reveal, SectionHeading } from '../ui';

/**
 * Course deliverables — what the buyer gets, as opposed to Outcomes (what they
 * learn). Invariant across segments. Every item here maps to a real module in
 * Curriculum.tsx; don't add claims that aren't backed by the curriculum.
 */
const ITEMS: { icon: IconType; title: string; desc: string }[] = [
  {
    icon: Layers,
    title: '৮টি পূর্ণাঙ্গ মডিউল',
    desc: 'AI dev stack সেটআপ থেকে শুরু করে App Store লঞ্চ — পুরো জার্নি ধাপে ধাপে সাজানো।',
  },
  {
    icon: Rocket,
    title: '৩টি রিয়েল প্রজেক্ট',
    desc: 'ই-কমার্স সাইট, ফ্লাইট ট্র্যাকার আর Bikroy-এর মতো একটি পূর্ণাঙ্গ মার্কেটপ্লেস — নিজের হাতে।',
  },
  {
    icon: Smartphone,
    title: 'মোবাইল অ্যাপ + স্টোর লঞ্চ',
    desc: 'মার্কেটপ্লেস প্রজেক্ট থেকেই নেটিভ অ্যাপ বানিয়ে Google Play Store আর Apple App Store-এ পাবলিশ।',
  },
  {
    icon: Globe,
    title: 'লাইভ সার্ভার ডিপ্লয়মেন্ট',
    desc: 'VPS/AWS-এ রিয়েল সার্ভারে ডিপ্লয়, প্রোডাকশন কনফিগ আর GitHub Actions দিয়ে CI/CD।',
  },
  {
    icon: Briefcase,
    title: 'পোর্টফোলিও ও ক্যারিয়ার গাইড',
    desc: 'ডেভেলপার পোর্টফোলিও তৈরি, AI-era জব প্রিপারেশন আর ফ্রিল্যান্স ক্লায়েন্ট ডেলিভারি।',
  },
  {
    icon: InfinityIcon,
    title: 'লাইফটাইম অ্যাক্সেস',
    desc: 'একবার পেমেন্ট, বারবার নয় — সব ভিডিও আর রিসোর্সে আজীবন অ্যাক্সেস।',
  },
];

export function CourseIncludes() {
  return (
    <section id="includes" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="যা যা পাচ্ছেন" sub="একটা কোর্স নয় — শুরু থেকে শিপিং পর্যন্ত পুরো একটা প্যাকেজ।">
          কোর্সে <GradientText>আপনি যা পাচ্ছেন</GradientText>
        </SectionHeading>

        {/* Hairline grid (no card borders), matching the reference layout. */}
        <Reveal>
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-[var(--line)] bg-white sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((item) => (
              <div
                key={item.title}
                className="border-b border-[var(--line)] p-7 text-center last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
              >
                <div
                  className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                  style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
                >
                  <item.icon size={26} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
