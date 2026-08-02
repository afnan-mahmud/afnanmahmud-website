'use client';

import { Laptop, Wifi, HardDrive, Clock, GraduationCap, HeartHandshake } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { cardAccent, Container, GradientText, Reveal, SectionHeading } from '../ui';

/**
 * Entry requirements — an objection-handler placed just before pricing.
 * Kept deliberately non-committal about prior programming skill: the landing is
 * also served to the `beginner` segment.
 */
const ITEMS: { icon: IconType; label: string }[] = [
  { icon: Laptop, label: 'ল্যাপটপ বা ডেস্কটপ (মিনিমাম ৮ জিবি র‍্যাম)' },
  { icon: HardDrive, label: 'অন্তত ২৫৬ জিবি স্টোরেজ' },
  { icon: Wifi, label: 'মোটামুটি স্থিতিশীল ইন্টারনেট কানেকশন' },
  { icon: GraduationCap, label: 'প্রোগ্রামিং জানা থাকলে ভালো, না জানলেও শুরু করা যাবে' },
  { icon: Clock, label: 'নিয়মিত সময় দেওয়ার মতো রুটিন' },
  { icon: HeartHandshake, label: 'লেগে থাকার মানসিকতা' },
];

export function Requirements() {
  return (
    <section id="requirements" className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="শুরু করার আগে" sub="খুব ভারী কিছু লাগবে না, এই কয়েকটা থাকলেই আপনি শুরু করতে পারবেন।">
          কী কী <GradientText>থাকতে হবে</GradientText>
        </SectionHeading>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.label} delay={i * 60}>
              <div className="card-color flex h-full items-center gap-4 p-5 transition-transform duration-300 hover:-translate-y-1" style={cardAccent(i)}>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
                  <item.icon size={22} />
                </div>
                <span className="text-sm font-bold leading-snug text-white">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
