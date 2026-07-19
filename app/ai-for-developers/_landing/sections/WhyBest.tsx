import { Reveal, GradientText, EnrollButton } from '../../LandingClient';
import type { ValueItem } from '../content';

export function WhyBest({ heading, items }: { heading: string; items: ValueItem[] }) {
  return (
    <section className="py-24 relative border-t border-slate-800/50 bg-[#060b19]">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              <GradientText>{heading}</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-6">
          {items.map((v, i) => (
            <Reveal key={i} delay={i * 100} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group border border-slate-800 hover:border-[rgb(var(--seg-accent)/0.5)] h-full">
                <div
                  className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 group-hover:bg-[rgb(var(--seg-accent)/0.1)] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_15px_rgb(var(--seg-accent)/0.3)]"
                  style={{ color: 'rgb(var(--seg-accent))' }}
                >
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
