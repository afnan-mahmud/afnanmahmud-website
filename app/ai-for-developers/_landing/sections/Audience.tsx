import { Reveal, GradientText } from '../../LandingClient';
import type { AudienceItem } from '../content';

export function Audience({ heading, items }: { heading: string; items: AudienceItem[] }) {
  return (
    <section className="py-24 border-y border-slate-800/50 bg-[#060b19] relative overflow-hidden">
      <div
        className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-[100px]"
        style={{ background: 'rgb(var(--seg-accent) / 0.1)' }}
      ></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              <GradientText>{heading}</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((aud, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="glass-panel rounded-3xl p-8 text-center hover:bg-slate-800/50 hover:border-[rgb(var(--seg-accent)/0.3)] hover:-translate-y-2 transition-all duration-300 group h-full">
                <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:scale-110 group-hover:border-[rgb(var(--seg-accent))] group-hover:text-[rgb(var(--seg-accent))] group-hover:shadow-[0_0_20px_rgb(var(--seg-accent)/0.2)] transition-all duration-300">
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
