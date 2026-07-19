import { Rocket } from 'lucide-react';
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
            <EnrollButton className="mt-6" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
