import { Sparkles } from 'lucide-react';
import { Reveal, EnrollButton } from '../../LandingClient';
import type { OutcomeItem } from '../content';

export function Outcomes({ heading, sub, items }: { heading: string; sub: string; items: OutcomeItem[] }) {
  return (
    <section id="learn" className="py-24 relative overflow-hidden border-t border-slate-800/50 bg-[#060b19]">
      <div
        className="absolute right-1/4 top-1/4 w-80 h-80 rounded-full blur-[110px] pointer-events-none"
        style={{ background: 'rgb(var(--seg-accent) / 0.1)' }}
      ></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border"
              style={{
                background: 'rgb(var(--seg-accent) / 0.2)',
                color: 'rgb(var(--seg-accent))',
                borderColor: 'rgb(var(--seg-accent) / 0.3)',
                boxShadow: '0 0 20px rgb(var(--seg-accent) / 0.2)',
              }}
            >
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              {heading}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {sub}
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((o, i) => (
            <Reveal
              key={i}
              delay={(i % 2) * 100}
              direction={i % 2 === 0 ? 'right' : 'left'}
              className={i === items.length - 1 ? 'md:col-span-2' : ''}
            >
              <div className="glass-panel p-7 rounded-2xl border border-slate-800 hover:border-[rgb(var(--seg-accent)/0.5)] hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="flex items-start gap-5">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:bg-[rgb(var(--seg-accent)/0.1)] group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_15px_rgb(var(--seg-accent)/0.3)]"
                    style={{ color: 'rgb(var(--seg-accent))' }}
                  >
                    <o.icon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono font-bold" style={{ color: 'rgb(var(--seg-accent) / 0.8)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-slate-800 group-hover:bg-[rgb(var(--seg-accent)/0.3)] transition-colors"></span>
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
