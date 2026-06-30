'use client';

import { useState, useEffect, useRef, type ReactNode, type ComponentType } from 'react';
import { ChevronDown, Play, Code2, Sparkles, Cpu, Layers, Zap, Rocket, Check, Globe, Lock, Target, Trophy, MonitorPlay, Smartphone, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEnroll } from './EnrollContext';

type IconType = ComponentType<{ size?: number | string; className?: string }>;

const DEMO_VIDEO_SRC = '/course-demo.mp4';

type RevealProps = {
  children?: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
};

export const Reveal = ({ children, delay = 0, direction = 'up' }: RevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate-y-0 translate-x-0';
    switch (direction) {
      case 'up': return 'translate-y-10';
      case 'down': return '-translate-y-10';
      case 'left': return 'translate-x-10';
      case 'right': return '-translate-x-10';
      default: return 'translate-y-10';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'
        } ${getTransform()}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </div>
  );
};

export const GradientText = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 ${className}`}>
    {children}
  </span>
);

type AccordionProps = {
  title: ReactNode;
  level: number | string;
  children: ReactNode;
  icon?: IconType;
  defaultOpen?: boolean;
};

const Accordion = ({ title, level, children, icon: Icon, defaultOpen = false }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-slate-900/80' : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500/30 hover:bg-slate-800/50'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">{level === 'Q' ? 'FAQ' : 'Lvl'}</span>
            <span className="text-lg font-black leading-none">{level}</span>
          </div>
          <div>
            <h3 className={`font-bold text-lg md:text-xl transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{title}</h3>
            {Icon && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 group-hover:text-indigo-400/80 transition-colors">
                <Icon size={14} /> <span>Unlock Modules</span>
              </div>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white'}`}>
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
};

// --- MAIN PAGE COMPONENT ---

export function Navbar() {
  const { openEnroll } = useEnroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-panel border-b border-slate-800/50 py-3 shadow-lg' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
          <Image src="/afnan-logo.png" alt="Afnan Mahmud" width={36} height={36} priority className="w-9 h-9 rounded-full object-cover shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
          <span className="text-white">Afnan <GradientText>Mahmud</GradientText></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#journey" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Journey</a>
          <a href="#instructor" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Instructor</a>
          <a href="#faq" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">FAQ</a>
        </div>
        <div>
          <button onClick={openEnroll} className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-95 inline-block cursor-pointer">
            Start Mission
          </button>
        </div>
      </div>
    </nav>
  );
}

export function HeroSection() {
  const { openEnroll, openDemo } = useEnroll();
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden border-b border-slate-800/50 min-h-[90vh] flex items-center">
      {/* Cyberpunk Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Content Area */}
          <div className="text-left z-10">
            <Reveal delay={100} direction="right">
              {/* Removed the mission badge as requested */}
            </Reveal>

            <Reveal delay={200} direction="right">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3 sm:mb-4 leading-[1.1] text-white">
                AI-পাওয়ার্ড <GradientText>Software Development</GradientText>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 leading-snug text-slate-200">
                ১-২ মাসেই কাস্টম ওয়েব এবং মোবাইল অ্যাপ বিল্ড করা শিখুন
              </p>
            </Reveal>

            <Reveal delay={300} direction="right">
              <p className="mt-5 sm:mt-6 max-w-2xl text-[15px] sm:text-base md:text-lg lg:text-xl text-slate-300/90 leading-relaxed sm:leading-loose tracking-wide [text-wrap:pretty] border-l-2 border-indigo-500/40 pl-4 sm:pl-5">
                Coding এর ঝামেলা এখন <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent font-semibold">AI এর কাঁধে</span>, মডার্ন AI-কে বানান আপনার পার্সোনাল প্রোগ্রামার।
                কোড লেখার কাজ করবে AI, আর আপনি হয়ে উঠবেন এমন এক
                <span className="text-white font-semibold"> Full Stack Developer</span>—যে যেকোনো ক্লায়েন্টের
                <strong className="text-indigo-400 font-semibold"> Existing বা New</strong> প্রজেক্ট
                হ্যান্ডেল করতে পারবেন এবং যেকোনো কোম্পানিতে
                <strong className="text-pink-400 font-semibold"> Software Developer</strong> হিসেবে আপনার ক্যারিয়ার শুরু করতে পারবেন।
              </p>
            </Reveal>

            <Reveal delay={400} direction="right">
              {/* Mobile/tablet: inline auto-playing demo video above the Enroll button */}
              <div className="lg:hidden mb-6">
                <MobileDemoVideo />
                {/* Mobile/tablet: demo class button right below the demo video */}
                <Link href="/ai-for-developers/demo" className="mt-4 group relative w-full flex rounded-xl p-[2px] bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1 active:scale-95 transition-all">
                  <span className="w-full flex items-center justify-center gap-2 rounded-[10px] bg-slate-950 px-8 py-4 text-white font-bold text-lg group-hover:bg-slate-900 transition-colors">
                    <MonitorPlay size={20} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    ডেমো ক্লাস দেখুন
                  </span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <button onClick={openEnroll} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                  <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
                  Enroll Now - ৳990
                </button>
                {/* Desktop only: opens the demo video in a modal */}
                <button onClick={openDemo} className="hidden lg:flex w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold text-lg hover:bg-white/5 hover:-translate-y-1 active:scale-95 transition-all items-center justify-center gap-2 group border-slate-700 cursor-pointer">
                  <Play size={20} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  Course Details
                </button>
                {/* Desktop only: demo class page beside the outline/demo video button */}
                <Link href="/ai-for-developers/demo" className="hidden lg:flex w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold text-lg hover:bg-white/5 hover:-translate-y-1 active:scale-95 transition-all items-center justify-center gap-2 group border-slate-700">
                  <MonitorPlay size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  Demo Class
                </Link>
              </div>
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-4 py-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-sm animate-float">🛡️</span>
                <span className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">৭ দিনের মানি-ব্যাক গ্যারান্টি</span>
              </div>
            </Reveal>
          </div>

          {/* Right Visual Area (Programming Hero Style Floating UI) */}
          <div className="hidden lg:block w-full">
            <Reveal delay={300} direction="left">
              <div className="relative h-[600px] w-full">
                {/* Main Desktop App Mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] max-w-2xl animate-float">
                  <div className="glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden neon-border">
                    {/* Window Header */}
                    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="mx-auto flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-md">
                        <Lock size={10} className="text-green-400" /> production-ready-app.com
                      </div>
                    </div>
                    {/* Window Body (Code + UI concept) */}
                    <div className="p-6 bg-[#0B1120] relative overflow-hidden flex gap-6 h-[350px]">
                      <div className="w-1/2 font-mono text-sm">
                        <p className="text-pink-400 mb-2">import <span className="text-slate-300">&#123; AI, App &#125;</span> from <span className="text-green-400">&apos;@antigravity/core&apos;</span>;</p>
                        <p className="text-indigo-400 mb-2">const <span className="text-blue-300">buildPlatform</span> = <span className="text-purple-400">async</span> () =&gt; &#123;</p>
                        <p className="text-slate-400 ml-4 mb-1">{'// Generating Full-Stack SaaS'}</p>
                        <p className="text-slate-300 ml-4 mb-2"><span className="text-indigo-400">await</span> AI.<span className="text-blue-300">generateBackend</span>();</p>
                        <p className="text-slate-300 ml-4 mb-2"><span className="text-indigo-400">await</span> AI.<span className="text-blue-300">deployToLiveServer</span>();</p>
                        <p className="text-purple-400">&#125;;</p>
                      </div>
                      {/* Simulated UI rendering */}
                      <div className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative z-10 shadow-lg">
                        <div className="w-full h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                        <div className="flex gap-3">
                          <div className="w-1/2 h-24 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"></div>
                          <div className="w-1/2 h-24 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"></div>
                        </div>
                        <div className="w-full h-16 bg-slate-800 rounded-lg mt-auto flex items-center px-4 gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400"><Check size={16} /></div>
                          <div className="h-2 w-24 bg-slate-700 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements (Mobile App Representation) */}
                <div className="absolute bottom-10 -left-10 w-48 animate-float-delayed z-20">
                  <div className="glass-panel p-4 rounded-3xl border border-slate-700 shadow-2xl shadow-indigo-900/50 bg-[#0f172a]/90 backdrop-blur-xl">
                    <div className="w-full h-80 border border-slate-700 rounded-2xl relative overflow-hidden bg-[#060b19]">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10"></div>
                      <div className="p-4 pt-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                          <div className="w-16 h-3 rounded-full bg-slate-800"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="w-full h-20 bg-slate-800 rounded-xl"></div>
                          <div className="w-full h-12 bg-indigo-500/20 border border-indigo-500/50 rounded-xl"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 w-full h-12 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-4">
                        <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                        <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                        <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute top-10 -right-5 z-20 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="glass-panel px-5 py-3 rounded-2xl border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Zap size={20} className="fill-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">10x Faster</p>
                      <p className="text-slate-400 text-xs">Development Speed</p>
                    </div>
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

// Mobile/tablet inline demo: starts playing when scrolled into view.
// Tries to play WITH sound first; if the browser blocks autoplay-with-sound,
// it falls back to muted playback and shows a "tap for sound" overlay.

function MobileDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const triedAutoplay = useRef(false);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!triedAutoplay.current) {
            triedAutoplay.current = true;
            // First attempt: play with sound.
            video.muted = false;
            video.play().then(() => {
              setMuted(false);
              setNeedsTap(false);
            }).catch(() => {
              // Browser blocked autoplay with sound — fall back to muted.
              video.muted = true;
              setMuted(true);
              setNeedsTap(true);
              video.play().catch(() => { });
            });
          } else {
            // Resume on re-entry, respecting the current mute state.
            video.play().catch(() => { });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      setMuted(false);
      setNeedsTap(false);
      video.play().catch(() => { });
    } else {
      video.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700 neon-border bg-black shadow-2xl">
      <video
        ref={videoRef}
        src={DEMO_VIDEO_SRC}
        className="w-full h-auto block"
        playsInline
        loop
        controls
        preload="none"
      />

      {/* Always-visible sound toggle */}
      <button
        onClick={toggleSound}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* "Tap for sound" prompt when autoplay-with-sound was blocked */}
      {needsTap && muted && (
        <button
          onClick={toggleSound}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse"
        >
          <Volume2 size={16} /> Tap for sound
        </button>
      )}
    </div>
  );
}

export function CurriculumJourney() {
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
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
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
          <div className="absolute left-6 md:left-[2.1rem] top-8 bottom-8 w-1 bg-gradient-to-b from-cyan-500 via-indigo-500 to-purple-500 opacity-30 rounded-full hidden sm:block"></div>

          <div className="space-y-6">
            {modules.map((mod, idx) => (
              <Reveal key={idx} delay={idx * 50} direction="up">
                <div className="relative sm:pl-20">
                  {/* Timeline Node/Dot */}
                  <div className="absolute left-0 md:left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-4 border-indigo-500 z-10 shadow-[0_0_10px_rgba(99,102,241,0.6)] hidden sm:block"></div>

                  <Accordion title={mod.title} level={idx + 1} icon={mod.icon} defaultOpen={idx === 0}>
                    <ul className="space-y-3 mt-4">
                      {mod.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:border-cyan-500 group-hover/item:bg-cyan-500/10 group-hover/item:text-cyan-400 transition-all duration-300">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-slate-300 group-hover/item:text-white transition-colors">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={100} direction="up">
          <div className="mt-14 relative overflow-hidden rounded-3xl glass-panel neon-border p-8 md:p-10">
            <div className="absolute -top-1/3 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 border border-cyan-500/30 text-cyan-300 flex-shrink-0">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
                  মনে কি প্রশ্ন জাগছে — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">&ldquo;এত কিছু মাত্র ৳৯৯০ টাকায় কীভাবে সম্ভব?&rdquo;</span>
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

export function CtaBanner({ headline, sub }: { headline: ReactNode; sub: string }) {
  const { openEnroll } = useEnroll();
  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="glass-panel neon-border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-4xl font-black text-white mb-3">{headline}</h3>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">{sub}</p>
              <button
                onClick={openEnroll}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all group cursor-pointer"
              >
                <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
                এখনই Enroll করুন — ৳990
              </button>
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-4 py-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-sm animate-float">🛡️</span>
                <span className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">৭ দিনের মানি-ব্যাক গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PricingNeon() {
  const { openEnroll } = useEnroll();
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Unlock Your <GradientText>Superpower</GradientText>
            </h2>
            <p className="text-lg text-slate-400">
              মাসে মাসে কোনো ফি নেই। একবার পেমেন্ট করুন, লাইফটাইম এক্সেস নিন।
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="bg-[#0f172a] rounded-[2rem] p-1 shadow-[0_0_40px_rgba(99,102,241,0.2)] relative max-w-lg mx-auto transform transition-all hover:scale-[1.02] neon-border">

            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 opacity-30 blur-sm"></div>

            {/* Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-black shadow-[0_0_15px_rgba(34,211,238,0.5)] uppercase tracking-wider flex items-center gap-2 z-20 animate-float">
              <Sparkles size={16} /> Early Bird Action
            </div>

            <div className="bg-slate-900 rounded-[30px] p-8 md:p-10 text-center h-full flex flex-col relative z-10 overflow-hidden">
              <h3 className="text-2xl font-bold text-white mb-2">Zero to Production Masterclass</h3>
              <p className="text-slate-400 mb-8 text-sm">No monthly fees. 100% Free Tools Taught.</p>

              <div className="mb-6 flex items-end justify-center gap-3">
                <span className="text-2xl text-slate-500 line-through font-bold">৳5000</span>
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight drop-shadow-sm">৳990</span>
              </div>

              <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left">
                <Zap size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-amber-100/90">
                  <span className="font-bold text-amber-300">যেকোনো সময় দাম বাড়তে পারে।</span> দাম বেড়ে যাওয়ার আগেই আপনার সিটটি নিশ্চিত করুন।
                </p>
              </div>

              <ul className="text-left space-y-4 mb-10 flex-grow">
                {[
                  "৮টি মডিউল — জিরো থেকে লাইভ অ্যাপ পর্যন্ত",
                  "ওয়েবসাইট + মোবাইল অ্যাপ (Play Store ও App Store)",
                  "রিয়েল প্রজেক্টের সোর্স কোড (GitHub)",
                  "প্রাইভেট কমিউনিটি সাপোর্ট",
                  "AI Prompts সিক্রেট লাইব্রেরি",
                  "লাইফটাইম এক্সেস আর আপডেট"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="bg-cyan-500/20 p-1 rounded-full flex-shrink-0">
                      <Check className="text-cyan-400" size={14} strokeWidth={3} />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={openEnroll} className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer">
                Start Mission Now
              </button>
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left">
                <span className="text-lg leading-none mt-0.5">🛡️</span>
                <div>
                  <p className="text-sm font-bold text-emerald-300">৭ দিনের মানি-ব্যাক গ্যারান্টি</p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-100/90">
                    কোর্স শুরু করুন নিশ্চিন্তে। ৭ দিনের মধ্যে যদি মনে হয় এটা আপনার জন্য নয় — কোনো প্রশ্ন ছাড়াই পুরো টাকা ফেরত।
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-2">
                <Lock size={14} /> Secure Payment System
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FAQDark() {
  const faqs = [
    {
      q: "আমি তো কোডিং পারি না, আমি কি পারবো?",
      a: "বেসিক লজিক বুঝলে আর শেখার আগ্রহ থাকলে অবশ্যই পারবেন। পুরো কোর্সটাই বিগিনারদের কথা মাথায় রেখে সাজানো, যেখানে AI আপনার Assistant Programmer হয়ে পাশে থাকবে।"
    },
    {
      q: "কোর্স করতে কি টাকা দিয়ে AI টুল কিনতে হবে?",
      a: "না। আমরা পুরো প্রজেক্ট দাঁড় করাবো সম্পূর্ণ ফ্রি টুল দিয়ে — Gemini, Claude Code, AntiGravity আর Cursor-এর ফ্রি ভার্সন। বাড়তি কোনো খরচ নেই।"
    },
    {
      q: "ওয়েবসাইট আর মোবাইল অ্যাপ — দুটোই কি শেখাবেন?",
      a: "হ্যাঁ। প্রথমে একটা ফুল ওয়েবসাইট বানিয়ে লাইভ সার্ভারে দেবো, তারপর সেই প্রজেক্ট থেকেই মোবাইল অ্যাপ বানিয়ে Google Play Store আর Apple App Store-এ পাবলিশ করা পর্যন্ত পুরোটা দেখানো হবে।"
    },
    {
      q: "প্রজেক্ট লাইভ করা কিভাবে শেখাবেন?",
      a: "লোকাল থেকে কোড GitHub-এ পুশ করে, সেখান থেকে VPS বা AWS-এর মতো লাইভ সার্ভারে ডিপ্লয় করা পর্যন্ত — পুরোটা হাতে-কলমে দেখানো হবে।"
    },
    {
      q: "ওয়েবসাইট কি হ্যাক হয়ে যেতে পারে? সিকিউরিটি শেখাবেন?",
      a: "হ্যাঁ। একটা পুরো লেসনে দেখানো হবে কিভাবে Claude Code দিয়ে নিজের অ্যাপের দুর্বলতা খুঁজে বের করে ফিক্স করতে হয় — যাতে লাইভ করার আগেই অ্যাপটা সিকিউর থাকে।"
    },
    {
      q: "কোর্সটি কি লাইভ নাকি রেকর্ডেড?",
      a: "কোর্সটি হাই-কোয়ালিটি রেকর্ডেড ভিডিওতে তৈরি, যাতে নিজের সময়মতো শিখতে পারেন। আর কোথাও আটকে গেলে প্রাইভেট কমিউনিটি সাপোর্ট তো আছেই।"
    },
    {
      q: "এত প্রিমিউম কোর্স এত কম দামে কেন?",
      a: "খুবই যৌক্তিক প্রশ্ন! বাজারে যেখানে নরমাল কোর্সের দাম ৫ থেকে ১০ হাজার টাকা, সেখানে আমরা এত কম দামে কেন নিচ্ছি — এটার কারণ একটাই, সবার জন্য এক্সেসিবল করা। আমরা চাই সিএসই ডিগ্রি বা মোটা অঙ্কের টাকা না থাকা সত্ত্বেও দেশের যেকোনো প্রান্ত থেকে একজন তরুণ যেন মাত্র ১-২ মাসে মডার্ন টেকনোলজিতে নিজের ক্যারিয়ার গড়তে পারে। টাকার জন্য শিখতে পারি নাই — এমন যেন কোনো কারণ না হয়ে দাঁড়ায়।"
    }
  ];

  return (
    <section id="faq" className="py-24 border-t border-slate-800/50 bg-[#060b19]">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              System <GradientText>Queries</GradientText> (FAQ)
            </h2>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <Accordion title={faq.q} level="Q">
                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
              </Accordion>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
