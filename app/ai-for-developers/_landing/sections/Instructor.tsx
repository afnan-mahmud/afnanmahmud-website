import { Code2, Globe, Briefcase, Store, Zap } from 'lucide-react';
import { Reveal } from '../../LandingClient';
import type { IconType } from '../content';

// Invariant across all segments — same instructor profile & ventures for every audience.
export function Instructor() {
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
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[rgb(var(--seg-accent-2)/0.1)] to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/3">
            <Reveal direction="right">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] rounded-3xl translate-x-3 translate-y-3 opacity-30 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500 neon-border"></div>
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
              <h2 className="font-bold tracking-widest uppercase mb-2" style={{ color: 'rgb(var(--seg-accent))' }}>Meet Your Mentor</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-6 text-white">Afnan Mahmud</h3>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                দীর্ঘদিন ধরে MERN Stack-এ প্রোডাকশন-গ্রেড অ্যাপ বানাচ্ছি, রিয়েল ক্লায়েন্ট প্রজেক্ট ডেলিভার করছি। এখন AI কে ব্যবহার করে সবচেয়ে দ্রুত আর স্মার্ট ওয়েতে ওয়েব বা মোবাইল App বানানো যায় — ঠিক যেটা আমি নিজে Everyday করি, সেটাই এই কোর্সে শেয়ার করবো। শুধু থিওরি নয়, পুরোটাই স্ক্রিন শেয়ার করে আপনাদের ধরে ধরে বুজিয়ে দেয়া হবে প্রতিটি স্টেপ।
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-[rgb(var(--seg-accent)/0.3)] transition-colors">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center" style={{ color: 'rgb(var(--seg-accent))' }}>
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Full-Stack Engineer</h4>
                    <p className="text-xs text-slate-400">Building real apps</p>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-[rgb(var(--seg-accent-2)/0.3)] transition-colors">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center" style={{ color: 'rgb(var(--seg-accent-2))' }}>
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
                <h4 className="font-bold tracking-widest uppercase mb-5 text-sm" style={{ color: 'rgb(var(--seg-accent))' }}>Founder & Builder Of</h4>
                <div className="grid sm:grid-cols-2 gap-5">
                  {ventures.map((v) => (
                    <div
                      key={v.name}
                      className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-[rgb(var(--seg-accent-2)/0.4)] hover:-translate-y-1 transition-all duration-300 flex gap-4 h-full"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0" style={{ color: 'rgb(var(--seg-accent))' }}>
                        <v.icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-white leading-tight">{v.name}</h5>
                          <span className="text-[10px] uppercase tracking-wide font-bold rounded-full px-2 py-0.5 border" style={{ color: 'rgb(var(--seg-accent))', background: 'rgb(var(--seg-accent) / 0.1)', borderColor: 'rgb(var(--seg-accent) / 0.3)' }}>{v.role}</span>
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
