'use client';

import { Sparkles, Target, Layers, Code2, Cpu, Zap, Rocket, Globe, Smartphone, Check } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { Accordion, Container, GradientText, Reveal, SectionHeading } from '../ui';

// Invariant across all segments — same 8-module curriculum for every audience.
export function Curriculum() {
  const modules: { title: string; icon: IconType; points: string[] }[] = [
    {
      title: 'The Modern AI Dev Stack Setup',
      icon: Target,
      points: [
        'AI-first mindset — তুমি architect, AI builder',
        'Cursor IDE setup — AI built-in code editor',
        'Node, npm, Git আর dev environment তৈরি',
        'Claude Code — terminal এর AI agent',
        'Gemini free tier integration',
        'AntiGravity agentic workflow এর basics',
      ],
    },
    {
      title: 'Project Architecture & DB Design',
      icon: Layers,
      points: [
        'AI দিয়ে SaaS idea generate আর validate',
        'Feature planning আর PRD (requirements doc) লেখা',
        'ফ্রি AI tool দিয়ে System Design',
        'Gemini দিয়ে Database Schema design',
        'REST API structure আর contract design',
        'AntiGravity দিয়ে project base scaffold',
      ],
    },
    {
      title: 'Frontend Generation with Claude',
      icon: Code2,
      points: [
        'React/Next.js foundations AI এর সাথে',
        'Claude Code দিয়ে reusable UI component',
        'Real-time UI generate-preview-refine loop',
        'Responsive আর mobile-first UI design',
        'State management আর form automation',
        'UI bug fixing আর visual polish',
      ],
    },
    {
      title: 'Backend, Database & Logic Mastery',
      icon: Cpu,
      points: [
        'Robust API আর backend logic scratch থেকে',
        'Database integration আর full CRUD',
        'Gemini দিয়ে database optimization',
        'Frontend আর backend connect',
        'Business logic, validation আর error handling',
        'AntiGravity দিয়ে fast backend development',
      ],
    },
    {
      title: 'Debugging & Version Control (GitHub)',
      icon: Zap,
      points: [
        "The 'Error Loop' — AI error confidently fix",
        'Error log আর stack trace পড়া',
        'AI কে effective feedback দিয়ে fast fix',
        'Git আর GitHub fundamentals',
        'AI project এর জন্য version control workflow',
        'AI দিয়ে code refactoring',
      ],
    },
    {
      title: 'Building the Production SaaS',
      icon: Rocket,
      points: [
        'AntiGravity + Gemini + Claude একসাথে orchestrate',
        'User authentication system (login/signup)',
        'User dashboard বানানো',
        'Zero থেকে production-ready codebase',
        'Security hardening — app যেন কেউ hack করতে না পারে',
        'App কে mobile এর জন্য prepare করা',
      ],
    },
    {
      title: 'Live Server Deployment & Career',
      icon: Globe,
      points: [
        'VPS/AWS এ live server এ deploy',
        'Environment variable আর production config',
        'GitHub Actions দিয়ে CI/CD automation',
        'Developer portfolio বানানো',
        'AI-era developer হিসেবে job preparation',
        'Freelance client delivery secrets',
      ],
    },
    {
      title: 'Mobile App + Play Store & App Store Launch',
      icon: Smartphone,
      points: [
        'Web থেকে native mobile app এর foundation',
        'AI দিয়ে mobile app এর screens বানানো',
        'Native device feature আর phone এ testing',
        'Release build বানানো (APK/AAB আর iOS)',
        'Google Play Store এ app publish',
        'Apple App Store এ app publish',
      ],
    },
  ];

  return (
    <section id="journey" className="bg-white py-16 sm:py-24">
      <Container className="max-w-4xl">
        <SectionHeading
          eyebrow="কোর্স আউটলাইন"
          sub="বোরিং সিলেবাস নয় — ৮টি লেভেল পার করে জিরো থেকে লাইভ ওয়েবসাইট আর পাবলিশ করা মোবাইল অ্যাপ পর্যন্ত নিজের পোর্টফোলিও দাঁড় করান।"
        >
          Production পর্যন্ত আপনার <GradientText>জার্নি</GradientText>
        </SectionHeading>

        <div className="mt-12 space-y-3">
          {modules.map((mod, idx) => (
            <Reveal key={idx} delay={idx * 40}>
              <Accordion
                defaultOpen={idx === 0}
                title={
                  <span className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-black"
                      style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex items-center gap-2">
                      <mod.icon size={16} className="accent-text" /> {mod.title}
                    </span>
                  </span>
                }
              >
                <ul className="mt-1 space-y-2.5">
                  {mod.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="panel-accent mt-12 p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white" style={{ color: 'rgb(var(--seg-accent))' }}>
                <Sparkles size={22} />
              </span>
              <h3 className="text-lg font-black leading-snug text-[var(--ink)] sm:text-xl">
                মনে প্রশ্ন জাগছে — <GradientText>&ldquo;এত কিছু মাত্র ৳৯৯০ টাকায় কীভাবে সম্ভব?&rdquo;</GradientText>
              </h3>
            </div>
            <p className="mt-4 leading-relaxed text-[var(--ink-soft)]">
              বাজারে যেখানে নরমাল কোর্সের দাম ৫–১০ হাজার টাকা, সেখানে আমরা এত কম দামে নিচ্ছি একটাই কারণে —{' '}
              <span className="font-bold text-[var(--ink)]">সবার জন্য এক্সেসিবল করা।</span> দেশের যেকোনো প্রান্ত থেকে একজন
              তরুণ যেন মাত্র ১–২ মাসে মডার্ন টেকনোলজিতে ক্যারিয়ার গড়তে পারে। টাকার জন্য শিখতে পারিনি — এমন যেন কোনো কারণ না হয়।
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
