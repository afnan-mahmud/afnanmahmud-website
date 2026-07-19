'use client';

import { Terminal, Cpu, Brain, Code2, Layout, Server, Layers, Smartphone, Globe } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { Container, EnrollButton, GradientText, Reveal, SectionHeading } from '../ui';

// Invariant across all segments — same AI dev stack + tech stack for every audience.
export function DevStack() {
  const stack: { name: string; tag: string; icon: IconType; desc: string }[] = [
    {
      name: 'Cursor & Antigravity IDE',
      tag: 'Code Editor',
      icon: Terminal,
      desc: 'এই দুটো হবে আমাদের মূল কোড এডিটর, যার ভেতরে AI সেটআপ করবো। এখানেই প্রজেক্ট বানিয়ে ফোল্ডার-ফাইল তৈরি করে কোড লিখবো।',
    },
    {
      name: 'Claude Code',
      tag: 'AI Agent',
      icon: Cpu,
      desc: 'টার্মিনালের পাওয়ারফুল AI এজেন্ট — অনেকটা একজন জুনিয়র ডেভেলপারের মতো। অফিস বা ক্লায়েন্টের কাজে খুবই দরকারি।',
    },
    {
      name: 'Google AI Studio',
      tag: 'Planning & Reasoning',
      icon: Brain,
      desc: 'Google-এর ফ্রি মডেল কোড এডিটরের সাথে কানেক্ট করে এডিটরকে আরও পাওয়ারফুল করি। ডেটাবেস ও সিস্টেম ডিজাইন-এ Gemini সেরা রেজাল্ট দেয়।',
    },
  ];

  const tech: { name: string; role: string; icon: IconType }[] = [
    { name: 'JavaScript & TypeScript', role: 'মূল প্রোগ্রামিং ভাষা — পুরো প্রজেক্ট এতেই হবে', icon: Code2 },
    { name: 'React + Next.js', role: 'ওয়েবসাইটের ফ্রন্টএন্ড (যা ইউজার দেখে)', icon: Layout },
    { name: 'Node.js', role: 'ব্যাকএন্ড আর সার্ভার-সাইড লজিক', icon: Server },
    { name: 'MongoDB (Database)', role: 'সব ডেটা সেভ আর ম্যানেজ করার জায়গা', icon: Layers },
    { name: 'React Native (Expo)', role: 'একই প্রজেক্ট থেকে মোবাইল অ্যাপ', icon: Smartphone },
    { name: 'Git & GitHub', role: 'কোড সেভ, ভার্সন কন্ট্রোল আর ডিপ্লয়', icon: Globe },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="আপনার টুলস" sub="মাত্র ৩টি মূল AI টুল, আর নিচে দেখুন এই কোর্সে কোন প্রোগ্রামিং ভাষা ও টেকনোলজিতে কোড করবেন।">
          আপনার <GradientText>AI Dev Stack</GradientText>
        </SectionHeading>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card-soft h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>
                    <s.icon size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight text-[var(--ink)]">{s.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider accent-text">{s.tag}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <h3 className="mt-16 text-center text-2xl font-black text-[var(--ink)] sm:text-3xl">
            কোন <GradientText>ভাষায়</GradientText> কোড করবেন?
          </h3>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tech.map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="card-soft flex h-full items-center gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'rgb(var(--seg-accent-2) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>
                  <t.icon size={22} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold leading-tight text-[var(--ink)]">{t.name}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <EnrollButton className="mt-12" />
      </Container>
    </section>
  );
}
