'use client';

import {
  Terminal, Cpu, Brain, Code2, Layout, Server, Layers,
  Smartphone, GitBranch, Cloud, ShieldCheck,
} from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { cardAccent, Container, EnrollButton, GradientText, Reveal, SectionHeading } from '../ui';

/**
 * The single tools/tech section. This absorbed the whole of the old DevStack
 * section: CORE keeps its three explained AI tools, ITEMS is the stack grid.
 * Nothing else on the landing should list the stack again.
 */
const CORE: { name: string; tag: string; icon: IconType; desc: string }[] = [
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
    desc: 'টার্মিনালের পাওয়ারফুল AI এজেন্ট, অনেকটা একজন জুনিয়র ডেভেলপারের মতো। অফিস বা ক্লায়েন্টের কাজে খুবই দরকারি।',
  },
  {
    name: 'Google AI Studio',
    tag: 'Planning & Reasoning',
    icon: Brain,
    desc: 'Google-এর ফ্রি মডেল কোড এডিটরের সাথে কানেক্ট করে এডিটরকে আরও পাওয়ারফুল করি। ডেটাবেস ও সিস্টেম ডিজাইন-এ Gemini সেরা রেজাল্ট দেয়।',
  },
];

const ITEMS: { name: string; icon: IconType }[] = [
  { name: 'JavaScript & TypeScript', icon: Code2 },
  { name: 'React + Next.js', icon: Layout },
  { name: 'Node.js', icon: Server },
  { name: 'MongoDB', icon: Layers },
  { name: 'React Native (Expo)', icon: Smartphone },
  { name: 'Git & GitHub', icon: GitBranch },
  { name: 'VPS / AWS Deploy', icon: Cloud },
  { name: 'Security Hardening', icon: ShieldCheck },
];

export function ToolsTech() {
  return (
    <section id="tools" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="টুলস ও টেকনোলজি" sub="মাত্র ৩টি মূল AI টুল দিয়েই পুরো ওয়ার্কফ্লো চলবে, আর নিচে দেখুন কোন স্ট্যাকে কোড করবেন।">
          যেসব <GradientText>টুলস ও টেকনোলজি</GradientText> শিখবেন
        </SectionHeading>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((s, i) => (
            <Reveal key={s.name} delay={i * 80}>
              <div className="card-color h-full p-6 transition-transform duration-300 hover:-translate-y-1" style={cardAccent(i)}>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
                    <s.icon size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight text-white">{s.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">{s.tag}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/85">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <h3 className="mt-16 text-center text-2xl font-black text-[var(--ink)] sm:text-3xl">
            কোন <GradientText>স্ট্যাকে</GradientText> কোড করবেন?
          </h3>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal key={item.name} delay={i * 40}>
              <div className="flex h-full flex-col items-center justify-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 text-center transition-transform duration-300 hover:-translate-y-1">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white"
                  style={{ color: 'rgb(var(--seg-accent-2))' }}
                >
                  <item.icon size={24} />
                </div>
                <span className="text-sm font-bold leading-snug text-[var(--ink)]">{item.name}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <EnrollButton className="mt-12" />
      </Container>
    </section>
  );
}
