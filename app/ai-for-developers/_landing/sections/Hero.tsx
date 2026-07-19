import Link from 'next/link';
import { Rocket, MonitorPlay } from 'lucide-react';
import { Reveal, GradientText, EnrollButton } from '../../LandingClient';
import type { HeroContent } from '../content';

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden border-b border-slate-800/50 min-h-[85vh] flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-3xl">
          <Reveal delay={200} direction="right">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 leading-[1.1] text-white">
              {content.headlineLead}{' '}
              <GradientText>{content.headlineAccent}</GradientText>
              {content.headlineTrail ? <> {content.headlineTrail}</> : null}
            </h1>
          </Reveal>
          <Reveal delay={300} direction="right">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 leading-snug text-slate-200">
              {content.subheadline}
            </p>
          </Reveal>
          <Reveal delay={400} direction="right">
            <p className="mt-5 max-w-2xl text-[15px] sm:text-base md:text-lg text-slate-300/90 leading-relaxed sm:leading-loose tracking-wide [text-wrap:pretty] border-l-2 pl-4 sm:pl-5" style={{ borderColor: 'rgb(var(--seg-accent) / 0.4)' }}>
              {content.bodyCopy}
            </p>
          </Reveal>
          <Reveal delay={500} direction="right">
            <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
              <Rocket size={16} style={{ color: 'rgb(var(--seg-accent))' }} />
              <span>এই কোর্সে ভর্তি হয়ে আজই শুরু করুন — মাত্র ৳৯৯০</span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <EnrollButton />
              <Link
                href="/ai-for-developers/demo"
                className="group relative inline-flex rounded-xl p-[2px] shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
                style={{ backgroundImage: 'linear-gradient(to right, rgb(var(--seg-accent)), rgb(var(--seg-accent-2)))' }}
              >
                <span className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-slate-950 px-8 py-4 text-white font-bold text-lg group-hover:bg-slate-900 transition-colors">
                  <MonitorPlay size={20} style={{ color: 'rgb(var(--seg-accent))' }} />
                  ডেমো ক্লাস দেখুন
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
