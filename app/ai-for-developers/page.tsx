import type { Metadata } from 'next';
import { type ComponentType } from 'react';
import Image from 'next/image';
import { CheckCircle2, XCircle, Code, Code2, Sparkles, Cpu, Layers, Zap, Brain, Terminal, Briefcase, Globe, MonitorPlay, Send, AtSign, Mail, Layout, Smartphone, Server } from 'lucide-react';
import { EnrollProvider } from './EnrollContext';
import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import {
  Reveal,
  GradientText,
  Navbar,
  HeroSection,
  CurriculumJourney,
  CtaBanner,
  PricingNeon,
  FAQDark,
} from './LandingClient';

type IconType = ComponentType<{ size?: number | string; className?: string }>;

const COURSE_SLUG = 'ai-for-developers';
const COURSE_PRICE = 990;

const globalStyles = `
  html {
    scroll-behavior: smooth;
    background-color: #020617; /* slate-950 */
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite;
  }
  .animate-pulse-glow {
    animation: pulseGlow 5s ease-in-out infinite;
  }
  .animate-marquee {
    animation: marquee 25s linear infinite;
  }
  .neon-border {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1);
  }
  .neon-border-pink {
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.1);
  }
  .glass-panel {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalSlideIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

export const metadata: Metadata = {
  title: 'AI for Developers — টিউটোরিয়াল হেল থেকে প্রোডাকশন অ্যাপ | Afnan Mahmud',
  description:
    'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ, জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত। ৮ মডিউল, ৪০+ লেসন, ৫টি রিয়েল প্রজেক্ট।',
  openGraph: {
    title: 'AI for Developers — Afnan Mahmud',
    description:
      'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত।',
    type: 'website',
  },
};

export default function AiForDevelopersPage() {
  return (
    <EnrollProvider>
    <div className="min-h-screen font-sans bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{globalStyles}</style>

      <ViewContentTracker
        contentId={COURSE_SLUG}
        contentName="AI for Developers"
        value={COURSE_PRICE}
        currency="BDT"
      />

      {/* Dark Cyber Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]"></div>
      </div>

      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        <PainPointSection />
        <CtaBanner
          headline={<>পুরোনো নিয়মে আর কত? <GradientText>Smart way</GradientText>-তে Software Development শুরু করুন।</>}
          sub="AI হবে আপনার Assistant Programmer, আর আপনি হবেন একজন Software Architecture। আপনি System এবং Database ডিজাইন করবেন, Backend API Structure এবং Contract ডিজাইন করবেন Even এগুলোও আবার একটা AI কে দিয়ে করিয়ে নিবেন তারপর AI কে দিয়ে আপনি Code লিখাবেন।"
        />
        <WhyAIWorkflow />
        <DevStack />
        <CurriculumJourney />
        <CtaBanner
          headline={<>জিরো থেকে <GradientText>লাইভ অ্যাপ</GradientText> — পুরো প্রসেসটাই এখানে শিখানো হবে</>}
          sub="৮টি মডিউলে টোটাল ৪০+ লেসনে, পাঁচটি রিয়েল প্রজেক্টে আপনাকে ওয়েবসাইট থেকে মোবাইল অ্যাপ বিল্ড করে সার্ভারে Deploy করে মোবাইল অ্যাপ Play Store এবং App Store পাবলিশ করা পর্যন্ত সম্পূর্ণ প্রসেস Step by Step শিখানো হবে"
        />
        <TargetAudience />
        <InstructorProfile />
        <PricingNeon />
        <FAQDark />
      </main>

      <FooterDark />
    </div>
    </EnrollProvider>
  );
}

// --- PAGE SECTIONS ---

function PainPointSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              <span className="text-red-500">কেন</span> আপনি আটকে যাচ্ছেন?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              কোর্স দেখছেন, AI দিয়ে নাড়াচাড়াও করছেন — কিন্তু নিজে একটা পুরো, real প্রজেক্ট দাঁড় করাতে গেলেই কোথাও না কোথাও আটকে যাচ্ছেন। দোষটা আপনার না, দোষটা পুরোনো নিয়মে শেখার।
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <Reveal delay={100} direction="right">
            <div className="bg-red-950/20 border border-red-900/50 rounded-3xl p-8 relative overflow-hidden h-full group hover:bg-red-900/20 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <XCircle size={100} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
                <XCircle size={24} /> The Old Way (কোথায় আপনার সমস্যা হচ্ছে?)
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> একদম নতুনদের জন্য (The Fear of Code): কোডিং ব্যাকগ্রাউন্ড বা সিএসই ডিগ্রি নেই বলে শুরু করার আগেই মনে হয়—“প্রোগ্রামিং তো আমার জন্য নয়, এত সিনট্যাক্স কি মনে থাকবে?”</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> হালকা জানা ও ভাইব কোডারদের জন্য (The Gap): AI প্রম্পট দিয়ে বা হালকা কোড জোড়াতালি দিয়ে সুন্দর ফ্রন্টএন্ড বা UI বানিয়ে ফেলছেন; কিন্তু যখনই সার্ভার কানেক্ট করা, ডেটাবেজ ম্যানেজ করা বা সাইট লাইভ (Deployment) করার কথা আসে—সেখানেই আটকে যাচ্ছেন।</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> আসল প্রসেস না জানা (The Lost Architect): ইউটিউব দেখে টুকটাক প্রজেক্ট বানাতে পারেন, কিন্তু একটা প্রফেশনাল অ্যাপের শুরু থেকে শেষ পর্যন্ত (Full Development Cycle) কীভাবে সাজাতে হয়, সেই আসল রোডম্যাপটাই জানা নেই।</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> টাইম কিলিং এরর (The Error Loop): কোড করতে গিয়ে একটা অদ্ভুত Error আসলেই মাথা গরম হয়ে যায়। গুগল বা স্ট্যাক-ওভারফ্লোতে সমাধান খুঁজতে খুঁজতেই পুরো দিন শেষ, একসময় আগ্রহটাই হারিয়ে ফেলেন।</li>
              </ul>
            </div>
          </Reveal>

          {/* The AI Way */}
          <Reveal delay={200} direction="left">
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-3xl p-8 relative overflow-hidden h-full group hover:bg-emerald-900/20 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={100} className="text-emerald-500" />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 blur-2xl"></div>

              <h3 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                <CheckCircle2 size={24} /> The Modern AI Way (আমরা যেভাবে সমাধান করব)
              </h3>
              <ul className="space-y-4 text-slate-200">
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> জিরো থেকে মেন্টরশিপ: কোনো কোডিং ব্যাকগ্রাউন্ড লাগবে না। আমরা ধরে নেব আপনার শুধু টেকনোলজির প্রতি আগ্রহ আছে—বাকিটা স্ক্র্যাচ থেকে দেখানোর দায়িত্ব আমাদের।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> কমপ্লিট ফুল-স্ট্যাক রোডম্যাপ: শুধু ফ্রন্টএন্ড বা ভাইব কোডিং নয়; ডেটাবেজ ডিজাইন, সার্ভার আর্কিটেকচার এবং কীভাবে একটা প্রজেক্টকে প্রফেশনালি ডিপ্লয় (Live) করতে হয়—তার পুরো এ-টু-জেড প্রসেস আপনি শিখবেন।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> AI-কে বানান আপনার পার্সোনাল মেন্টর: Gemini এবং Claude-কে কীভাবে আপনার অ্যাসিস্ট্যান্ট বানিয়ে সেকেন্ডের মধ্যে জটিল এরর সলভ করতে হয় এবং প্রোডাকশন-গ্রেড কোড লিখতে হয়, সেই স্মার্ট হ্যাকস শিখবেন।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> লজিক ও আর্কিটেকচারে ফোকাস: সিনট্যাক্স মুখস্থ করার দিন শেষ, ওটা AI করবে। আপনি শিখবেন কীভাবে প্রজেক্টের লজিক সাজাতে হয় এবং বড় অ্যাপ ডিজাইন করতে হয়।</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhyAIWorkflow() {
  const values: { icon: IconType; title: string; desc: string }[] = [
    {
      icon: Terminal,
      title: "১০০% ফ্রি টুল",
      desc: "কোনো সাবস্ক্রিপশন ফি নেই। AntiGravity, Gemini আর Claude Code-এর ফ্রি ভার্সন দিয়েই কিভাবে প্রো-লেভেলের কাজ করবেন, সেটা হাতে-কলমে দেখানো হবে।"
    },
    {
      icon: Layers,
      title: "জিরো থেকে প্রোডাকশন",
      desc: "শুধু লোকালহোস্টে আটকে থাকা নয়। স্ক্র্যাচ থেকে কোড করে GitHub হয়ে লাইভ সার্ভারে অ্যাপ চালু করা পর্যন্ত — পুরোটা এখানে স্টেপ বাই স্টেপ দেখানো হবে।"
    },
    {
      icon: MonitorPlay,
      title: "প্রপার আর্কিটেকচার",
      desc: "AI দিয়ে এলোমেলো কোড নয়। সিস্টেম ডিজাইন আর স্কেলেবল আর্কিটেকচার কিভাবে প্ল্যান করতে হয়, সেটাও শিখবেন।"
    },
    {
      icon: Globe,
      title: "জব আর ক্লায়েন্ট রেডি",
      desc: "Software Engineer হিসেবে জবের প্রস্তুতি, আর ক্লায়েন্টের নতুন বা পুরোনো যেকোনো প্রজেক্ট AI দিয়ে সহজে ডেলিভার করার সিক্রেট।"
    }
  ];

  return (
    <section className="py-24 relative border-t border-slate-800/50 bg-[#060b19]">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              এই কোর্সটি <GradientText>কেন বেস্ট?</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group border border-slate-800 hover:border-cyan-500/50 h-full">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <v.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DevStack() {
  const stack: { name: string; tag: string; icon: IconType; desc: string }[] = [
    {
      name: "Cursor IDE",
      tag: "Code Editor",
      icon: Terminal,
      desc: "আপনার মূল কোড এডিটর, যার ভেতরেই AI বসানো। চ্যাট, এডিট আর অটো-কমপ্লিট — সব এক জায়গায়। আগে VS Code চালিয়ে থাকলে নতুন করে কিছু শেখাই লাগবে না।"
    },
    {
      name: "Claude Code",
      tag: "AI Agent",
      icon: Cpu,
      desc: "টার্মিনালের পাওয়ারফুল AI এজেন্ট। পুরো প্রজেক্ট ধরে নিজে ফাইল পড়ে, কোড লেখে, কমান্ড চালায় — অনেকটা একজন জুনিয়র ডেভেলপারের মতো।"
    },
    {
      name: "Gemini",
      tag: "Planning & Reasoning",
      icon: Brain,
      desc: "Google-এর ফ্রি মডেল। ডেটাবেস ডিজাইন, সিস্টেম ডিজাইন আর প্ল্যানিং-এর মতো চিন্তা-নির্ভর কাজে সবচেয়ে কাজের।"
    },
    {
      name: "AntiGravity",
      tag: "Agentic Workflow",
      icon: Code,
      desc: "বড় একটা ফিচার একসাথে প্ল্যান করে জেনারেট করে দেয়। পুরো প্রজেক্ট দাঁড় করানোর কাজটা অনেক দ্রুত হয়ে যায়।"
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
      <div className="absolute left-1/4 top-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Terminal size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              আপনার <GradientText>AI Dev Stack</GradientText>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              মাত্র ৪টি টুল, সবগুলোই ১০০% ফ্রি। নিচে দেখুন কোন টুল কোন কাজে লাগে, আর এই কোর্সে আপনি ঠিক কোন প্রোগ্রামিং ভাষা ও টেকনোলজিতে কোড করবেন — একদম পরিষ্কার করে।
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {stack.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="glass-panel p-7 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all duration-300">
                    <s.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{s.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{s.tag}</span>
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
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group flex items-center gap-4 h-full">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300">
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
            <span className="text-cyan-400 font-semibold">এক কথায়:</span> JavaScript ও TypeScript-ই মূল ভাষা। ফ্রন্টএন্ডে React/Next.js, ব্যাকএন্ডে Node.js, ডেটার জন্য MongoDB, আর মোবাইল অ্যাপের জন্য React Native — পুরোটা একসাথে, শূন্য থেকে।
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TargetAudience() {
  const audiences: { title: string; icon: IconType; desc: string }[] = [
    {
      title: "একদম বিগেনার",
      icon: Brain,
      desc: "কোডিং-এর বেসিক জানেন না, কিন্তু বেসিক Computer ব্যাবহার করতে জানেন, ইন্টারনেট ব্রাউজিং করতে জানেন, কিবোর্ড এর কি গুলো চিনতে পারেন তাহলেই আপনি নিশ্চিন্তে এই কোর্সে Enroll করতে পারেন।"
    },
    {
      title: "বর্তমান ওয়েব ডেভেলপার",
      icon: Code,
      desc: "আগে থেকেই কোড করেন, এখন AI দিয়ে কাজের গতি ১০ গুণ বাড়াতে চান এবং Mobile App Development শিখতে চাচ্ছেন, তাহলে আপনিও একদম নিশ্চিন্তে Enroll করতে পারেন।"
    },
    {
      title: "ক্যারিয়ার সুইচার",
      icon: Briefcase,
      desc: "এখন নন-টেক কোন বেকগ্রাউন্ডে কাজ করছেন। নিজের স্কিল ডেভেলপ করে টেক-এ এসে দ্রুত ইন্ডাস্ট্রিতে ঢুকতে চান, তাহলে আপনিও একদম নিশ্চিন্তে Enroll করতে পারেন।"
    }
  ];

  return (
    <section className="py-24 border-y border-slate-800/50 bg-[#060b19] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              এই মিশন <span className="text-cyan-400">কাদের জন্য?</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((aud, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="glass-panel rounded-3xl p-8 text-center hover:bg-slate-800/50 hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-300 group h-full">
                <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:scale-110 group-hover:border-indigo-500 group-hover:text-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300">
                  <aud.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{aud.title}</h3>
                <p className="text-slate-400">{aud.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstructorProfile() {
  return (
    <section id="instructor" className="py-24 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/3">
            <Reveal direction="right">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-3xl translate-x-3 translate-y-3 opacity-30 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500 neon-border"></div>
                <img
                  src="/mentor.jpeg"
                  alt="Afnan Mahmud - Instructor"
                  className="relative rounded-3xl z-10 w-full object-cover aspect-square shadow-2xl border border-slate-700 group-hover:-translate-y-1 group-hover:grayscale transition-all duration-500"
                />
                <div className="absolute -bottom-5 -right-5 z-20 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-white">Lead Instructor</span>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="w-full md:w-2/3">
            <Reveal delay={200} direction="left">
              <h2 className="text-cyan-400 font-bold tracking-widest uppercase mb-2">Meet Your Mentor</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-6 text-white">Afnan Mahmud</h3>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                দীর্ঘদিন ধরে MERN Stack-এ প্রোডাকশন-গ্রেড অ্যাপ বানাচ্ছি, রিয়েল ক্লায়েন্ট প্রজেক্ট ডেলিভার করছি। এখন AI দিয়ে কিভাবে ফ্রি টুলস ব্যবহার করে সবচেয়ে দ্রুত আর স্মার্ট ওয়েতে সফটওয়্যার বানানো যায় — ঠিক যেটা আমি নিজে Everyday করি, সেটাই এই কোর্সে শেয়ার করবো। শুধু থিওরি নয়, পুরোটাই স্ক্রিন শেয়ার করে আপনাদের ধরে ধরে বুজিয়ে দেয়া হবে প্রতিটি স্টেপ।
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-cyan-500/30 transition-colors">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Full-Stack Engineer</h4>
                    <p className="text-xs text-slate-400">Building real apps</p>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-indigo-400">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">AI Workflow Expert</h4>
                    <p className="text-xs text-slate-400">Master of Prompts</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterDark() {
  return (
    <footer className="bg-[#020617] text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-black text-2xl text-white mb-6 hover:opacity-80 transition-opacity cursor-pointer inline-flex">
            <Image src="/afnan-logo.png" alt="Afnan Mahmud" width={40} height={40} className="w-10 h-10 rounded-full object-cover shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
            <span>Afnan <GradientText>Mahmud</GradientText></span>
          </div>
          <p className="mb-6 max-w-sm leading-relaxed text-slate-500">
            টিউটোরিয়াল হেল থেকে বেরিয়ে এসে ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ পর্যন্ত।
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-cyan-400 transition-all duration-300 hover:-translate-y-1"><Send size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-indigo-400 transition-all duration-300 hover:-translate-y-1"><AtSign size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-pink-400 transition-all duration-300 hover:-translate-y-1"><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Navigation</h4>
          <ul className="space-y-3">
            <li><a href="#journey" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Curriculum</a></li>
            <li><a href="#instructor" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Instructor</a></li>
            <li><a href="#pricing" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Pricing</a></li>
            <li><a href="#faq" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">System</h4>
          <ul className="space-y-3">
            <li><a href="/terms" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
            <li><a href="/privacy" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-900 text-center text-sm relative z-10 text-slate-600">
        <p>&copy; {new Date().getFullYear()} Afnan Mahmud. System Online.</p>
      </div>
    </footer>
  );
}
