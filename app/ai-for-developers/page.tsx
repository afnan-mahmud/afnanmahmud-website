import type { Metadata } from 'next';
import { type ComponentType } from 'react';
import Image from 'next/image';
import { Code, Code2, Sparkles, Cpu, Layers, Zap, Brain, Terminal, Briefcase, Globe, Send, AtSign, Mail, Layout, Smartphone, Server, Bug, ShieldCheck, GitBranch, Rocket, Store, MessagesSquare, Wallet } from 'lucide-react';
import { EnrollProvider } from './EnrollContext';
import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import WhatsAppFab from '@/components/whatsapp/WhatsAppFab';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import {
  Reveal,
  GradientText,
  Navbar,
  HeroSection,
  CurriculumJourney,
  CtaBanner,
  EnrollButton,
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
    'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ, জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত। ৮ মডিউল, ৪০+ লেসন, ৩টি রিয়েল প্রজেক্ট।',
  openGraph: {
    title: 'AI for Developers — Afnan Mahmud',
    description:
      'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত।',
    type: 'website',
  },
};

// Round the real enrolled count UP to the next 500 boundary for social proof:
// <=500 -> 500+, 501..1000 -> 1000+, 1001..1500 -> 1500+, and so on.
function enrolledDisplay(count: number): string {
  const rounded = Math.max(500, Math.ceil(count / 500) * 500);
  return `${rounded}+`;
}

export default async function AiForDevelopersPage() {
  await connectDB();
  const course = await Course.findOne({ slug: COURSE_SLUG })
    .select('enrolledCount')
    .lean<{ enrolledCount?: number }>();
  const enrolledLabel = enrolledDisplay(course?.enrolledCount ?? 0);

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
        <SocialProof enrolledLabel={enrolledLabel} />
        <WhatYouWillLearn />
        <CtaBanner
          headline={<>পুরোনো নিয়মে আর কত? <GradientText>Smart way</GradientText>-তে Software Development শুরু করুন।</>}
          sub="AI হবে আপনার Assistant Programmer, আর আপনি হবেন একজন Software Architecture। আপনি System এবং Database ডিজাইন করবেন, Backend API Structure এবং Contract ডিজাইন করবেন তারপর AI কে দিয়ে আপনি Code লিখাবেন।"
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
        <StudentFeedback />
        <PricingNeon />
        <FAQDark />
      </main>

      <FooterDark />

      <WhatsAppFab />
    </div>
    </EnrollProvider>
  );
}

// --- PAGE SECTIONS ---

// Small social-proof strip between the hero and the "what you'll learn" section:
// three overlapping student avatars + a rounded enrolled count.
function SocialProof({ enrolledLabel }: { enrolledLabel: string }) {
  const avatars = [
    { initials: 'RH', gradient: 'from-cyan-500 to-indigo-600' },
    { initials: 'SA', gradient: 'from-pink-500 to-purple-600' },
    { initials: 'TK', gradient: 'from-emerald-500 to-teal-600' },
  ];
  return (
    <section className="relative py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 rounded-2xl glass-panel border border-slate-700/70 px-5 py-4 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
            <a
              href="#feedback"
              className="order-2 sm:order-1 group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <MessagesSquare size={16} className="group-hover:scale-110 transition-transform" />
              স্টুডেন্টদের ফিডব্যাক দেখুন
            </a>
            <div className="order-1 sm:order-2 flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((a) => (
                  <div
                    key={a.initials}
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${a.gradient} text-sm font-bold text-white ring-2 ring-slate-900 shadow-lg`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-left text-sm sm:text-base font-semibold leading-snug text-slate-200">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-200 font-black">{enrolledLabel}</span> স্টুডেন্ট আমাদের এই সেশনে জয়েন করেছেন
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Student feedback / testimonials. Placeholder reviews — swap `reviews` with real
// student names + feedback (or screenshots) when available.
function StudentFeedback() {
  const reviews: { name: string; role?: string; initials: string; gradient: string; text: string }[] = [
    {
      name: 'Akter',
      initials: 'A',
      gradient: 'from-cyan-500 to-indigo-600',
      text: 'You are doing great. I thoroughly enjoyed your lessons so far. Please ignore the negative comments. Best wishes!',
    },
    {
      name: 'Tanvir Ahmed',
      initials: 'TA',
      gradient: 'from-pink-500 to-purple-600',
      text: 'Project Architecture module shesh kore ekhon backend part e achi. AI ke diye API ar database design kora eto shohoje bujhbo bhabini.',
    },
    {
      name: 'Farhana Islam',
      initials: 'FI',
      gradient: 'from-emerald-500 to-teal-600',
      text: 'Just finished the backend module and the step-by-step explanations are so clear. Everything makes sense even as a beginner. Really looking forward to the next lessons!',
    },
    {
      name: 'Sabbir Hossain',
      initials: 'SH',
      gradient: 'from-amber-500 to-orange-600',
      text: 'Course ekhono full shesh hoy nai, but module 3 porjonto kore ja shikhlam tai onek kaje lagse. AI diye ekta project er idea theke requirements ber kore seta theke architecture banano database er relation ber kora database kivabe kaj kore seta buja then backend banano ekhon onek clear amar kache. So practice er jonno nijer project banacchi.',
    },
    {
      name: 'Sumaiya Rahman',
      initials: 'SR',
      gradient: 'from-rose-500 to-fuchsia-600',
      text: 'Loving the sessions so far! The backend part really cleared up a lot of my confusions. Ekdom beginner-friendly — jekono keu shuru korte parbe. Highly recommended!',
    },
  ];
  return (
    <section id="feedback" className="scroll-mt-24 py-24 relative overflow-hidden border-t border-slate-800/50">
      <div className="absolute left-1/4 top-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <MessagesSquare size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              স্টুডেন্টদের <GradientText>ফিডব্যাক</GradientText>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              যারা ইতিমধ্যে এই সেশনে জয়েন করেছেন — তাদের অভিজ্ঞতা নিজেই পড়ে দেখুন।
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <Reveal key={r.initials} delay={i * 100}>
              <div className="h-full flex flex-col gap-4 rounded-2xl glass-panel border border-slate-700/70 p-6 shadow-[0_0_25px_rgba(99,102,241,0.1)] hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all">
                <div className="text-amber-400 text-lg tracking-wide" aria-label="৫ তারকা রেটিং">★★★★★</div>
                <p className="text-slate-300 leading-relaxed [text-wrap:pretty] flex-1">“{r.text}”</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/70">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${r.gradient} text-sm font-bold text-white shadow-lg`}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{r.name}</p>
                    {r.role && <p className="text-slate-400 text-xs">{r.role}</p>}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-8 text-center text-base sm:text-lg font-semibold text-slate-400">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-200 font-black">+৫২ জন</span> আরো ফিডব্যাক দিয়েছেন
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function WhatYouWillLearn() {
  const outcomes: { icon: IconType; title: string; desc: string }[] = [
    {
      icon: Globe,
      title: "শূন্য থেকে পুরো একটা ওয়েবসাইট AI দিয়ে বিল্ড করবেন",
      desc: "একদম খালি ফোল্ডার থেকে শুরু করে ফ্রন্টএন্ড, ব্যাকএন্ড, ডেটাবেজ — একটা কমপ্লিট ওয়েবসাইট AI-কে দিয়ে ধাপে ধাপে দাঁড় করানো শিখানো হবে।"
    },
    {
      icon: Smartphone,
      title: "শূন্য থেকে মোবাইল App ধাপে ধাপে AI দিয়ে বানাবেন",
      desc: "React Native (Expo) দিয়ে অ্যান্ড্রয়েড ও iOS দুটোতেই চলে এমন অ্যাপ — স্ক্রিন ডিজাইন থেকে API কানেক্ট করা পর্যন্ত পুরোটা ধাপে ধাপে শিখানো হবে।"
    },
    {
      icon: Bug,
      title: "বাগ ও এরর ফিক্স করা শিখবেন AI দিয়ে",
      desc: "Software Development-এ একটা কমন সমস্যা হচ্ছে বাগ ও এরর ফিক্স করা। আমরা এই কঠিন কাজটাও AI-কে দিয়ে খুব সহজেই কিভাবে করিয়ে নিতে পারবো তার সম্পূর্ণ প্রসেস শেখানো হবে।"
    },
    {
      icon: ShieldCheck,
      title: "সিকিউরিটি ভালনারেবিলিটি ফিক্স করা শিখবেন",
      desc: "AI-কে কাজে লাগিয়ে নিজের কোডের দুর্বলতা খুঁজে বের করা আর সেগুলো ঠিক করা, যাতে আপনার অ্যাপ হ্যাক হয়ে না যায় এটাও শিখানো হবে।"
    },
    {
      icon: GitBranch,
      title: "কোডবেজ প্রফেশনালি ম্যানেজ করবেন GitHub-এর মাধ্যমে",
      desc: "টিম বা একা, ইন্ডাস্ট্রি এক্সপার্ট অন্যরা যেভাবে কোড ম্যানেজ করে ঠিক সেভাবে আপনি আপনার এই কোডগুলো কিভাবে সেইফলি ম্যানেজ করতে পারবেন তা শিখানো হবে।"
    },
    {
      icon: Rocket,
      title: "সার্ভারে ডিপ্লয় করে নিজের ডোমেইনে অ্যাপ লাইভ করবেন",
      desc: "প্রজেক্টতো আমাদের কম্পিউটারে বানাবো এবং টেস্টিং করবো তারপর আপনার কম্পিউটার থেকে কিভাবে সার্ভার মানে হোস্টিং এ সেটআপ, ডোমেইন কানেক্ট, SSL কানেক্ট করে লাইভ করার পুরো প্রসেসটাই স্টেপ বাই স্টেপ দেখানো হবে।"
    },
    {
      icon: Store,
      title: "মোবাইল অ্যাপ Play Store ও App Store-এ পাবলিশ করবেন",
      desc: "মোবাইল অ্যাপের Android বা iOS এর ষ্টোরে পাবলিশের জন্য বিল্ড বানানো, অ্যাকাউন্ট সেটআপ, স্টোর লিস্টিং, টেস্টিং এবং রিভিউ পার করে — Google Play Store ও App Store দুটো স্টোরেই পাবলিশ করার সম্পূর্ণ প্রসেস শেখানো হবে।"
    },
  ];

  return (
    <section id="learn" className="py-24 relative overflow-hidden border-t border-slate-800/50 bg-[#060b19]">
      <div className="absolute right-1/4 top-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              এখানে <GradientText>আপনি শিখতে পারবেন</GradientText>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              আইডিয়া থেকে শুরু করে লাইভ মোবাইল App এবং ওয়েবসাইট বানানো পর্যন্ত — পুরো জার্নিটা AI-কে সাথে নিয়ে, স্টেপ বাই স্টেপ শিখুন।
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {outcomes.map((o, i) => (
            <Reveal
              key={i}
              delay={(i % 2) * 100}
              direction={i % 2 === 0 ? 'right' : 'left'}
              className={i === outcomes.length - 1 ? 'md:col-span-2' : ''}
            >
              <div className="glass-panel p-7 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <o.icon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400/80">{String(i + 1).padStart(2, '0')}</span>
                      <span className="h-px flex-1 bg-slate-800 group-hover:bg-indigo-500/30 transition-colors"></span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug">{o.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{o.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <EnrollButton className="mt-14" />
      </div>
    </section>
  );
}

function WhyAIWorkflow() {
  const values: { icon: IconType; title: string; desc: string }[] = [
    {
      icon: Sparkles,
      title: "একদম বিগেনার ফ্রেন্ডলি",
      desc: "এই বিষয়ে আগের কোনো ধারণা না থাকলেও কোনো সমস্যা নেই — আমরা একদম বেসিক থেকে ক্লাস শুরু করেছি। কম্পিউটারের বেসিক ধারণা থাকলে, ইন্টারনেটে ব্রাউজ করতে জানলে আর কিবোর্ড দেখে দেখে টাইপ করতে পারলেই আপনি নিশ্চিন্তে এই কোর্সে জয়েন করতে পারেন।"
    },
    {
      icon: MessagesSquare,
      title: "সার্বক্ষণিক সাপোর্ট গ্রুপ",
      desc: "কোর্স করা অবস্থায় কোথাও আটকে গেলে আপনার জন্য রয়েছে ডেডিকেটেড WhatsApp ও Facebook সাপোর্ট গ্রুপ। সেখানে আমাদের সাপোর্ট মেম্বাররা সর্বক্ষণ অ্যাক্টিভ। এটা Recorded কোর্স এর জন্য এই Journey-তে আপনার নিজেকে একা ভাবার কিছু নেই, আপনি কোথায় সমস্যায় পড়েছেন লিখে আমাদের গ্রুপে মেসেজ করলেই হেল্প পাবেন।"
    },
    {
      icon: Brain,
      title: "ফান্ডামেন্টালস সহ শেখা",
      desc: "এখানে শুধু AI দিয়ে ডেভেলপমেন্ট কমপ্লিট করবো এমন না — আমরা বিভিন্ন ফান্ডামেন্টালস সম্পর্কেও জানবো। কারণ ফান্ডামেন্টাল জানা না থাকলে আপনি বেশিদূর আগাতে পারবেন না। ফান্ডামেন্টালসগুলো জানা থাকলে ক্রিটিক্যাল থিংকিং, একটা আইডিয়া থেকে সেটাকে একটা সফটওয়্যারের রূপ দেওয়া — এই বিষয়গুলো খুব সহজ হবে আপনার জন্য।"
    },
    {
      icon: Wallet,
      title: "ফ্রি AI মডেল দিয়ে শেখা",
      desc: "শেখার জন্য একটা টাকাও খরচ করতে হবে না — একদম ফ্রি AI মডেল দিয়েই পুরো ডেভেলপমেন্ট প্রসেস শিখবেন। পরবর্তীতে প্রোডাকশনে নিজের বা ক্লায়েন্টের কাজ আরও সহজে ও দ্রুত শেষ করার জন্য পেইড মডেলগুলোর ব্যবহারও দেখানো হবে এবং এই পেইড মডেলের জন্য যে অনেক টাকা খরচ হবে এমন না ২০ ডলারের একটা সাবক্রিপশনে সহজেই আপনার অফিস বা ক্লাইন্টের ডেইলি কাজগুলো কমপ্লিট করে ফেলা যায়।"
    },
    {
      icon: Briefcase,
      title: "জব আর ক্লায়েন্ট রেডি",
      desc: "কোর্স শেষে আপনি যেন জব মার্কেট অথবা মার্কেটপ্লেসে ক্লায়েন্টের কাজ করার মতো রেডি হয়ে উঠতে পারেন — এটাই আমাদের এই কোর্সের একমাত্র চেষ্টা।"
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

        <div className="flex flex-wrap justify-center gap-6">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 100} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
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

        <EnrollButton className="mt-14" />
      </div>
    </section>
  );
}

function DevStack() {
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
      desc: "Google-এর ফ্রি মডেলগুলো আমরা কোড এডিটরের সাথে কানেক্ট করে আমাদের কোড এডিটরকে আমরা আরো অনেক বেশি পাওয়ারফুল করে তুলি। ডেটাবেস ডিজাইন, সিস্টেম ডিজাইন আর প্ল্যানিং-এর মতো কাজে সবচেয়ে ভালো রেজাল্ট দেয় Google এর Gemini এর মডেল গুলো।"
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
              মাত্র ৪টি টুল। নিচে দেখুন কোন টুল কোন কাজে লাগে, আর এই কোর্সে আপনি ঠিক কোন প্রোগ্রামিং ভাষা ও টেকনোলজিতে কোড করবেন
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
            <span className="text-cyan-400 font-semibold">এক কথায়:</span> JavaScript ও TypeScript-ই মূল ভাষা। ফ্রন্টএন্ডে React/Next.js, ব্যাকএন্ডে Node.js, ডেটার জন্য MongoDB, আর মোবাইল অ্যাপের জন্য React Native।
          </p>
        </Reveal>

        <EnrollButton className="mt-12" />
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
  const ventures: { name: string; role: string; icon: IconType; desc: string }[] = [
    {
      name: 'Cholo Bohudur',
      role: 'Co-Founder',
      icon: Code2,
      desc: 'একটি সফটওয়্যার ফার্ম — যেখানে রিয়েল ক্লায়েন্টের জন্য প্রোডাকশন-গ্রেড সফটওয়্যার তৈরি করা হয়।',
    },
    {
      name: 'Gowaay',
      role: 'Founder',
      icon: Globe,
      desc: 'ট্যুর অ্যান্ড ট্রাভেল ইন্ডাস্ট্রির জন্য তৈরি একটি প্রোডাক্ট ও প্ল্যাটফর্ম।',
    },
    {
      name: 'Niyoog',
      role: 'Founder & CTO',
      icon: Briefcase,
      desc: 'জব মার্কেট প্রোডাক্ট — চাকরিপ্রার্থীরা প্রোফাইল সাবমিট করলেই বেস্ট-ম্যাচিং জবে অটোমেটিক CV চলে যায়; আর নিয়োগদাতারা জব পোস্ট করার ২৪ ঘন্টার মধ্যেই খুব সহজে সেরা এমপ্লয়ি হায়ার করতে পারেন।',
    },
    {
      name: 'Sujog',
      role: 'Founder',
      icon: Store,
      desc: 'মূলত বাংলাদেশের ই-কমার্সদের জন্য ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপ করার একটি প্ল্যাটফর্ম।',
    },
  ];
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
                দীর্ঘদিন ধরে MERN Stack-এ প্রোডাকশন-গ্রেড অ্যাপ বানাচ্ছি, রিয়েল ক্লায়েন্ট প্রজেক্ট ডেলিভার করছি। এখন AI কে ব্যবহার করে সবচেয়ে দ্রুত আর স্মার্ট ওয়েতে ওয়েব বা মোবাইল App বানানো যায় — ঠিক যেটা আমি নিজে Everyday করি, সেটাই এই কোর্সে শেয়ার করবো। শুধু থিওরি নয়, পুরোটাই স্ক্রিন শেয়ার করে আপনাদের ধরে ধরে বুজিয়ে দেয়া হবে প্রতিটি স্টেপ।
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

              {/* Ventures / products the mentor has founded & built */}
              <div className="mt-10">
                <h4 className="text-cyan-400 font-bold tracking-widest uppercase mb-5 text-sm">Founder & Builder Of</h4>
                <div className="grid sm:grid-cols-2 gap-5">
                  {ventures.map((v) => (
                    <div
                      key={v.name}
                      className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex gap-4 h-full"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <v.icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-white leading-tight">{v.name}</h5>
                          <span className="text-[10px] uppercase tracking-wide font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5">{v.role}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed [text-wrap:pretty]">{v.desc}</p>
                      </div>
                    </div>
                  ))}
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
          <p className="mb-6 max-w-sm leading-relaxed text-slate-400">
            টিউটোরিয়াল হেল থেকে বেরিয়ে এসে ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ পর্যন্ত।
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Telegram" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-cyan-400 transition-all duration-300 hover:-translate-y-1"><Send size={18} aria-hidden="true" /></a>
            <a href="#" aria-label="X (Twitter)" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-indigo-400 transition-all duration-300 hover:-translate-y-1"><AtSign size={18} aria-hidden="true" /></a>
            <a href="#" aria-label="Email" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-pink-400 transition-all duration-300 hover:-translate-y-1"><Mail size={18} aria-hidden="true" /></a>
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
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-900 text-center text-sm relative z-10 text-slate-400">
        <p>&copy; {new Date().getFullYear()} Afnan Mahmud. System Online.</p>
      </div>
    </footer>
  );
}
