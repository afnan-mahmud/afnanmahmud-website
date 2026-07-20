'use client';

import { Code2, Globe, Briefcase, Store, Zap } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { Container, Reveal } from '../ui';

// Invariant across all segments — same instructor profile & ventures for every audience.
export function Instructor() {
  const ventures: { name: string; role: string; icon: IconType; desc: string }[] = [
    { name: 'Cholo Bohudur', role: 'Co-Founder', icon: Code2, desc: 'একটি সফটওয়্যার ফার্ম — রিয়েল ক্লায়েন্টের জন্য প্রোডাকশন-গ্রেড সফটওয়্যার তৈরি করা হয়।' },
    { name: 'Gowaay', role: 'Founder', icon: Globe, desc: 'ট্যুর অ্যান্ড ট্রাভেল ইন্ডাস্ট্রির জন্য তৈরি একটি প্রোডাক্ট ও প্ল্যাটফর্ম।' },
    { name: 'Niyoog', role: 'Founder & CTO', icon: Briefcase, desc: 'জব মার্কেট প্রোডাক্ট — প্রোফাইল সাবমিট করলেই বেস্ট-ম্যাচিং জবে অটো CV যায়, আর নিয়োগদাতারা ২৪ ঘন্টায় সেরা এমপ্লয়ি হায়ার করতে পারেন।' },
    { name: 'Sujog', role: 'Founder', icon: Store, desc: 'বাংলাদেশের ই-কমার্সদের জন্য ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপ করার একটি প্ল্যাটফর্ম।' },
  ];

  return (
    <section id="instructor" className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
          <div className="w-full md:w-1/3">
            <Reveal direction="right">
              <div className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-gradient-to-tr from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] opacity-20" />
                {/* Served from the main app's /public on another origin; using
                    next/image here would require remotePatterns config for a
                    single static portrait, so a plain <img> is intentional. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://afnanmahmud.com/mentor.jpeg"
                  alt="Afnan Mahmud — Instructor"
                  className="relative z-10 aspect-square w-full rounded-3xl border border-[var(--line)] object-cover shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 z-20 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 shadow-lg">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                  <span className="text-sm font-bold text-[var(--ink)]">Lead Instructor</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="w-full md:w-2/3">
            <Reveal delay={150} direction="left">
              <p className="text-sm font-bold uppercase tracking-widest accent-text">Meet Your Mentor</p>
              <h2 className="mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">Afnan Mahmud</h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--ink-soft)]">
                দীর্ঘদিন ধরে MERN Stack-এ প্রোডাকশন-গ্রেড অ্যাপ বানাচ্ছি, রিয়েল ক্লায়েন্ট প্রজেক্ট ডেলিভার করছি। এখন AI
                কাজে লাগিয়ে সবচেয়ে দ্রুত ও স্মার্ট ওয়েতে ওয়েব ও মোবাইল অ্যাপ বানাই — ঠিক যা প্রতিদিন করি, সেটাই এই কোর্সে
                স্ক্রিন শেয়ার করে ধাপে ধাপে শেখাবো। শুধু থিওরি নয়, পুরোটাই হাতে-কলমে।
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Code2, title: 'Full-Stack Engineer', sub: 'Building real apps' },
                  { icon: Zap, title: 'AI Workflow Expert', sub: 'Master of Prompts' },
                ].map((s) => (
                  <div key={s.title} className="card-soft flex items-center gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>
                      <s.icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[var(--ink)]">{s.title}</h4>
                      <p className="text-xs text-[var(--ink-muted)]">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <p className="mb-4 text-sm font-bold uppercase tracking-widest accent-text">Founder & Builder Of</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {ventures.map((v) => (
                    <div key={v.name} className="card-soft flex h-full gap-3 p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: 'rgb(var(--seg-accent) / 0.12)', color: 'rgb(var(--seg-accent-2))' }}>
                        <v.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold leading-tight text-[var(--ink)]">{v.name}</h5>
                          <span className="rounded-full border border-[rgb(var(--seg-accent)/0.3)] bg-[rgb(var(--seg-accent)/0.08)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide accent-text">
                            {v.role}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-muted)] [text-wrap:pretty]">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
