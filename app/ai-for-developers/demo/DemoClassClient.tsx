'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Terminal, Rocket, ArrowLeft, PlayCircle, Lock, Clock } from 'lucide-react';
import EnrollModal from '../EnrollModal';
import VdoPlayer from '@/components/VdoPlayer';
import { trackCustomPixel } from '@/lib/meta-pixel';
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';

const COURSE_SLUG = 'ai-for-developers';

export interface DemoClassItem {
  id: string;
  title: string;
  description: string;
  videoId: string;
  durationLabel: string;
}

const globalStyles = `
  html { scroll-behavior: smooth; background-color: #020617; }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  .animate-pulse-glow { animation: pulseGlow 5s ease-in-out infinite; }
  .neon-border { box-shadow: 0 0 15px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1); }
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

const GradientText = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 ${className}`}>
    {children}
  </span>
);

export default function DemoClassClient({
  courseTitle,
  price,
  demoClasses,
}: {
  courseTitle: string;
  price: number;
  demoClasses: DemoClassItem[];
}) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const openEnroll = () => setEnrollOpen(true);
  const fired = useRef(false);

  useEffect(() => {
    // ViewDemoClass custom event — pixel + CAPI share one eventId for dedup.
    // Build a retargetable audience of demo-page visitors.
    if (fired.current) return;
    fired.current = true;

    const eventId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2);

    trackCustomPixel(
      'ViewDemoClass',
      { content_ids: [COURSE_SLUG], content_name: courseTitle, content_type: 'product' },
      eventId
    );

    pushToDataLayer(GTM_EVENT.viewDemoClass, {
      content_id: COURSE_SLUG,
      content_name: courseTitle,
      event_id: eventId,
    });

    fetch('/api/track/view-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, contentId: COURSE_SLUG, contentName: courseTitle }),
      keepalive: true,
    }).catch(() => {});
  }, [courseTitle]);

  return (
    <div className="min-h-screen font-sans bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{globalStyles}</style>

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/ai-for-developers" className="flex items-center gap-2 font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <Terminal size={18} />
            </div>
            <span className="text-white">Afnan <GradientText>Mahmud</GradientText></span>
          </Link>
          <button onClick={openEnroll} className="bg-white hover:bg-slate-200 text-slate-900 px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-95 cursor-pointer">
            Enroll — ৳{price}
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <Link href="/ai-for-developers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-6">
            <ArrowLeft size={16} /> কোর্স পেজে ফিরে যান
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 bg-cyan-500/10 border border-cyan-500/30">
            <PlayCircle size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Free Demo Classes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.15] text-white">
            এনরোল করার আগেই <GradientText>ডেমো ক্লাস</GradientText> দেখুন
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 leading-relaxed">
            নিচের ফ্রি ক্লাসগুলো দেখে নিজেই বুঝে নিন টিচিং স্টাইল কেমন। ভালো লাগলে এক ক্লিকেই এনরোল করে পুরো কোর্স আনলক করুন।
          </p>
        </div>

        {/* Demo class list */}
        {demoClasses.length === 0 ? (
          <div className="rounded-3xl glass-panel border border-slate-700 p-12 text-center text-slate-400">
            <Lock className="mx-auto mb-4 text-slate-600" size={32} />
            ডেমো ক্লাস খুব শীঘ্রই যোগ করা হবে। এর মধ্যে পুরো কোর্সে এনরোল করতে পারেন।
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {demoClasses.map((demo, i) => (
              <div key={demo.id} className="rounded-3xl glass-panel border border-slate-700 overflow-hidden neon-border">
                {/* 16:9 player */}
                <div className="relative w-full bg-black" style={{ aspectRatio: '16 / 9' }}>
                  <VdoPlayer
                    videoId={demo.videoId}
                    title={demo.title}
                    onReady={() =>
                      pushToDataLayer(GTM_EVENT.demoClassReady, {
                        content_id: COURSE_SLUG,
                        content_name: courseTitle,
                      })
                    }
                  />
                </div>
                <div className="p-5 md:p-7">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-black">
                      {i + 1}
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-white leading-snug flex-1">{demo.title}</h2>
                    {demo.durationLabel && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1">
                        <Clock size={12} /> {demo.durationLabel}
                      </span>
                    )}
                  </div>
                  {demo.description && (
                    <p className="text-sm md:text-base text-slate-400 leading-relaxed">{demo.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 neon-border p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            ডেমো ভালো লেগেছে? <GradientText>পুরো কোর্স আনলক করুন।</GradientText>
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 mb-8 leading-relaxed">
            ৮টি মডিউল, একটা রিয়েল প্রজেক্ট, ওয়েবসাইট থেকে মোবাইল অ্যাপ পর্যন্ত — লাইফটাইম এক্সেস, একবারের পেমেন্টে।
          </p>
          <button
            onClick={openEnroll}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 transition-all inline-flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
            Enroll Now — ৳{price}
          </button>
          <p className="text-xs text-slate-500 mt-5 flex items-center justify-center gap-1.5">
            <Lock size={13} /> Secure payment। পেমেন্টের পরে এই নম্বর দিয়ে login করতে পারবেন।
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-800/50 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Afnan Mahmud. All rights reserved.
      </footer>
    </div>
  );
}
