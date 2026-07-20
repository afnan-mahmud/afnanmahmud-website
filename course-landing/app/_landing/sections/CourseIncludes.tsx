'use client';

import { Layers, Infinity as InfinityIcon, Rocket, Smartphone, Globe, Briefcase } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { cardAccent, Container, GradientText, Reveal, SectionHeading } from '../ui';

/**
 * Course deliverables — what the buyer gets, as opposed to Outcomes (what they
 * learn). Invariant across segments. Every item here maps to a real module in
 * Curriculum.tsx; don't add claims that aren't backed by the curriculum.
 */
const ITEMS: { icon: IconType; title: string; desc: string }[] = [
  {
    icon: Layers,
    title: '৮টি পূর্ণাঙ্গ মডিউল',
    desc: 'AI dev stack সেটআপ থেকে শুরু করে App Store লঞ্চ, পুরো জার্নি ধাপে ধাপে সাজানো।',
  },
  {
    icon: Rocket,
    title: '৩টি রিয়েল প্রজেক্ট',
    desc: 'ই-কমার্স সাইট, ফ্লাইট ট্র্যাকার আর Bikroy-এর মতো একটি পূর্ণাঙ্গ মার্কেটপ্লেস, নিজের হাতে।',
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
    desc: 'একবার পেমেন্ট, বারবার নয়, সব ভিডিও আর রিসোর্সে আজীবন অ্যাক্সেস।',
  },
];

export function CourseIncludes() {
  return (
    <section id="includes" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="যা যা পাচ্ছেন" sub="একটা কোর্স নয়, শুরু থেকে শিপিং পর্যন্ত পুরো একটা প্যাকেজ।">
          কোর্সে <GradientText>আপনি যা পাচ্ছেন</GradientText>
        </SectionHeading>

        {/* Colorful cards. Compact horizontal rows on mobile, centered on desktop. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div
                className="card-color flex h-full flex-row items-center gap-4 p-4 text-left transition-transform duration-300 hover:-translate-y-1 sm:flex-col sm:items-center sm:gap-0 sm:p-6 sm:text-center"
                style={cardAccent(i)}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white sm:h-14 sm:w-14">
                  <item.icon size={24} />
                </div>
                <div className="min-w-0 sm:mt-4">
                  <h3 className="text-base font-bold text-white sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/85 sm:mt-2">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
