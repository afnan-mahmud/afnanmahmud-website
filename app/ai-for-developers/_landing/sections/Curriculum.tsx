'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Sparkles, Target, Layers, Code2, Cpu, Zap, Rocket, Globe, Smartphone, Check, Trophy } from 'lucide-react';
import { Reveal, GradientText } from '../../LandingClient';
import type { IconType } from '../content';

type CurriculumAccordionProps = {
  title: ReactNode;
  level: number;
  children: ReactNode;
  icon?: IconType;
  defaultOpen?: boolean;
};

function CurriculumAccordion({ title, level, children, icon: Icon, defaultOpen = false }: CurriculumAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ease-out ${
        isOpen
          ? 'border-[rgb(var(--seg-accent-2)/0.5)] shadow-[0_0_20px_rgb(var(--seg-accent-2)/0.15)] bg-slate-900/80'
          : 'border-slate-800 bg-slate-900/30 hover:border-[rgb(var(--seg-accent-2)/0.3)] hover:bg-slate-800/50'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:border-[rgb(var(--seg-accent-2)/0.5)] group-hover:text-[rgb(var(--seg-accent-2))] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Lvl</span>
            <span className="text-lg font-black leading-none">{level}</span>
          </div>
          <div>
            <h3 className={`font-bold text-lg md:text-xl transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{title}</h3>
            {Icon && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 group-hover:text-[rgb(var(--seg-accent-2)/0.8)] transition-colors">
                <Icon size={14} /> <span>Unlock Modules</span>
              </div>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[rgb(var(--seg-accent-2)/0.2)] text-[rgb(var(--seg-accent-2))]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white'}`}>
          <ChevronDown className={`transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ overflow: 'hidden' }}
      >
        <div className="p-5 md:p-6 pt-0 text-slate-400 border-t border-slate-800/50 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

// Invariant across all segments — same 8-module curriculum for every audience.
export function Curriculum() {
  const modules: { title: string; icon: IconType; points: string[] }[] = [
    {
      title: "The Modern AI Dev Stack Setup",
      icon: Target,
      points: [
        "AI-first mindset — তুমি architect, AI builder",
        "Cursor IDE setup — AI built-in code editor",
        "Node, npm, Git আর dev environment তৈরি",
        "Claude Code — terminal এর AI agent",
        "Gemini free tier integration",
        "AntiGravity agentic workflow এর basics",
        "সব ফ্রি tool দিয়ে pro-level environment"
      ]
    },
    {
      title: "Project Architecture & DB Design",
      icon: Layers,
      points: [
        "AI দিয়ে SaaS idea generate আর validate",
        "Feature planning আর PRD (requirements doc) লেখা",
        "ফ্রি AI tool দিয়ে System Design",
        "Gemini দিয়ে Database Schema design",
        "REST API structure আর contract design",
        "AntiGravity দিয়ে project base scaffold"
      ]
    },
    {
      title: "Frontend Generation with Claude",
      icon: Code2,
      points: [
        "React/Next.js foundations AI এর সাথে",
        "Claude Code দিয়ে reusable UI component",
        "Real-time UI generate-preview-refine loop",
        "Responsive আর mobile-first UI design",
        "State management আর form automation",
        "UI bug fixing আর visual polish"
      ]
    },
    {
      title: "Backend, Database & Logic Mastery",
      icon: Cpu,
      points: [
        "Robust API আর backend logic scratch থেকে",
        "Database integration আর full CRUD",
        "Gemini দিয়ে database optimization",
        "Frontend আর backend connect",
        "Business logic, validation আর error handling",
        "AntiGravity দিয়ে fast backend development"
      ]
    },
    {
      title: "Debugging & Version Control (GitHub)",
      icon: Zap,
      points: [
        "The 'Error Loop' — AI error confidently fix",
        "Error log আর stack trace পড়া",
        "AI কে effective feedback দিয়ে fast fix",
        "Git আর GitHub fundamentals",
        "AI project এর জন্য version control workflow",
        "AI দিয়ে code refactoring"
      ]
    },
    {
      title: "Building the Production SaaS",
      icon: Rocket,
      points: [
        "AntiGravity + Gemini + Claude একসাথে orchestrate",
        "User authentication system (login/signup)",
        "User dashboard বানানো",
        "Zero থেকে production-ready codebase",
        "Security hardening — app যেন কেউ hack করতে না পারে",
        "App কে mobile এর জন্য prepare করা",
        "Final polish আর UX improvement"
      ]
    },
    {
      title: "Live Server Deployment & Career",
      icon: Globe,
      points: [
        "VPS/AWS এ live server এ deploy",
        "Environment variable আর production config",
        "GitHub Actions দিয়ে CI/CD automation",
        "Developer portfolio বানানো",
        "AI-era developer হিসেবে job preparation",
        "Freelance client delivery secrets"
      ]
    },
    {
      title: "Mobile App + Play Store & App Store Launch",
      icon: Smartphone,
      points: [
        "Web থেকে native mobile app এর foundation",
        "AI দিয়ে mobile app এর screens বানানো",
        "Native device feature আর phone এ testing",
        "Release build বানানো (APK/AAB আর iOS)",
        "Google Play Store এ app publish",
        "Apple App Store এ app publish",
        "Launch এর পর update, analytics আর growth"
      ]
    }
  ];

  return (
    <section id="journey" className="py-24 relative overflow-hidden bg-[#060b19]">
      {/* Background decoration */}
      <div
        className="absolute right-0 top-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgb(var(--seg-accent-2) / 0.1)' }}
      ></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border"
              style={{
                background: 'rgb(var(--seg-accent-2) / 0.2)',
                color: 'rgb(var(--seg-accent-2))',
                borderColor: 'rgb(var(--seg-accent-2) / 0.3)',
                boxShadow: '0 0 20px rgb(var(--seg-accent-2) / 0.2)',
              }}
            >
              <Trophy size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              Your Journey to <GradientText>Production</GradientText>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              বোরিং সিলেবাস নয় — এটা একটা লেভেল-আপ গেম। ৮টি লেভেল পার করে জিরো থেকে শুরু করে লাইভ ওয়েবসাইট আর পাবলিশ করা মোবাইল অ্যাপ পর্যন্ত নিজের পোর্টফোলিও দাঁড় করান।
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 md:left-[2.1rem] top-8 bottom-8 w-1 bg-gradient-to-b from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] opacity-30 rounded-full hidden sm:block"></div>

          <div className="space-y-6">
            {modules.map((mod, idx) => (
              <Reveal key={idx} delay={idx * 50} direction="up">
                <div className="relative sm:pl-20">
                  {/* Timeline Node/Dot */}
                  <div className="absolute left-0 md:left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-4 border-[rgb(var(--seg-accent-2))] z-10 shadow-[0_0_10px_rgb(var(--seg-accent-2)/0.6)] hidden sm:block"></div>

                  <CurriculumAccordion title={mod.title} level={idx + 1} icon={mod.icon} defaultOpen={idx === 0}>
                    <ul className="space-y-3 mt-4">
                      {mod.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:border-[rgb(var(--seg-accent))] group-hover/item:bg-[rgb(var(--seg-accent)/0.1)] group-hover/item:text-[rgb(var(--seg-accent))] transition-all duration-300">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-slate-300 group-hover/item:text-white transition-colors">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CurriculumAccordion>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={100} direction="up">
          <div className="mt-14 relative overflow-hidden rounded-3xl glass-panel neon-border p-8 md:p-10">
            <div
              className="absolute -top-1/3 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
              style={{ background: 'rgb(var(--seg-accent) / 0.15)' }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[rgb(var(--seg-accent)/0.3)] to-[rgb(var(--seg-accent-2)/0.3)] border border-[rgb(var(--seg-accent)/0.3)] flex-shrink-0"
                  style={{ color: 'rgb(var(--seg-accent))' }}
                >
                  <Sparkles size={22} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
                  মনে কি প্রশ্ন জাগছে — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))]">&ldquo;এত কিছু মাত্র ৳৯৯০ টাকায় কীভাবে সম্ভব?&rdquo;</span>
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed md:text-lg">
                বাজারে যেখানে নরমাল কোর্সের দাম ৫ থেকে ১০ হাজার টাকা, সেখানে আমরা এত কম দামে কেন নিচ্ছি — এটার কারণ একটাই, <span className="font-bold text-white">সবার জন্য এক্সেসিবল করা।</span> আমরা চাই সিএসই ডিগ্রি বা মোটা অঙ্কের টাকা না থাকা সত্ত্বেও দেশের যেকোনো প্রান্ত থেকে একজন তরুণ যেন মাত্র ১-২ মাসে মডার্ন টেকনোলজিতে নিজের ক্যারিয়ার গড়তে পারে। টাকার জন্য শিখতে পারি নাই — এমন যেন কোনো কারণ না হয়ে দাঁড়ায়।
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
