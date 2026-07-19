import { Terminal, Cpu, Brain, Code2, Layout, Server, Layers, Smartphone, Globe } from 'lucide-react';
import { Reveal, GradientText, EnrollButton } from '../../LandingClient';
import type { IconType } from '../content';

// Invariant across all segments — same AI dev stack + tech stack for every audience.
export function DevStack() {
  const stack: { name: string; tag: string; icon: IconType; desc: string }[] = [
    {
      name: "Cursor & Antigravity IDE",
      tag: "Code Editor",
      icon: Terminal,
      desc: "এই দুটো হবে আমাদের মূল কোড এডিটর, যার ভেতরে AI সেটআপ করবো। এখানেই আমরা প্রজেক্ট বানাবো তারপর ফোল্ডার এবং ফাইল তৈরি করে আমাদের কোড লিখবো"
    },
    {
      name: "Claude Code",
      tag: "AI Agent",
      icon: Cpu,
      desc: "এটা টার্মিনালের পাওয়ারফুল AI এজেন্ট। অনেকটা একজন জুনিয়র ডেভেলপারের মতো। অফিস বা ক্লাইন্টের কাজ করার জন্য এটা খুবই দরকারি একটা জিনিস"
    },
    {
      name: "Google AI Studio",
      tag: "Planning & Reasoning",
      icon: Brain,
      desc: "Google-এর ফ্রি মডেলগুলো আমরা কোড এডিটরের সাথে কানেক্ট করে আমাদের কোড এডিটরকে আমরা আরো অনেক বেশি পাওয়ারফুল করে তুলি। ডেটাবেস ডিজাইন, সিস্টেম ডিজাইন আর প্ল্যানিং-এর মতো কাজে সবচেয়ে ভালো রেজাল্ট দেয় Google এর Gemini এর মডেল গুলো।"
    }
  ];

  const tech: { name: string; role: string; icon: IconType }[] = [
    { name: "JavaScript & TypeScript", role: "মূল প্রোগ্রামিং ভাষা — পুরো প্রজেক্ট এতেই হবে", icon: Code2 },
    { name: "React + Next.js", role: "ওয়েবসাইটের ফ্রন্টএন্ড (যা ইউজার চোখে দেখে)", icon: Layout },
    { name: "Node.js", role: "ব্যাকএন্ড আর সার্ভার-সাইড লজিক", icon: Server },
    { name: "MongoDB (Database)", role: "সব ডেটা সেভ আর ম্যানেজ করার জায়গা", icon: Layers },
    { name: "React Native (Expo)", role: "একই প্রজেক্ট থেকে মোবাইল অ্যাপ", icon: Smartphone },
    { name: "Git & GitHub", role: "কোড সেভ, ভার্সন কন্ট্রোল আর ডিপ্লয়", icon: Globe },
  ];

  return (
    <section className="py-24 relative overflow-hidden border-t border-slate-800/50">
      <div
        className="absolute left-1/4 top-1/3 w-80 h-80 rounded-full blur-[110px] pointer-events-none"
        style={{ background: 'rgb(var(--seg-accent) / 0.1)' }}
      ></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border"
              style={{
                background: 'rgb(var(--seg-accent) / 0.2)',
                color: 'rgb(var(--seg-accent))',
                borderColor: 'rgb(var(--seg-accent) / 0.3)',
                boxShadow: '0 0 20px rgb(var(--seg-accent) / 0.2)',
              }}
            >
              <Terminal size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              আপনার <GradientText>AI Dev Stack</GradientText>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              মাত্র ৪টি টুল। নিচে দেখুন কোন টুল কোন কাজে লাগে, আর এই কোর্সে আপনি ঠিক কোন প্রোগ্রামিং ভাষা ও টেকনোলজিতে কোড করবেন
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {stack.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="glass-panel p-7 rounded-2xl border border-slate-800 hover:border-[rgb(var(--seg-accent)/0.5)] hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:bg-[rgb(var(--seg-accent)/0.1)] group-hover:scale-110 transition-all duration-300" style={{ color: 'rgb(var(--seg-accent))' }}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{s.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--seg-accent-2))' }}>{s.tag}</span>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Programming languages & tech stack */}
        <Reveal delay={150}>
          <div className="mt-20 text-center mb-12">
            <h3 className="text-2xl md:text-4xl font-black mb-4 text-white">
              কোন <GradientText>ভাষায়</GradientText> কোড করবেন?
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              AI কোড লিখে দেবে ঠিকই, কিন্তু আপনি প্রতিটা ধাপে বুঝবেন কী হচ্ছে। নিচের ভাষা ও টেকনোলজিগুলো এই কোর্সে হাতে-কলমে শিখবেন — আগে থেকে জানা না থাকলেও সমস্যা নেই।
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tech.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-[rgb(var(--seg-accent-2)/0.5)] hover:-translate-y-1 transition-all duration-300 group flex items-center gap-4 h-full">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--seg-accent-2)/0.1)] group-hover:scale-110 transition-all duration-300" style={{ color: 'rgb(var(--seg-accent-2))' }}>
                  <t.icon size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">{t.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="text-center text-slate-500 text-sm mt-10 max-w-2xl mx-auto">
            <span className="font-semibold" style={{ color: 'rgb(var(--seg-accent))' }}>এক কথায়:</span> JavaScript ও TypeScript-ই মূল ভাষা। ফ্রন্টএন্ডে React/Next.js, ব্যাকএন্ডে Node.js, ডেটার জন্য MongoDB, আর মোবাইল অ্যাপের জন্য React Native।
          </p>
        </Reveal>

        <EnrollButton className="mt-12" />
      </div>
    </section>
  );
}
