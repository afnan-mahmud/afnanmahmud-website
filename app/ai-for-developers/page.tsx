'use client';

import { useState, useEffect, useRef, type ReactNode, type ComponentType } from 'react';
import {
  CheckCircle2, XCircle, ChevronDown, Play, Code, Code2, Sparkles, Cpu, Layers, Zap,
  Star, Brain, Terminal, Rocket, Check,
  Briefcase, Globe, Lock, Target, Trophy, MonitorPlay,
  Send, AtSign, Mail, Layout, Smartphone, Server,
  Volume2, VolumeX, X
} from 'lucide-react';
import EnrollModal from './EnrollModal';
import { trackPixel } from '@/lib/meta-pixel';

type IconType = ComponentType<{ size?: number | string; className?: string }>;

const COURSE_SLUG = 'ai-for-developers';
const COURSE_PRICE = 990;
const DEMO_VIDEO_SRC = '/course-demo.mp4';

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

// --- REUSABLE COMPONENTS ---

type RevealProps = {
  children?: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
};

const Reveal = ({ children, delay = 0, direction = 'up' }: RevealProps) => {
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
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${getTransform()}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </div>
  );
};

const GradientText = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
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

export default function AiForDevelopersPage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const openEnroll = () => setEnrollOpen(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = () => setDemoOpen(true);

  useEffect(() => {
    // Meta ViewContent for the landing course.
    trackPixel('ViewContent', {
      value: COURSE_PRICE,
      currency: 'BDT',
      content_ids: [COURSE_SLUG],
      content_name: 'AI for Developers',
      content_type: 'product',
    });
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{globalStyles}</style>

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />
      <VideoDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* Dark Cyber Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]"></div>
      </div>

      <Navbar onEnroll={openEnroll} />

      <main className="relative z-10">
        <HeroSection onEnroll={openEnroll} onWatchDemo={openDemo} />
        <TechStackStrip />
        <GamifiedStats />
        <PainPointSection />
        <WhyAIWorkflow />
        <CtaBanner
          onEnroll={openEnroll}
          headline={<>পুরোনো নিয়মে আর কত? <GradientText>Smart way</GradientText>-তে শুরু করুন।</>}
          sub="একটাবার AI-first ওয়েতে কাজ করা শিখে গেলে আর পিছনে তাকাতে হবে না। আজই জার্নিটা শুরু করুন।"
        />
        <CurriculumJourney />
        <DevStack />
        <CtaBanner
          onEnroll={openEnroll}
          headline={<>জিরো থেকে <GradientText>লাইভ অ্যাপ</GradientText> — পুরোটা একসাথে।</>}
          sub="৮টি মডিউল, একটা রিয়েল প্রজেক্ট, ওয়েবসাইট থেকে মোবাইল অ্যাপ পর্যন্ত। লাইফটাইম এক্সেস, একবারের পেমেন্টে।"
        />
        <TargetAudience />
        <InstructorProfile />
        <PricingNeon onEnroll={openEnroll} />
        <FAQDark />
      </main>

      <FooterDark />
    </div>
  );
}

// --- PAGE SECTIONS ---

function Navbar({ onEnroll }: { onEnroll: () => void }) {
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <Terminal size={18} />
          </div>
          <span className="text-white">Afnan <GradientText>Mahmud</GradientText></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#journey" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Journey</a>
          <a href="#instructor" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Instructor</a>
          <a href="#faq" className="hover:text-cyan-400 hover:-translate-y-0.5 transition-all">FAQ</a>
        </div>
        <div>
          <button onClick={onEnroll} className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-95 inline-block cursor-pointer">
            Start Mission
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onEnroll, onWatchDemo }: { onEnroll: () => void; onWatchDemo: () => void }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden border-b border-slate-800/50 min-h-[90vh] flex items-center">
      {/* Cyberpunk Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{animationDelay: '1s'}}></div>

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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white">
                AI দিয়ে সম্পূর্ণ <GradientText>Custom Website</GradientText> <br className="hidden md:block"/>
                and Mobile App বানান।
              </h1>
            </Reveal>

            <Reveal delay={300} direction="right">
              <p className="max-w-xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                AntiGravity, Gemini, এবং Claude Code ব্যবহার করে <span className="text-white font-bold">সম্পূর্ণ ফ্রি টুলস দিয়ে</span> জিরো থেকে প্রোডাকশন গ্রেড ডেভেলপমেন্ট শিখুন। এই কোর্স শেষে আপনি যেকোনো কোম্পানিতে <strong className="text-indigo-400">Software Engineer হিসেবে জব</strong> করতে পারবেন এবং ক্লায়েন্টের <strong className="text-pink-400">Existing বা New</strong> যেকোনো প্রজেক্ট অনায়াসে হ্যান্ডেল করতে পারবেন।
              </p>
            </Reveal>

            <Reveal delay={400} direction="right">
              {/* Mobile/tablet: inline auto-playing demo video above the Enroll button */}
              <div className="lg:hidden mb-6">
                <MobileDemoVideo />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <button onClick={onEnroll} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                  <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20}/>
                  Enroll Now - ৳990
                </button>
                {/* Desktop only: opens the demo video in a modal */}
                <button onClick={onWatchDemo} className="hidden lg:flex w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold text-lg hover:bg-white/5 hover:-translate-y-1 active:scale-95 transition-all items-center justify-center gap-2 group border-slate-700 cursor-pointer">
                  <Play size={20} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  Watch Demo
                </button>
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
                      <Lock size={10} className="text-green-400"/> production-ready-app.com
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
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400"><Check size={16}/></div>
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
              <div className="absolute top-10 -right-5 z-20 animate-float" style={{animationDelay: '1s'}}>
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
              video.play().catch(() => {});
            });
          } else {
            // Resume on re-entry, respecting the current mute state.
            video.play().catch(() => {});
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
      video.play().catch(() => {});
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
        preload="metadata"
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

// Desktop demo: video plays inside a modal opened by the "Watch Demo" button.
// Because it's opened by a click (a user gesture), it plays with sound.
function VideoDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm"
      style={{ animation: 'modalFade 0.2s ease' }}
    >
      <div
        className="relative w-full max-w-4xl"
        style={{ animation: 'modalSlideIn 0.22s ease' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <video
          ref={videoRef}
          src={DEMO_VIDEO_SRC}
          className="w-full h-auto rounded-2xl border border-slate-700 neon-border bg-black"
          controls
          playsInline
          preload="auto"
        />
      </div>
    </div>
  );
}

function TechStackStrip() {
  const tools: { name: string; icon: IconType }[] = [
    { name: "Cursor IDE", icon: Terminal },
    { name: "Gemini Pro", icon: Brain },
    { name: "AntiGravity", icon: Code },
    { name: "Claude Code", icon: Cpu },
    { name: "React", icon: Layout },
    { name: "GitHub", icon: Globe },
    { name: "Live Server", icon: Server },
    { name: "Mobile App", icon: Smartphone },
  ];

  return (
    <div className="border-y border-slate-800/50 bg-[#060b19]/80 backdrop-blur-md py-6 relative z-10 overflow-hidden flex">
      <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#020617] to-transparent z-20"></div>
      <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#020617] to-transparent z-20"></div>

      <div className="flex w-[200%] animate-marquee">
        {[...tools, ...tools, ...tools].map((tool, idx) => (
          <div key={idx} className="flex items-center gap-3 mx-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <tool.icon size={24} className="text-indigo-400" />
            <span className="font-bold text-slate-300 text-lg whitespace-nowrap tracking-wide">{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GamifiedStats() {
  return (
    <Reveal>
      <div className="relative z-10 mt-12 max-w-5xl mx-auto px-4">
        <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 neon-border shadow-2xl shadow-black">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="coder" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                500+
              </div>
            </div>
            <div>
              <p className="text-white font-bold">People&apos;s Enrolled</p>
              <div className="flex items-center text-amber-400 text-sm gap-1">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <span className="text-slate-400 ml-1">(4.9/5)</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-slate-700"></div>

          <div className="flex items-center gap-6 sm:gap-10">
            <div className="text-center">
              <Brain className="mx-auto mb-2 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gemini Pro</p>
            </div>
            <div className="text-center">
              <Terminal className="mx-auto mb-2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AntiGravity</p>
            </div>
            <div className="text-center">
              <Code className="mx-auto mb-2 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Claude Code</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

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
              কোর্স কিনছেন, ঘণ্টার পর ঘণ্টা ভিডিও দেখছেন — কিন্তু নিজে বানাতে গেলেই মাথা ফাঁকা। দোষটা আপনার না, দোষটা পুরোনো নিয়মে শেখার।
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
                <XCircle size={24} /> The Old Way (Tutorial Hell)
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> ঘণ্টার পর ঘণ্টা টিউটোরিয়াল দেখেও মনে কিছুই থাকে না।</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> সিনট্যাক্স মুখস্থ করতে গিয়ে আসল লজিকটাই ভুলে যাওয়া।</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> একটা Error-এর সমাধান খুঁজতে গিয়ে পুরো দিন শেষ।</li>
                <li className="flex gap-3"><span className="text-red-500 font-bold mt-1">✗</span> প্রজেক্ট শেষ হওয়ার আগেই আগ্রহটা হারিয়ে ফেলা।</li>
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
                <CheckCircle2 size={24} /> The Modern AI Way
              </h3>
              <ul className="space-y-4 text-slate-200">
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> AI-কে আপনার Assistant Programmer বানিয়ে কাজ করা।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> কোড মুখস্থ নয়, Architecture আর Logic-এ ফোকাস করা।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> Gemini আর Claude দিয়ে সেকেন্ডেই Error সলভ করা।</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold mt-1">✓</span> কয়েক সপ্তাহেই পুরো প্রোডাকশন-গ্রেড অ্যাপ দাঁড় করানো।</li>
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

function CurriculumJourney() {
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
        "Vercel/Render এ ফ্রি live server এ deploy",
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

function CtaBanner({ onEnroll, headline, sub }: { onEnroll: () => void; headline: ReactNode; sub: string }) {
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
                onClick={onEnroll}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all group cursor-pointer"
              >
                <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
                এখনই Enroll করুন — ৳990
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TargetAudience() {
  const audiences: { title: string; icon: IconType; desc: string }[] = [
    {
      title: "নতুন প্রোগ্রামার",
      icon: Brain,
      desc: "কোডিং-এর বেসিক জানেন, কিন্তু একা একটা পুরো প্রজেক্ট দাঁড় করাতে পারেন না।"
    },
    {
      title: "বর্তমান ওয়েব ডেভেলপার",
      icon: Code,
      desc: "আগে থেকেই কোড করেন, এখন AI দিয়ে কাজের গতি ১০ গুণ বাড়াতে চান।"
    },
    {
      title: "ক্যারিয়ার সুইচার",
      icon: Briefcase,
      desc: "অন্য পেশা থেকে টেক-এ এসে দ্রুত ইন্ডাস্ট্রিতে ঢুকতে চান।"
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

function PricingNeon({ onEnroll }: { onEnroll: () => void }) {
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
              <Sparkles size={16}/> Early Bird Action
            </div>

            <div className="bg-slate-900 rounded-[30px] p-8 md:p-10 text-center h-full flex flex-col relative z-10 overflow-hidden">
              <h3 className="text-2xl font-bold text-white mb-2">Zero to Production Masterclass</h3>
              <p className="text-slate-400 mb-8 text-sm">No monthly fees. 100% Free Tools Taught.</p>

              <div className="mb-8 flex items-end justify-center gap-3">
                <span className="text-2xl text-slate-500 line-through font-bold">৳5000</span>
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight drop-shadow-sm">৳990</span>
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

              <button onClick={onEnroll} className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer">
                Start Mission Now
              </button>
              <p className="text-xs text-slate-500 mt-5 flex items-center justify-center gap-2">
                <Lock size={14} /> Secure Payment System
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQDark() {
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
      a: "লোকাল থেকে কোড GitHub-এ পুশ করে, সেখান থেকে একদম ফ্রিতে Vercel বা Render-এর মতো লাইভ সার্ভারে ডিপ্লয় করা পর্যন্ত — পুরোটা হাতে-কলমে দেখানো হবে।"
    },
    {
      q: "ওয়েবসাইট কি হ্যাক হয়ে যেতে পারে? সিকিউরিটি শেখাবেন?",
      a: "হ্যাঁ। একটা পুরো লেসনে দেখানো হবে কিভাবে Claude Code দিয়ে নিজের অ্যাপের দুর্বলতা খুঁজে বের করে ফিক্স করতে হয় — যাতে লাইভ করার আগেই অ্যাপটা সিকিউর থাকে।"
    },
    {
      q: "কোর্সটি কি লাইভ নাকি রেকর্ডেড?",
      a: "কোর্সটি হাই-কোয়ালিটি রেকর্ডেড ভিডিওতে তৈরি, যাতে নিজের সময়মতো শিখতে পারেন। আর কোথাও আটকে গেলে প্রাইভেট কমিউনিটি সাপোর্ট তো আছেই।"
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

function FooterDark() {
  return (
    <footer className="bg-[#020617] text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-black text-2xl text-white mb-6 hover:opacity-80 transition-opacity cursor-pointer inline-flex">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <Terminal size={18} />
            </div>
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
            <li><a href="#" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
            <li><a href="#" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-900 text-center text-sm relative z-10 text-slate-600">
        <p>&copy; {new Date().getFullYear()} Afnan Mahmud. System Online.</p>
      </div>
    </footer>
  );
}
