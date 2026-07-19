import { X, Check } from 'lucide-react';
import { Reveal, GradientText } from '../../LandingClient';
import type { PainPoint } from '../content';

export function PainPoints({ heading, items }: { heading: string; items: PainPoint[] }) {
  return (
    <section className="py-24 relative overflow-hidden border-t border-slate-800/50 bg-[#060b19]">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-black mb-14 text-white text-center">
            <GradientText>{heading}</GradientText>
          </h2>
        </Reveal>
        <div className="space-y-5">
          {items.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="grid md:grid-cols-2 gap-4 items-stretch">
                <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-start gap-3">
                  <X size={20} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-relaxed [text-wrap:pretty]">{p.pain}</p>
                </div>
                <div className="rounded-2xl border p-5 flex items-start gap-3"
                  style={{ borderColor: 'rgb(var(--seg-accent) / 0.4)', background: 'rgb(var(--seg-accent) / 0.06)' }}>
                  <Check size={20} className="shrink-0 mt-0.5" style={{ color: 'rgb(var(--seg-accent))' }} />
                  <p className="text-slate-100 font-medium leading-relaxed [text-wrap:pretty]">{p.flip}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
